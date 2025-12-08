import { Component, effect, inject, input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LicitacoesService, Licitacao, LicitacaoDocument, CreateLicDocDto, UpdateLicDocDto } from './licitacoes.service';
import Swal from 'sweetalert2';

type Tab = 'geral' | 'documentos';

@Component({
  standalone: true,
  selector: 'app-licitacao-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './licitacao-modal.component.html',
  styleUrls: ['./licitacao-modal.component.css'],
})
export class LicitacaoModalComponent {
  private api = inject(LicitacoesService);

  // Inputs
  licId = input<string>('');
  open = input<boolean>(false);
  initialTab = input<Tab>('geral');

  // Outputs
  @Output() closed = new EventEmitter<void>();

  // State
  tab = signal<Tab>('geral');
  loading = signal(false);
  error = signal('');
  lic = signal<Licitacao | null>(null);
  docs = signal<LicitacaoDocument[]>([]);
  
  // Document management
  showDocModal = signal(false);
  editingDoc = signal<LicitacaoDocument | null>(null);
  docForm = signal<CreateLicDocDto>({
    name: '',
    required: true,
    submitted: false,
    signed: false,
    notes: ''
  });
  docLoading = signal(false);
  docError = signal('');
  
  // File upload
  selectedFile = signal<File | null>(null);
  uploadProgress = signal(0);
  uploading = signal(false);
  
  // Edital upload
  selectedEditalFiles = signal<File[]>([]);
  uploadingEdital = signal(false);
  editalError = signal('');
  
  // AI Analysis
  analyzingWithAI = signal(false);

  constructor() {
    // sempre que open() ou licId() mudarem para um estado válido, carregue
    effect(() => {
      if (this.open() && this.licId()) {
        this.load(this.licId()!);
      }
    });
    
    // Observar mudanças no initialTab para definir a aba
    effect(() => {
      if (this.open() && this.initialTab()) {
        this.tab.set(this.initialTab());
      }
    });
  }

  setTab(t: Tab) { this.tab.set(t); }

  private load(id: string) {
    this.loading.set(true);
    this.error.set('');
    this.lic.set(null);
    this.docs.set([]);

    // carrega licitação + documentos em paralelo
    this.api.getById(id).subscribe({
      next: (d) => { this.lic.set(d); this.loading.set(false); },
      error: (e) => {
        this.loading.set(false);
        this.error.set(e?.error?.message || 'Falha ao carregar a licitação.');
      },
    });

    this.api.listDocuments(id).subscribe({
      next: (arr) => this.docs.set(arr),
      error: () => this.docs.set([]), // documentos são complementares – não bloqueia
    });
  }

  // Filtrar documentos do tipo 'edital'
  editais = computed(() => {
    return this.docs().filter(doc => doc.docType === 'edital' || doc.name.toLowerCase().includes('edital'));
  });

  statusLabel(s?: Licitacao['status']) {
    switch (s) {
      case 'draft': return 'Rascunho';
      case 'open': return 'Aberta';
      case 'closed': return 'Encerrada';
      case 'cancelled': return 'Cancelada';
      case 'awarded': return 'Adjudicada';
      default: return '—';
    }
  }

  badgeClass(s?: Licitacao['status']) {
    switch (s) {
      case 'open': return 'bg-emerald-100 text-emerald-700';
      case 'closed': return 'bg-neutral-200 text-neutral-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'awarded': return 'bg-sky-100 text-sky-700';
      default: return 'bg-neutral-100 text-neutral-700'; // draft/undefined
    }
  }

