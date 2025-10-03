import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentsService, CompanyDocument, UploadDocumentRequest } from '../../core/services/documents.service';
import { ApiService } from '../../core/services/api.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit {
  documents: CompanyDocument[] = [];
  loading = false;
  error: string | null = null;
  selectedFile: File | null = null;
  showUploadModal = false;
  uploadForm: UploadDocumentRequest = {
    docType: 'cnpj',
    clientName: '',
    file: null as any
  };

  // Filtros
  selectedDocType: string = '';
  selectedStatus: string = '';
  searchTerm: string = '';
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;

  // Tipos de documento disponíveis (valores em minúsculas para o backend)
  docTypes = [
    { value: 'cnpj', label: 'CNPJ' },
    { value: 'inscricao_estadual', label: 'Inscrição Estadual' },
    { value: 'certidao', label: 'Certidão' },
    { value: 'procuracao', label: 'Procuração' },
    { value: 'outro', label: 'Outros' }
  ];

  // Status de documento disponíveis
  statusOptions = [
    { value: '', label: 'Todos os status' },
    { value: 'Válido', label: 'Válido' },
    { value: 'À vencer', label: 'À vencer' },
    { value: 'Expirado', label: 'Expirado' },
    { value: 'Sem validade', label: 'Sem validade' }
  ];

  constructor(
    private documentsService: DocumentsService,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.loadDocuments();
  }

  loadDocuments() {
    console.log('Carregando documentos...');
    this.loading = true;
    this.error = null;

    this.apiService.getCompanies().pipe(
      switchMap(companies => {
        console.log('Empresas encontradas:', companies.length);
        if (companies.length === 0) {
          throw new Error('Nenhuma empresa encontrada');
        }
        
        const companyData = companies[0];
        const company = companyData.company || companyData;
        const companyId = company.id;
        
        console.log('Empresa selecionada:', company.name, 'ID:', companyId);
        
        if (!companyId) {
          throw new Error('ID da empresa não encontrado');
        }

        const params: any = {
          page: this.currentPage,
          limit: this.pageSize
        };

        if (this.selectedDocType) {
          params.docType = this.selectedDocType;
        }

        if (this.selectedStatus) {
          params.status = this.selectedStatus;
        }

        if (this.searchTerm) {
          params.search = this.searchTerm;
        }

        console.log('Parâmetros da busca:', params);
        return this.documentsService.getDocuments(companyId, params);
      })
    ).subscribe({
      next: (response) => {
        console.log('Documentos carregados:', response.documents.length);
        this.documents = response.documents;
        this.totalPages = response.pagination.totalPages;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar documentos:', error);
        this.error = error.message || 'Erro ao carregar documentos';
        this.loading = false;
      }
    });
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
      docType: 'cnpj',
      clientName: '',
      file: null as any
    };
    this.selectedFile = null;
    this.error = null;
  }

  uploadDocument() {
    if (!this.uploadForm.file) {
      this.error = 'Selecione um arquivo';
      return;
    }

    this.loading = true;
    this.error = null;

    this.apiService.getCompanies().pipe(
      switchMap(companies => {
        if (companies.length === 0) {
          throw new Error('Nenhuma empresa encontrada');
        }
        
        const companyData = companies[0];
        const company = companyData.company || companyData;
        const companyId = company.id;
        
        if (!companyId) {
          throw new Error('ID da empresa não encontrado');
        }

        return this.documentsService.uploadDocument(companyId, this.uploadForm);
      })
    ).subscribe({
      next: (document) => {
        this.loadDocuments(); // Recarregar lista
        this.closeUploadModal();
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message || 'Erro ao fazer upload do documento';
        this.loading = false;
      }
    });
  }

  downloadDocument(document: CompanyDocument) {
    console.log('🚀 [DocumentsComponent.downloadDocument] ===== INICIANDO DOWNLOAD =====');
    console.log('📄 Documento:', document.id, document.docType);
    this.loading = true;
    this.error = null;
    
    // Verificar se há token
    const token = localStorage.getItem('access_token');
    console.log('🔑 Token no localStorage:', token ? 'Presente' : 'Ausente');
    
    this.apiService.getCompanies().pipe(
      switchMap(companies => {
        console.log('🏢 [DocumentsComponent.downloadDocument] Empresas encontradas:', companies.length);
        console.log('🏢 [DocumentsComponent.downloadDocument] Dados das empresas:', companies);
        
        if (companies.length === 0) {
          throw new Error('Nenhuma empresa encontrada');
        }
        
        const companyData = companies[0];
        const company = companyData.company || companyData;
        const companyId = company.id;
        
        console.log('🏢 [DocumentsComponent.downloadDocument] Empresa selecionada:', company.name, 'ID:', companyId);
        console.log('🏢 [DocumentsComponent.downloadDocument] Estrutura da empresa:', company);
        
        if (!companyId) {
          throw new Error('ID da empresa não encontrado');
        }

        console.log('📥 [DocumentsComponent.downloadDocument] Fazendo download do documento:', document.id, 'da empresa:', companyId);
        console.log('📥 [DocumentsComponent.downloadDocument] URL que será chamada:', `http://localhost:3000/v1/companies/${companyId}/documents/${document.id}/content`);
        
        return this.documentsService.downloadDocument(companyId, document.id);
      })
    ).subscribe({
      next: (blob) => {
        console.log('Download realizado com sucesso, tamanho:', blob.size, 'bytes');
        
        // Determinar extensão baseada no tipo MIME
        let extension = '.pdf';
        if (blob.type) {
          if (blob.type.includes('image')) {
            extension = '.jpg';
          } else if (blob.type.includes('word')) {
            extension = '.docx';
          } else if (blob.type.includes('excel')) {
            extension = '.xlsx';
          } else if (blob.type.includes('text')) {
            extension = '.txt';
          }
        }
        
        // Criar nome do arquivo limpo
        const fileName = `${document.docType.replace(/[^a-zA-Z0-9]/g, '_')}_v${document.version}${extension}`;
        
        const url = window.URL.createObjectURL(blob);
        const link = window.document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        this.loading = false;
        console.log('Download concluído com sucesso!');
      },
      error: (error) => {
        console.error('Erro no download:', error);
        this.error = error.message || 'Erro ao baixar documento';
        this.loading = false;
      }
    });
  }

  deleteDocument(document: CompanyDocument) {
    if (!confirm('Tem certeza que deseja excluir este documento?')) {
      return;
    }

    console.log('🗑️ [DocumentsComponent.deleteDocument] ===== INICIANDO EXCLUSÃO =====');
    console.log('📄 Documento:', document.id, document.docType);
    this.loading = true;
    this.error = null;
    
    // Verificar se há token
    const token = localStorage.getItem('access_token');
    console.log('🔑 Token no localStorage:', token ? 'Presente' : 'Ausente');
    
    this.apiService.getCompanies().pipe(
      switchMap(companies => {
        console.log('🏢 [DocumentsComponent.deleteDocument] Empresas encontradas:', companies.length);
        console.log('🏢 [DocumentsComponent.deleteDocument] Dados das empresas:', companies);
        
        if (companies.length === 0) {
          throw new Error('Nenhuma empresa encontrada');
        }
        
        const companyData = companies[0];
        const company = companyData.company || companyData;
        const companyId = company.id;
        
        console.log('🏢 [DocumentsComponent.deleteDocument] Empresa selecionada:', company.name, 'ID:', companyId);
        console.log('🏢 [DocumentsComponent.deleteDocument] Estrutura da empresa:', company);
        
        if (!companyId) {
          throw new Error('ID da empresa não encontrado');
        }

        console.log('🗑️ [DocumentsComponent.deleteDocument] Chamando serviço para excluir documento:', document.id, 'da empresa:', companyId);
        console.log('🗑️ [DocumentsComponent.deleteDocument] URL que será chamada:', `http://localhost:3000/v1/companies/${companyId}/documents/${document.id}`);
        
        return this.documentsService.deleteDocument(companyId, document.id);
      })
    ).subscribe({
      next: () => {
        console.log('Documento excluído com sucesso, recarregando lista...');
        this.loadDocuments(); // Recarregar lista
      },
      error: (error) => {
        console.error('Erro ao excluir documento:', error);
        this.error = error.message || 'Erro ao excluir documento';
        this.loading = false;
      }
    });
  }

  getDocumentTypeLabel(docType: string): string {
    const type = this.docTypes.find(t => t.value === docType);
    return type ? type.label : docType;
  }

  getDocumentStatus(document: CompanyDocument): string {
    // Usar o status calculado do backend se disponível
    if ((document as any).status) {
      return (document as any).status;
    }
    
    // Fallback para cálculo local
    return this.documentsService.getDocumentStatus(document);
  }

  getDocumentStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Válido': 'Válido',
      'À vencer': 'À vencer',
      'Expirado': 'Expirado',
      'Sem validade': 'Sem validade',
      'valid': 'Válido',
      'expiring_soon': 'À vencer',
      'expired': 'Expirado'
    };
    return statusMap[status] || status;
  }

  getDocumentStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      'Válido': 'bg-green-100 text-green-800',
      'À vencer': 'bg-yellow-100 text-yellow-800',
      'Expirado': 'bg-red-100 text-red-800',
      'Sem validade': 'bg-gray-100 text-gray-800',
      'valid': 'bg-green-100 text-green-800',
      'expiring_soon': 'bg-yellow-100 text-yellow-800',
      'expired': 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  }

  formatFileSize(bytes?: number): string {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  onDocTypeFilterChange() {
    this.currentPage = 1;
    this.loadDocuments();
  }

  onStatusFilterChange() {
    this.currentPage = 1;
    this.loadDocuments();
  }

  onSearchChange() {
    this.currentPage = 1;
    this.loadDocuments();
  }

  clearFilters() {
    this.selectedDocType = '';
    this.selectedStatus = '';
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadDocuments();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadDocuments();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }
}
