import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LicitacoesService, Licitacao, LicitacaoStatus, ConformidadeResponse } from '../licitacoes-list/licitacoes.service';
import { ApiService } from '../../../core/services/api.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-licitacao-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './licitacao-detail.component.html',
  styleUrls: ['./licitacao-detail.component.css']
})
export class LicitacaoDetailComponent implements OnInit {
  licitacao: Licitacao | null = null;
  conformidade: ConformidadeResponse | null = null;
  loading = false;
  error: string | null = null;
  showEditModal = false;
  showAnaliseModal = false;
  showUploadModal = false;

  // Formulário de edição
  editForm: Partial<Licitacao> = {};
  selectedEditFile: File | null = null;

  // Upload de documentos
  selectedFile: File | null = null;
  uploadForm = {
    docType: '',
    required: true,
    submitted: false,
    signed: false,
    issueDate: '',
    expiresAt: '',
    notes: '',
    file: null as any
  };

  // Status disponíveis
  statusOptions = [
    { value: 'draft', label: 'Rascunho' },
    { value: 'open', label: 'Aberta' },
    { value: 'closed', label: 'Fechada' },
    { value: 'cancelled', label: 'Cancelada' },
    { value: 'awarded', label: 'Homologada' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private licitacoesService: LicitacoesService,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadLicitacao(id);
      }
    });
  }

  loadLicitacao(id: string) {
    this.loading = true;
    this.error = null;

    console.log(`[LicitacaoDetailComponent] Carregando licitação: ${id}`);

    // Usar um companyId dummy já que o backend usa ActiveCompanyGuard
    this.licitacoesService.getLicitacao('dummy', id).subscribe({
      next: (response: any) => {
        console.log(`[LicitacaoDetailComponent] Licitação carregada:`, response);
        this.licitacao = response;
        this.conformidade = response.conformidade;
        this.loading = false;
      },
      error: (error: any) => {
        console.error(`[LicitacaoDetailComponent] Erro ao carregar licitação:`, error);
        this.error = error.message || 'Erro ao carregar licitação';
        this.loading = false;
      }
    });
  }

  openEditModal() {
    this.showEditModal = true;
    this.selectedEditFile = null;
    
    if (this.licitacao) {
      this.editForm = {
        ...this.licitacao,
        // Formatar datas para o input datetime-local
        sessionAt: this.licitacao.sessionAt ? this.formatDateForInput(this.licitacao.sessionAt) : '',
        submissionDeadline: this.licitacao.submissionDeadline ? this.formatDateForInput(this.licitacao.submissionDeadline) : '',
        // Converter saleValue para string se for Decimal
        saleValue: this.licitacao.saleValue ? this.licitacao.saleValue.toString() : ''
      };
    }
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editForm = {};
    this.selectedEditFile = null;
  }

  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  onEditFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de arquivo
      if (file.type !== 'application/pdf') {
        this.error = 'Apenas arquivos PDF são permitidos';
        return;
      }
      
      // Validar tamanho (max 20MB)
      if (file.size > 20 * 1024 * 1024) {
        this.error = 'Arquivo muito grande. Tamanho máximo: 20MB';
        return;
      }
      
      this.selectedEditFile = file;
      this.error = null;
      console.log('📄 [LicitacaoDetailComponent] Arquivo selecionado para edição:', file.name);
    }
  }

  updateLicitacao() {
    if (!this.licitacao || !this.editForm.title) {
      this.error = 'Título é obrigatório';
      return;
    }

    this.loading = true;
    this.error = null;

    console.log('📝 [LicitacaoDetailComponent] Atualizando licitação:', this.editForm);

    // Usar um companyId dummy já que o backend usa ActiveCompanyGuard
    this.licitacoesService.updateLicitacao('dummy', this.licitacao.id, this.editForm as any).subscribe({
      next: async (response: any) => {
        console.log('✅ [LicitacaoDetailComponent] Licitação atualizada:', response);
        
        // Se há um arquivo PDF selecionado, fazer upload
        if (this.selectedEditFile) {
          console.log('📄 [LicitacaoDetailComponent] Fazendo upload do PDF do edital...');
          
          try {
            const documentData = {
              docType: 'EDITAL',
              required: true,
              submitted: true,
              signed: false,
              notes: 'Edital da licitação'
            };
            
            await this.licitacoesService.uploadDocument('dummy', this.licitacao!.id, documentData, this.selectedEditFile).toPromise();
            console.log('✅ [LicitacaoDetailComponent] PDF do edital enviado com sucesso');
          } catch (uploadError) {
            console.error('❌ [LicitacaoDetailComponent] Erro ao enviar PDF:', uploadError);
            this.error = 'Licitação atualizada, mas houve erro ao enviar o PDF do edital';
          }
        }
        
        // Recarregar dados da licitação
        this.loadLicitacao(this.licitacao!.id);
        this.loading = false;
        this.closeEditModal();
      },
      error: (error: any) => {
        console.error('❌ [LicitacaoDetailComponent] Erro ao atualizar licitação:', error);
        this.error = error.message || 'Erro ao atualizar licitação';
        this.loading = false;
      }
    });
  }

  openAnaliseModal() {
    this.showAnaliseModal = true;
  }

  closeAnaliseModal() {
    this.showAnaliseModal = false;
  }

  analisarEdital() {
    if (!this.licitacao) return;

    this.loading = true;
    this.error = null;

    this.apiService.getCompanies().pipe(
      switchMap((companies: any[]) => {
        if (companies.length === 0) {
          throw new Error('Nenhuma empresa encontrada');
        }
        
        const companyData = companies[0];
        const company = companyData.company || companyData;
        const companyId = company.id;
        
        if (!companyId) {
          throw new Error('ID da empresa não encontrado');
        }

        return this.licitacoesService.analisarEdital(companyId, this.licitacao!.id, {});
      })
    ).subscribe({
      next: (result: any) => {
        this.loadLicitacao(this.licitacao!.id);
        this.closeAnaliseModal();
        this.loading = false;
      },
      error: (error: any) => {
        this.error = error.message || 'Erro ao analisar edital';
        this.loading = false;
      }
    });
  }

  deleteLicitacao() {
    if (!this.licitacao) return;

    if (!confirm('Tem certeza que deseja excluir esta licitação?')) {
      return;
    }

    this.loading = true;
    this.apiService.getCompanies().pipe(
      switchMap((companies: any[]) => {
        if (companies.length === 0) {
          throw new Error('Nenhuma empresa encontrada');
        }
        
        const companyData = companies[0];
        const company = companyData.company || companyData;
        const companyId = company.id;
        
        if (!companyId) {
          throw new Error('ID da empresa não encontrado');
        }

        return this.licitacoesService.deleteLicitacao(companyId, this.licitacao!.id);
      })
    ).subscribe({
      next: () => {
        this.router.navigate(['/licitacoes']);
        this.loading = false;
      },
      error: (error: any) => {
        this.error = error.message || 'Erro ao excluir licitação';
        this.loading = false;
      }
    });
  }

  getStatusLabel(status: LicitacaoStatus): string {
    const statusMap: { [key in LicitacaoStatus]: string } = {
      'draft': 'Rascunho',
      'open': 'Aberta',
      'closed': 'Fechada',
      'cancelled': 'Cancelada',
      'awarded': 'Homologada'
    };
    return statusMap[status] || status;
  }

  getStatusColor(status: LicitacaoStatus): string {
    const colorMap: { [key in LicitacaoStatus]: string } = {
      'draft': 'bg-gray-100 text-gray-800',
      'open': 'bg-green-100 text-green-800',
      'closed': 'bg-blue-100 text-blue-800',
      'cancelled': 'bg-red-100 text-red-800',
      'awarded': 'bg-purple-100 text-purple-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  formatDateTime(dateString?: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('pt-BR');
  }

  formatCurrency(value?: string): string {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(value));
  }

  goBack() {
    this.router.navigate(['/licitacoes']);
  }


  // Métodos para upload de documentos
  openUploadModal() {
    this.showUploadModal = true;
    this.resetUploadForm();
  }

  closeUploadModal() {
    this.showUploadModal = false;
    this.resetUploadForm();
  }

  resetUploadForm() {
    this.uploadForm = {
      docType: '',
      required: true,
      submitted: false,
      signed: false,
      issueDate: '',
      expiresAt: '',
      notes: '',
      file: null as any
    };
    this.selectedFile = null;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validar tamanho (20MB)
      if (file.size > 20 * 1024 * 1024) {
        this.error = 'Arquivo muito grande. Máximo 20MB.';
        return;
      }

      // Validar tipo
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        this.error = 'Tipo de arquivo não permitido. Use PDF, JPEG ou PNG.';
        return;
      }

      this.selectedFile = file;
      this.uploadForm.file = file;
      this.error = null;
    }
  }

  uploadDocument() {
    if (!this.uploadForm.file) {
      this.error = 'Selecione um arquivo';
      return;
    }

    this.loading = true;
    this.error = null;

    this.apiService.getCompanies().pipe(
      switchMap((companies: any[]) => {
        if (companies.length === 0) {
          throw new Error('Nenhuma empresa encontrada');
        }
        
        const companyData = companies[0];
        const company = companyData.company || companyData;
        const companyId = company.id;
        
        if (!companyId) {
          throw new Error('ID da empresa não encontrado');
        }

        return this.licitacoesService.uploadDocument(companyId, this.licitacao!.id, this.uploadForm, this.uploadForm.file);
      })
    ).subscribe({
      next: (result: any) => {
        this.loadLicitacao(this.licitacao!.id);
        this.closeUploadModal();
        this.loading = false;
      },
      error: (error: any) => {
        this.error = error.message || 'Erro ao fazer upload do documento';
        this.loading = false;
      }
    });
  }

  downloadDocument(docId: string) {
    if (!this.licitacao) return;

    this.apiService.getCompanies().pipe(
      switchMap((companies: any[]) => {
        if (companies.length === 0) {
          throw new Error('Nenhuma empresa encontrada');
        }
        
        const companyData = companies[0];
        const company = companyData.company || companyData;
        const companyId = company.id;
        
        if (!companyId) {
          throw new Error('ID da empresa não encontrado');
        }

        return this.licitacoesService.getDocumentContent(companyId, this.licitacao!.id, docId);
      })
    ).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `documento_${docId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error: any) => {
        this.error = error.message || 'Erro ao baixar documento';
      }
    });
  }

  deleteDocument(docId: string) {
    if (!this.licitacao) return;

    if (!confirm('Tem certeza que deseja excluir este documento?')) {
      return;
    }

    this.loading = true;
    this.apiService.getCompanies().pipe(
      switchMap((companies: any[]) => {
        if (companies.length === 0) {
          throw new Error('Nenhuma empresa encontrada');
        }
        
        const companyData = companies[0];
        const company = companyData.company || companyData;
        const companyId = company.id;
        
        if (!companyId) {
          throw new Error('ID da empresa não encontrado');
        }

        return this.licitacoesService.deleteDocument(companyId, this.licitacao!.id, docId);
      })
    ).subscribe({
      next: () => {
        this.loadLicitacao(this.licitacao!.id);
        this.loading = false;
      },
      error: (error: any) => {
        this.error = error.message || 'Erro ao excluir documento';
        this.loading = false;
      }
    });
  }
}