  formatSessionDate(sessionDate?: string): string {
    if (!sessionDate) return '';
    const date = new Date(sessionDate);
    if (isNaN(date.getTime())) return '';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  close() { this.closed.emit(); }

  // Document management methods
  openDocModal(doc?: LicitacaoDocument) {
    if (doc) {
      this.editingDoc.set(doc);
      this.docForm.set({
        name: doc.name,
        required: doc.required,
        submitted: doc.submitted,
        signed: doc.signed,
        notes: doc.notes || ''
      });
    } else {
      this.editingDoc.set(null);
      this.docForm.set({
        name: '',
        required: true,
        submitted: false,
        signed: false,
        notes: ''
      });
    }
    this.docError.set('');
    this.showDocModal.set(true);
  }

  closeDocModal() {
    this.showDocModal.set(false);
    this.editingDoc.set(null);
    this.docError.set('');
  }

  saveDocument() {
    if (!this.docForm().name.trim()) {
      this.docError.set('Nome do documento é obrigatório');
      return;
    }

    this.docLoading.set(true);
    this.docError.set('');

    const data = { ...this.docForm() };

    console.log('Salvando documento:', data);
    console.log('Licitação ID:', this.licId());

    const operation = this.editingDoc() 
      ? this.api.updateDocument(this.licId()!, this.editingDoc()!.id, data as UpdateLicDocDto)
      : this.api.addDocument(this.licId()!, data);

    operation.subscribe({
      next: (response) => {
        console.log('Documento salvo com sucesso:', response);
        this.docLoading.set(false);
        this.closeDocModal();
        this.loadDocuments();
      },
      error: (err) => {
        console.error('Erro ao salvar documento:', err);
        this.docLoading.set(false);
        this.docError.set(err?.error?.message || 'Erro ao salvar documento');
      }
    });
  }

  deleteDocument(doc: LicitacaoDocument) {
    if (!confirm(`Tem certeza que deseja excluir o documento "${doc.name}"?`)) {
      return;
    }

    this.api.deleteDocument(this.licId()!, doc.id).subscribe({
      next: () => {
        this.loadDocuments();
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Erro ao excluir documento');
      }
    });
  }

  loadDocuments() {
    if (!this.licId()) {
      console.log('Licitação ID não disponível');
      return;
    }
    
    console.log('Carregando documentos para licitação:', this.licId());
    
    this.api.listDocuments(this.licId()!).subscribe({
      next: (arr) => {
        console.log('Documentos carregados:', arr);
        this.docs.set(arr);
      },
      error: (err) => {
        console.error('Erro ao carregar documentos:', err);
        this.docs.set([]);
      }
    });
  }

  // File upload methods
  onFileSelected(event: Event) {
    console.log('Arquivo selecionado:', event);
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      console.log('Arquivo:', file.name, 'Tipo:', file.type, 'Tamanho:', file.size);
      
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        console.log('Tipo de arquivo não permitido:', file.type);
        this.docError.set('Tipo de arquivo não permitido. Use PDF, DOC ou DOCX.');
        return;
      }
      
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        console.log('Arquivo muito grande:', file.size);
        this.docError.set('Arquivo muito grande. Máximo 10MB.');
        return;
      }
      
