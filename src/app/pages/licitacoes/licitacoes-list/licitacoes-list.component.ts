import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LicitacoesService, Licitacao, LicitacaoStatus, LicitacaoListResponse } from './licitacoes.service';
import { ApiService } from '../../../core/services/api.service';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../../auth-pages/auth.service';

@Component({
  selector: 'app-licitacoes-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './licitacoes-list.component.html',
  styleUrls: ['./licitacoes-list.component.css']
})
export class LicitacoesListComponent implements OnInit {
  licitacoes: Licitacao[] = [];
  loading = false;
  error: string | null = null;
  showCreateModal = false;
  showAnaliseModal = false;
  selectedLicitacao: Licitacao | null = null;

  // Filtros
  selectedStatus: string = '';
  searchTerm: string = '';
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;

  // Formulário de criação
  createForm: Partial<Licitacao> = {
    title: '',
    orgao: '',
    modalidade: '',
    editalUrl: '',
    sessionAt: '',
    submissionDeadline: '',
    status: 'draft',
    saleValue: '',
    notes: ''
  };

  // Upload de PDF do edital
  selectedEditalFile: File | null = null;

  // Status disponíveis
  statusOptions = [
    { value: '', label: 'Todos os status' },
    { value: 'draft', label: 'Rascunho' },
    { value: 'open', label: 'Aberta' },
    { value: 'closed', label: 'Fechada' },
    { value: 'cancelled', label: 'Cancelada' },
    { value: 'awarded', label: 'Homologada' }
  ];

  constructor(
    private licitacoesService: LicitacoesService,
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadLicitacoes();
  }

  loadLicitacoes() {
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

        const params: any = {
          page: this.currentPage,
          pageSize: this.pageSize
        };

        if (this.selectedStatus) {
          params.status = this.selectedStatus;
        }

        if (this.searchTerm) {
          params.search = this.searchTerm;
        }

        return this.licitacoesService.getLicitacoes(companyId, params);
      })
    ).subscribe({
      next: (response: LicitacaoListResponse) => {
        this.licitacoes = response.licitacoes;
        this.totalPages = response.pagination.totalPages;
        this.loading = false;
      },
      error: (error: any) => {
        this.error = error.message || 'Erro ao carregar licitações';
        this.loading = false;
      }
    });
  }

  openCreateModal() {
    this.showCreateModal = true;
    this.resetCreateForm();
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.resetCreateForm();
  }

  resetCreateForm() {
    this.createForm = {
      title: '',
      orgao: '',
      modalidade: '',
      sessionAt: '',
      submissionDeadline: '',
      status: 'draft',
      saleValue: '',
      notes: ''
    };
    this.selectedEditalFile = null;
    this.error = null;
  }

  onEditalFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validar tamanho (20MB)
      if (file.size > 20 * 1024 * 1024) {
        this.error = 'Arquivo muito grande. Máximo 20MB.';
        return;
      }

      // Validar tipo
      const allowedTypes = ['application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        this.error = 'Tipo de arquivo não permitido. Use apenas PDF.';
        return;
      }

      this.selectedEditalFile = file;
      this.error = null;
    }
  }

  createLicitacao() {
    if (!this.createForm.title) {
      this.error = 'Título é obrigatório';
      return;
    }

    // Verificar permissões
    const currentUser = this.authService.getCurrentUser();
    console.log('👤 [createLicitacao] Usuário atual:', currentUser);
    
    if (!currentUser) {
      this.error = 'Usuário não autenticado';
      return;
    }

    // Verificar se o usuário tem permissão para criar licitações
    const allowedRoles = ['ADMIN', 'ANALYST', 'TECH'];
    if (!allowedRoles.includes(currentUser.role)) {
      this.error = 'Você não tem permissão para criar licitações. Apenas usuários autorizados podem criar licitações.';
      return;
    }

    this.loading = true;
    this.error = null;

    console.log('🔍 [createLicitacao] Iniciando criação de licitação...');
    console.log('📋 [createLicitacao] Dados do formulário:', this.createForm);
    console.log('📁 [createLicitacao] Arquivo selecionado:', this.selectedEditalFile);

    this.apiService.getCompanies().pipe(
      switchMap((companies: any[]) => {
        console.log('🏢 [createLicitacao] Empresas encontradas:', companies);
        
        if (companies.length === 0) {
          throw new Error('Nenhuma empresa encontrada');
        }
        
        const companyData = companies[0];
        const company = companyData.company || companyData;
        const companyId = company.id;
        
        console.log('🏢 [createLicitacao] Company ID:', companyId);
        
        if (!companyId) {
          throw new Error('ID da empresa não encontrado');
        }

        // Primeiro criar a licitação
        console.log('📝 [createLicitacao] Criando licitação...');
        return this.licitacoesService.createLicitacao(companyId, this.createForm as any).pipe(
          switchMap((licitacao: Licitacao) => {
            console.log('✅ [createLicitacao] Licitação criada:', licitacao);
            
            // Se há um arquivo PDF do edital, fazer upload
            if (this.selectedEditalFile) {
              console.log('📁 [createLicitacao] Fazendo upload do PDF do edital...');
              const documentData = {
                docType: 'EDITAL',
                required: true,
                submitted: true,
                signed: false,
                notes: 'Edital da licitação'
              };
              return this.licitacoesService.uploadDocument(companyId, licitacao.id, documentData, this.selectedEditalFile).pipe(
                switchMap(() => {
                  console.log('✅ [createLicitacao] PDF do edital enviado com sucesso');
                  return [licitacao];
                })
              );
            }
            return [licitacao];
          })
        );
      })
    ).subscribe({
      next: (licitacao: Licitacao) => {
        console.log('🎉 [createLicitacao] Licitação criada com sucesso:', licitacao);
        this.loadLicitacoes();
        this.closeCreateModal();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('❌ [createLicitacao] Erro ao criar licitação:', error);
        console.error('❌ [createLicitacao] Status:', error.status);
        console.error('❌ [createLicitacao] Error body:', error.error);
        this.error = error.error?.message || error.message || 'Erro ao criar licitação';
        this.loading = false;
      }
    });
  }

  openAnaliseModal(licitacao: Licitacao) {
    this.selectedLicitacao = licitacao;
    this.showAnaliseModal = true;
  }

  closeAnaliseModal() {
    this.showAnaliseModal = false;
    this.selectedLicitacao = null;
  }

  analisarEdital() {
    if (!this.selectedLicitacao) return;

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

        return this.licitacoesService.analisarEdital(companyId, this.selectedLicitacao!.id, {});
      })
    ).subscribe({
      next: (result: any) => {
        this.loadLicitacoes();
        this.closeAnaliseModal();
        this.loading = false;
      },
      error: (error: any) => {
        this.error = error.message || 'Erro ao analisar edital';
        this.loading = false;
      }
    });
  }

  deleteLicitacao(licitacao: Licitacao) {
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

        return this.licitacoesService.deleteLicitacao(companyId, licitacao.id);
      })
    ).subscribe({
      next: () => {
        this.loadLicitacoes();
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

  formatCurrency(value?: string): string {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(value));
  }

  onStatusFilterChange() {
    this.currentPage = 1;
    this.loadLicitacoes();
  }

  onSearchChange() {
    this.currentPage = 1;
    this.loadLicitacoes();
  }

  clearFilters() {
    this.selectedStatus = '';
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadLicitacoes();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadLicitacoes();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }
}
