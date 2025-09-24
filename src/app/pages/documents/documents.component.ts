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
    docType: 'CNPJ',
    file: null as any
  };

  // Filtros
  selectedDocType: string = '';
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;

  // Tipos de documento disponíveis
  docTypes = [
    { value: 'CNPJ', label: 'CNPJ' },
    { value: 'INSCRICAO_ESTADUAL', label: 'Inscrição Estadual' },
    { value: 'INSCRICAO_MUNICIPAL', label: 'Inscrição Municipal' },
    { value: 'ALVARA', label: 'Alvará' },
    { value: 'CONTRATO_SOCIAL', label: 'Contrato Social' },
    { value: 'CERTIFICADO_DIGITAL', label: 'Certificado Digital' },
    { value: 'LICENCA_AMBIENTAL', label: 'Licença Ambiental' },
    { value: 'CERTIDAO_FGTS', label: 'Certidão FGTS' },
    { value: 'CERTIDAO_INSS', label: 'Certidão INSS' },
    { value: 'CERTIDAO_TRABALHISTA', label: 'Certidão Trabalhista' },
    { value: 'CERTIDAO_MUNICIPAL', label: 'Certidão Municipal' },
    { value: 'OUTROS', label: 'Outros' }
  ];

  constructor(
    private documentsService: DocumentsService,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.loadDocuments();
  }

  loadDocuments() {
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

        const params: any = {
          page: this.currentPage,
          pageSize: this.pageSize
        };

        if (this.selectedDocType) {
          params.docType = this.selectedDocType;
        }

        return this.documentsService.getDocuments(companyId, params);
      })
    ).subscribe({
      next: (response) => {
        this.documents = response.documents;
        this.totalPages = response.pagination.totalPages;
        this.loading = false;
      },
      error: (error) => {
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
      docType: 'CNPJ',
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

        return this.documentsService.downloadDocument(companyId, document.id);
      })
    ).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = window.document.createElement('a');
        link.href = url;
        link.download = `${document.docType}_v${document.version}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        this.error = error.message || 'Erro ao baixar documento';
      }
    });
  }

  deleteDocument(document: CompanyDocument) {
    if (!confirm('Tem certeza que deseja excluir este documento?')) {
      return;
    }

    this.loading = true;
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

        return this.documentsService.deleteDocument(companyId, document.id);
      })
    ).subscribe({
      next: () => {
        this.loadDocuments(); // Recarregar lista
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message || 'Erro ao excluir documento';
        this.loading = false;
      }
    });
  }

  getDocumentTypeLabel(docType: string): string {
    const type = this.docTypes.find(t => t.value === docType);
    return type ? type.label : docType;
  }

  getDocumentStatus(document: CompanyDocument): 'valid' | 'expiring_soon' | 'expired' {
    return this.documentsService.getDocumentStatus(document);
  }

  getDocumentStatusLabel(status: 'valid' | 'expiring_soon' | 'expired'): string {
    return this.documentsService.getDocumentStatusLabel(status);
  }

  getDocumentStatusColor(status: 'valid' | 'expiring_soon' | 'expired'): string {
    return this.documentsService.getDocumentStatusColor(status);
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