      this.selectedFile.set(file);
      this.docError.set('');
      console.log('Arquivo selecionado com sucesso');
    }
  }

  uploadFile(doc: LicitacaoDocument) {
    const file = this.selectedFile();
    if (!file) {
      this.docError.set('Selecione um arquivo para upload');
      return;
    }

    this.uploading.set(true);
    this.uploadProgress.set(0);
    this.docError.set('');

    this.api.uploadDocument(this.licId()!, doc.id, file).subscribe({
      next: (response) => {
        this.uploading.set(false);
        this.uploadProgress.set(100);
        this.selectedFile.set(null);
        this.loadDocuments();
        console.log('Upload realizado com sucesso:', response);
      },
      error: (err) => {
        this.uploading.set(false);
        console.error('Erro no upload:', err);
        this.docError.set(err?.error?.message || 'Erro no upload do arquivo');
      }
    });
  }

  downloadFile(doc: LicitacaoDocument) {
    if (!doc.fileName) {
      this.docError.set('Nenhum arquivo disponível para download');
      return;
    }

    this.api.downloadDocument(this.licId()!, doc.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.fileName || 'documento';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.docError.set(err?.error?.message || 'Erro ao baixar arquivo');
      }
    });
  }

  // Edital upload methods
  onEditalFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      
      // Validar arquivos
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      const validFiles: File[] = [];
      const errors: string[] = [];
      
      files.forEach(file => {
        if (!allowedTypes.includes(file.type)) {
          errors.push(`${file.name}: Tipo de arquivo não permitido. Use PDF, DOC ou DOCX.`);
        } else if (file.size > maxSize) {
          errors.push(`${file.name}: Arquivo muito grande. Máximo 10MB.`);
        } else {
          validFiles.push(file);
        }
      });
      
      if (errors.length > 0) {
        this.editalError.set(errors.join('\n'));
        Swal.fire({
          icon: 'warning',
          title: 'Arquivos inválidos',
          text: errors.join('\n'),
          confirmButtonText: 'OK'
        });
      }
      
      if (validFiles.length > 0) {
        this.selectedEditalFiles.set([...this.selectedEditalFiles(), ...validFiles]);
        this.editalError.set('');
      }
      
      // Limpar o input para permitir selecionar o mesmo arquivo novamente
      input.value = '';
    }
  }

  removeEditalFile(index: number) {
    const files = this.selectedEditalFiles();
    files.splice(index, 1);
    this.selectedEditalFiles.set([...files]);
  }

  uploadEditais() {
    const files = this.selectedEditalFiles();
    if (files.length === 0 || !this.licId()) {
      this.editalError.set('Selecione pelo menos um arquivo');
      return;
    }

    this.uploadingEdital.set(true);
    this.editalError.set('');

    // Upload cada arquivo sequencialmente
    let uploadCount = 0;
    const totalFiles = files.length;

    const uploadNext = () => {
      if (uploadCount >= totalFiles) {
        this.uploadingEdital.set(false);
        this.selectedEditalFiles.set([]);
        this.loadDocuments();
        Swal.fire({
          icon: 'success',
          title: 'Sucesso!',
          text: `${totalFiles} edital(is) enviado(s) com sucesso!`,
          confirmButtonText: 'OK'
        });
        return;
      }

      const file = files[uploadCount];
      const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extensão
      const docName = `Edital - ${fileName}`;

      // Criar documento
      this.api.addDocument(this.licId()!, {
        name: docName,
        docType: 'edital',
        required: false,
        submitted: false,
        signed: false,
        notes: ''
      }).subscribe({
        next: (doc) => {
          // Fazer upload do arquivo
          this.api.uploadDocument(this.licId()!, doc.id, file).subscribe({
            next: () => {
              uploadCount++;
              uploadNext();
            },
            error: (err) => {
              this.uploadingEdital.set(false);
              this.editalError.set(err?.error?.message || 'Erro ao fazer upload do arquivo');
              Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: `Erro ao fazer upload de ${file.name}: ${err?.error?.message || 'Erro desconhecido'}`,
                confirmButtonText: 'OK'
              });
            }
          });
        },
        error: (err) => {
          this.uploadingEdital.set(false);
          this.editalError.set(err?.error?.message || 'Erro ao criar documento');
          Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: `Erro ao criar documento para ${file.name}: ${err?.error?.message || 'Erro desconhecido'}`,
            confirmButtonText: 'OK'
          });
        }
      });
    };

    uploadNext();
  }

  downloadEdital(doc: LicitacaoDocument) {
    if (!doc.fileName) {
      Swal.fire({
        icon: 'warning',
        title: 'Aviso',
        text: 'Nenhum arquivo disponível para download',
        confirmButtonText: 'OK'
      });
      return;
    }

    this.api.downloadDocument(this.licId()!, doc.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.fileName || 'edital';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: err?.error?.message || 'Erro ao baixar arquivo',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  deleteEdital(doc: LicitacaoDocument) {
    Swal.fire({
      title: 'Tem certeza?',
      text: `Deseja excluir o edital "${doc.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0f3d2e',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.api.deleteDocument(this.licId()!, doc.id).subscribe({
          next: () => {
            this.loadDocuments();
            Swal.fire({
              icon: 'success',
              title: 'Excluído!',
              text: 'Edital excluído com sucesso',
              confirmButtonText: 'OK'
            });
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Erro',
              text: err?.error?.message || 'Erro ao excluir edital',
              confirmButtonText: 'OK'
            });
          }
        });
      }
    });
  }

  // AI Analysis methods
  analyzeWithAI() {
    if (!this.licId()) {
      this.error.set('ID da licitação não disponível');
      return;
    }

    this.analyzingWithAI.set(true);
    this.error.set('');

    // Mostrar SweetAlert informando que a análise está sendo realizada
    Swal.fire({
      title: 'Análise em andamento',
      html: 'Estamos processando a análise da licitação com IA. Por favor, aguarde...',
      icon: 'info',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.api.analyzeWithAI(this.licId()!).subscribe({
      next: (response) => {
        this.analyzingWithAI.set(false);
        console.log('✅ Análise com IA iniciada com sucesso:', response);
        
        // Fechar o alerta de aguardo e mostrar sucesso
        Swal.close();
        Swal.fire({
          title: 'Sucesso!',
          text: 'Análise com IA iniciada com sucesso!',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      },
      error: (err) => {
        this.analyzingWithAI.set(false);
        console.error('❌ Erro ao iniciar análise com IA:', {
          status: err.status,
          statusText: err.statusText,
          error: err.error,
          message: err.message,
          url: err.url
        });
        
        // Mensagem mais específica baseada no status
        let errorMessage = 'Erro ao iniciar análise com IA';
        if (err.status === 500) {
          errorMessage = 'Erro interno do servidor n8n (500)';
        } else if (err.status === 404) {
          errorMessage = 'Webhook não encontrado (404)';
        } else if (err.status === 0) {
          errorMessage = 'Erro de conexão - verifique se o n8n está online';
        }
        
        // Fechar o alerta de aguardo e mostrar erro
        Swal.close();
        Swal.fire({
          title: 'Erro',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'OK'
        });
        
        this.error.set(errorMessage);
      }
    });
  }
}
