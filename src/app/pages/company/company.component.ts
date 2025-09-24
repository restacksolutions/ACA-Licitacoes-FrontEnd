import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CompanyService, Company, CompanyMember, CompanyDocument, CompanyUpdateData, DocumentUpdateData } from './company.service';
import { AuthService } from '../auth-pages/auth.service';
import Swal from 'sweetalert2';

// Interfaces para configuração dos formulários e tabelas
interface FormField {
  key: string;
  label: string;
  type: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  rows?: number;
  value?: any;
}

interface TableColumn {
  key: string;
  label: string;
}

interface DocumentStatusGroup {
  title: string;
  count: number;
  documents: CompanyDocument[];
  colorClass: string;
  cardClass: string;
  iconClass: string;
  textClass: string;
  buttonClass: string;
  badgeClass: string;
  badgeText: string;
  dateLabel: string;
}

@Component({
  selector: 'app-company',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.css']
})
export class CompanyComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // ===== ESTADO DA APLICAÇÃO =====

  // Company Info
  company: Company | null = null;
  companyLoading = false;
  companyError = '';
  editingCompany = false;
  isSaving = false;
  companyForm: CompanyUpdateData = {};

  // Members
  members: CompanyMember[] = [];
  membersLoading = false;
  membersError = '';
  showAddMemberForm = false;
  isAddingMember = false;
  editingMember: CompanyMember | null = null;
  memberForm: { 
    name: string; 
    email: string; 
    password: string; 
    role: 'admin' | 'member' | 'owner' 
  } = { 
    name: '', 
    email: '', 
    password: '', 
    role: 'member' 
  };

  // Documents
  documents: CompanyDocument[] = [];
  missingDocuments: CompanyDocument[] = [];
  documentsLoading = false;
  documentsError = '';
  showAddDocumentForm = false;
  isAddingDocument = false;
  documentForm: DocumentUpdateData = {
    doc_type: 'outros',
    doc_number: '',
    issuer: '',
    issue_date: '',
    expires_at: '',
    notes: ''
  };

  // UI State
  activeTab: 'info' | 'members' | 'documents' = 'info';

  // ===== CONFIGURAÇÕES DOS FORMULÁRIOS =====
  
  get companyDisplayFields(): FormField[] {
    return [
      { key: 'name', label: 'Nome da Empresa', type: 'text', value: this.company?.name || 'Não informado' },
      { key: 'cnpj', label: 'CNPJ', type: 'text', value: this.company?.cnpj || 'Não informado' },
      { key: 'legal_name', label: 'Razão Social', type: 'text', value: this.company?.legal_name || 'Não informado' },
      { key: 'state_registration', label: 'Inscrição Estadual', type: 'text', value: this.company?.state_registration || 'Não informado' },
      { key: 'municipal_registration', label: 'Inscrição Municipal', type: 'text', value: this.company?.municipal_registration || 'Não informado' },
      { key: 'phone', label: 'Telefone', type: 'text', value: this.company?.phone || 'Não informado' },
      { key: 'address', label: 'Endereço', type: 'text', value: this.company?.address || 'Não informado' },
      { key: 'email', label: 'Email', type: 'email', value: this.company?.email || 'Não informado' }
    ];
  }

  companyFormFields: FormField[] = [
    { key: 'name', label: 'Nome da Empresa', type: 'text', required: true },
    { key: 'cnpj', label: 'CNPJ', type: 'text', required: true },
    { key: 'legal_name', label: 'Razão Social', type: 'text' },
    { key: 'state_registration', label: 'Inscrição Estadual', type: 'text' },
    { key: 'municipal_registration', label: 'Inscrição Municipal', type: 'text' },
    { key: 'phone', label: 'Telefone', type: 'text' },
    { key: 'address', label: 'Endereço', type: 'textarea', rows: 3 },
    { key: 'email', label: 'Email', type: 'email' }
  ];

  memberFormFields: FormField[] = [
    { 
      key: 'name', 
      label: 'Nome Completo', 
      type: 'text', 
      required: true 
    },
    { 
      key: 'email', 
      label: 'Email', 
      type: 'email', 
      required: true 
    },
    { 
      key: 'password', 
      label: 'Senha', 
      type: 'password', 
      required: true 
    },
    { 
      key: 'role', 
      label: 'Função', 
      type: 'select', 
      required: true,
      options: [
        { value: 'member', label: 'Membro' },
        { value: 'admin', label: 'Administrador' },
        { value: 'owner', label: 'Proprietário' }
      ]
    }
  ];

  memberTableColumns: TableColumn[] = [
    { key: 'name', label: 'Funcionário' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Função' },
    { key: 'created_at', label: 'Data de Entrada' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Ações' }
  ];

  // ===== COMPUTED PROPERTIES =====
  
  get expiredDocumentsCount(): number {
    return this.getDocumentsByStatus('expired').length;
  }

  get documentStatusGroups(): DocumentStatusGroup[] {
    return [
      {
        title: 'Documentos Válidos',
        count: this.getDocumentsByStatus('valid').length,
        documents: this.getDocumentsByStatus('valid'),
        colorClass: 'bg-green-500',
        cardClass: 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700',
        iconClass: 'fas fa-file-pdf text-green-600',
        textClass: 'text-green-600 dark:text-green-400',
        buttonClass: 'bg-green-600 hover:bg-green-700',
        badgeClass: 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200',
        badgeText: 'Válido',
        dateLabel: 'Expira em'
      },
      {
        title: 'Documentos com Aviso',
        count: this.getDocumentsByStatus('warning').length,
        documents: this.getDocumentsByStatus('warning'),
        colorClass: 'bg-yellow-500',
        cardClass: 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700',
        iconClass: 'fas fa-file-pdf text-yellow-600',
        textClass: 'text-yellow-600 dark:text-yellow-400',
        buttonClass: 'bg-yellow-600 hover:bg-yellow-700',
        badgeClass: 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200',
        badgeText: 'Atenção',
        dateLabel: 'Expira em'
      },
      {
        title: 'Documentos Expirados',
        count: this.getDocumentsByStatus('expired').length,
        documents: this.getDocumentsByStatus('expired'),
        colorClass: 'bg-red-500',
        cardClass: 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700',
        iconClass: 'fas fa-file-pdf text-red-600',
        textClass: 'text-red-600 dark:text-red-400',
        buttonClass: 'bg-red-600 hover:bg-red-700',
        badgeClass: 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200',
        badgeText: 'Expirado',
        dateLabel: 'Expirou em'
      }
    ];
  }

  constructor(
    private companyService: CompanyService,
    private authService: AuthService,
    private router: Router
  ) {}

  // ===== LIFECYCLE HOOKS =====

  ngOnInit() {
    console.log('[CompanyComponent.ngOnInit] ===== COMPONENTE INICIADO =====');
    this.initializeComponent();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== MÉTODOS DE INICIALIZAÇÃO =====
  
  private initializeComponent() {
    console.log('[CompanyComponent.initializeComponent] ===== INICIALIZANDO COMPONENTE =====');
    this.loadCompanyData();
    this.loadMembers();
    this.loadDocuments();
    this.loadMissingDocuments();
  }

  // ===== MÉTODOS DE NAVEGAÇÃO =====

  setActiveTab(tab: 'info' | 'members' | 'documents') {
    this.activeTab = tab;
  }

  // ===== MÉTODOS DA EMPRESA =====
  
  private loadCompanyData() {
    console.log('[CompanyComponent.loadCompanyData] ===== CARREGANDO DADOS DA EMPRESA =====');
    this.companyLoading = true;
    this.companyError = '';

    this.companyService.getCompanyInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (company: Company) => {
          console.log('[CompanyComponent.loadCompanyData] Dados recebidos:', company);
          this.company = company;
          this.companyLoading = false;
          console.log('[CompanyComponent.loadCompanyData] Empresa definida:', this.company);
        },
        error: (error: any) => {
          console.error('[CompanyComponent.loadCompanyData] Erro ao carregar:', error);
          
          // Se não há empresa, criar uma empresa vazia para permitir edição
          if (error.message && error.message.includes('Nenhuma empresa encontrada')) {
            console.log('[CompanyComponent.loadCompanyData] Nenhuma empresa encontrada - criando empresa vazia para edição');
            this.company = {
              id: '',
              name: '',
              cnpj: '',
              legal_name: '',
              state_registration: '',
              municipal_registration: '',
              phone: '',
              address: '',
              email: '',
              logo_path: '',
              letterhead_path: '',
              active: true,
              created_by: '',
              created_at: null as string | null
            };
            this.companyError = '';
          } else {
            this.companyError = 'Erro ao carregar dados da empresa';
          }
          
          this.companyLoading = false;
        }
      });
  }

  onToggleEditCompany() {
    this.editingCompany = !this.editingCompany;
    if (this.editingCompany && this.company) {
      this.initializeCompanyForm();
    }
  }

  private initializeCompanyForm() {
    console.log('[CompanyComponent.initializeCompanyForm] ===== INICIALIZANDO FORMULÁRIO =====');
    console.log('[CompanyComponent.initializeCompanyForm] Dados da empresa:', this.company);
    
    this.companyForm = {
      name: this.company?.name || '',
      cnpj: this.company?.cnpj || '',
      legal_name: this.company?.legal_name || '',
      state_registration: this.company?.state_registration || '',
      municipal_registration: this.company?.municipal_registration || '',
      phone: this.company?.phone || '',
      address: this.company?.address || '',
      email: this.company?.email || ''
    };
    
    console.log('[CompanyComponent.initializeCompanyForm] Formulário inicializado:', this.companyForm);
  }

  onCancelEditCompany() {
    this.editingCompany = false;
    this.companyForm = {};
  }

  onSaveCompany() {
    console.log('[CompanyComponent.onSaveCompany] ===== SALVANDO INFORMAÇÕES DA EMPRESA =====');
    console.log('[CompanyComponent.onSaveCompany] Dados do formulário:', this.companyForm);
    console.log('[CompanyComponent.onSaveCompany] Tipo do formulário:', typeof this.companyForm);
    console.log('[CompanyComponent.onSaveCompany] Chaves do formulário:', Object.keys(this.companyForm));
    console.log('[CompanyComponent.onSaveCompany] Dados da empresa atual:', this.company);
    console.log('[CompanyComponent.onSaveCompany] ID da empresa atual:', this.company?.id);
    
    if (!this.validateCompanyForm()) {
      console.log('[CompanyComponent.onSaveCompany] Validação falhou');
      return;
    }
    
    console.log('[CompanyComponent.onSaveCompany] Validação passou - prosseguindo com salvamento');
    console.log('[CompanyComponent.onSaveCompany] Chamando companyService.updateCompanyInfo...');

    this.isSaving = true;
    this.companyError = '';

    this.companyService.updateCompanyInfo(this.companyForm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: async (updatedCompany: Company) => {
          console.log('[CompanyComponent.onSaveCompany] Empresa atualizada com sucesso:', updatedCompany);
          
          this.company = updatedCompany;
          this.editingCompany = false;
          this.companyForm = {};
          this.isSaving = false;
          
          // Mostrar notificação de sucesso
          await Swal.fire({
            icon: 'success',
            title: 'Sucesso!',
            text: 'Informações da empresa atualizadas com sucesso.',
            showConfirmButton: true,
            timer: 3000
          });
          
          console.log('[CompanyComponent.onSaveCompany] Atualização concluída');
        },
        error: async (error: any) => {
          console.error('[CompanyComponent.onSaveCompany] Erro ao salvar:', error);
          
          this.companyError = 'Erro ao salvar informações da empresa';
          this.isSaving = false;
          
          // Mostrar notificação de erro
          await Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: 'Não foi possível atualizar as informações da empresa. Tente novamente.',
            showConfirmButton: true
          });
        }
      });
  }

  private validateCompanyForm(): boolean {
    console.log('[CompanyComponent.validateCompanyForm] Validando formulário...');
    console.log('[CompanyComponent.validateCompanyForm] Dados do formulário:', this.companyForm);
    console.log('[CompanyComponent.validateCompanyForm] Nome:', this.companyForm.name);
    console.log('[CompanyComponent.validateCompanyForm] CNPJ:', this.companyForm.cnpj);
    
    if (!this.companyForm.name?.trim()) {
      console.log('[CompanyComponent.validateCompanyForm] ERRO: Nome da empresa é obrigatório');
      this.companyError = 'Nome da empresa é obrigatório';
      return false;
    }
    if (!this.companyForm.cnpj?.trim()) {
      console.log('[CompanyComponent.validateCompanyForm] ERRO: CNPJ é obrigatório');
      this.companyError = 'CNPJ é obrigatório';
      return false;
    }
    
    console.log('[CompanyComponent.validateCompanyForm] ✅ Validação passou');
    return true;
  }

  // ===== MÉTODOS DE FUNCIONÁRIOS =====
  
  private loadMembers() {
    console.log('[CompanyComponent.loadMembers] ===== CARREGANDO MEMBROS =====');
    this.membersLoading = true;
    this.membersError = '';

    this.companyService.getCompanyMembers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (members) => {
          console.log('[CompanyComponent.loadMembers] Membros recebidos:', members);
          console.log('[CompanyComponent.loadMembers] Quantidade de membros:', members.length);
          console.log('[CompanyComponent.loadMembers] Dados dos membros:', JSON.stringify(members, null, 2));
          
          this.members = members;
          this.membersLoading = false;
          
          console.log('[CompanyComponent.loadMembers] Membros definidos no componente:', this.members);
          console.log('[CompanyComponent.loadMembers] ===== CARREGAMENTO CONCLUÍDO =====');
        },
        error: (error) => {
          console.error('[CompanyComponent.loadMembers] Erro ao carregar membros:', error);
          this.membersError = 'Erro ao carregar membros';
          this.membersLoading = false;
        }
      });
  }

  onToggleAddMemberForm() {
    this.showAddMemberForm = !this.showAddMemberForm;
    if (!this.showAddMemberForm) {
      this.resetMemberForm();
      this.editingMember = null;
    }
  }

  private resetMemberForm() {
    this.memberForm = { 
      name: '', 
      email: '', 
      password: '', 
      role: 'member' 
    };
  }

  onAddMember() {
    const isEditing = this.editingMember !== null;
    console.log(`[CompanyComponent.onAddMember] ===== ${isEditing ? 'EDITANDO' : 'ADICIONANDO'} FUNCIONÁRIO =====`);
    console.log('[CompanyComponent.onAddMember] Dados do formulário:', this.memberForm);
    console.log('[CompanyComponent.onAddMember] Editando membro:', this.editingMember);
    
    if (!this.validateMemberForm()) {
      console.log('[CompanyComponent.onAddMember] Validação falhou');
      return;
    }

    this.isAddingMember = true;
    this.membersError = '';

    if (isEditing) {
      // Atualizar membro existente
      console.log('[CompanyComponent.onAddMember] Atualizando membro existente...');
      
      this.companyService.updateMember(this.editingMember!.id, this.memberForm)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: async (updatedMember: CompanyMember) => {
            console.log('[CompanyComponent.onAddMember] Membro atualizado com sucesso:', updatedMember);
            
            // Atualizar na lista
            const index = this.members.findIndex(m => m.id === this.editingMember!.id);
            if (index !== -1) {
              this.members[index] = updatedMember;
            }
            
            this.showAddMemberForm = false;
            this.resetMemberForm();
            this.editingMember = null;
            this.isAddingMember = false;
            
            // Mostrar notificação de sucesso
            await Swal.fire({
              icon: 'success',
              title: 'Sucesso!',
              text: 'Funcionário atualizado com sucesso.',
              showConfirmButton: true,
              timer: 3000
            });
            
            console.log('[CompanyComponent.onAddMember] Atualização concluída');
          },
          error: async (error: any) => {
            console.error('[CompanyComponent.onAddMember] Erro ao atualizar:', error);
            
            this.membersError = 'Erro ao atualizar funcionário';
            this.isAddingMember = false;
            
            // Mostrar notificação de erro
            await Swal.fire({
              icon: 'error',
              title: 'Erro!',
              text: 'Não foi possível atualizar o funcionário. Tente novamente.',
              showConfirmButton: true
            });
          }
        });
    } else {
      // Criar novo usuário e adicionar como membro
      console.log('[CompanyComponent.onAddMember] Criando usuário no sistema...');
      
      this.companyService.createUserAndAddMember(this.memberForm)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: async (result: any) => {
            console.log('[CompanyComponent.onAddMember] Usuário criado e funcionário adicionado com sucesso:', result);
            
            // Recarregar a lista de membros
            this.loadMembers();
            
            this.showAddMemberForm = false;
            this.resetMemberForm();
            this.isAddingMember = false;
            
            // Mostrar notificação de sucesso
            await Swal.fire({
              icon: 'success',
              title: 'Sucesso!',
              text: 'Funcionário criado e adicionado com sucesso.',
              showConfirmButton: true,
              timer: 3000
            });
            
            console.log('[CompanyComponent.onAddMember] Adição concluída');
          },
        error: async (error: any) => {
          console.error('[CompanyComponent.onAddMember] Erro ao adicionar:', error);
          
          this.membersError = 'Erro ao criar usuário e adicionar funcionário';
          this.isAddingMember = false;
          
          // Mostrar notificação de erro
          await Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: 'Não foi possível criar o usuário e adicionar o funcionário. Tente novamente.',
            showConfirmButton: true
          });
        }
      });
    }
  }

  private validateMemberForm(): boolean {
    console.log('[CompanyComponent.validateMemberForm] Validando formulário de membro...');
    console.log('[CompanyComponent.validateMemberForm] Dados do formulário:', this.memberForm);
    
    if (!this.memberForm.name?.trim()) {
      console.log('[CompanyComponent.validateMemberForm] ERRO: Nome é obrigatório');
      this.membersError = 'Nome é obrigatório';
      return false;
    }
    if (!this.memberForm.email?.trim()) {
      console.log('[CompanyComponent.validateMemberForm] ERRO: Email é obrigatório');
      this.membersError = 'Email é obrigatório';
      return false;
    }
    if (!this.isValidEmail(this.memberForm.email)) {
      console.log('[CompanyComponent.validateMemberForm] ERRO: Email inválido');
      this.membersError = 'Email inválido';
      return false;
    }
    // Senha é obrigatória apenas para novos membros
    if (!this.editingMember) {
      if (!this.memberForm.password?.trim()) {
        console.log('[CompanyComponent.validateMemberForm] ERRO: Senha é obrigatória');
        this.membersError = 'Senha é obrigatória';
        return false;
      }
      if (this.memberForm.password.length < 6) {
        console.log('[CompanyComponent.validateMemberForm] ERRO: Senha deve ter pelo menos 6 caracteres');
        this.membersError = 'Senha deve ter pelo menos 6 caracteres';
        return false;
      }
    } else {
      // Para edição, senha é opcional, mas se fornecida deve ter pelo menos 6 caracteres
      if (this.memberForm.password && this.memberForm.password.length < 6) {
        console.log('[CompanyComponent.validateMemberForm] ERRO: Senha deve ter pelo menos 6 caracteres');
        this.membersError = 'Senha deve ter pelo menos 6 caracteres';
        return false;
      }
    }
    if (!this.memberForm.role) {
      console.log('[CompanyComponent.validateMemberForm] ERRO: Função é obrigatória');
      this.membersError = 'Função é obrigatória';
      return false;
    }
    
    console.log('[CompanyComponent.validateMemberForm] ✅ Validação passou');
    return true;
  }

  onEditMember(member: CompanyMember) {
    console.log('[CompanyComponent.onEditMember] ===== EDITANDO FUNCIONÁRIO =====');
    console.log('[CompanyComponent.onEditMember] Funcionário:', member);
    
    // Preencher formulário com dados do membro
    this.memberForm = {
      name: member.name || '',
      email: member.email || '',
      password: '', // Não mostrar senha atual
      role: member.role || 'member'
    };
    
    // Mostrar formulário de edição
    this.showAddMemberForm = true;
    this.editingMember = member;
    
    console.log('[CompanyComponent.onEditMember] Formulário preenchido:', this.memberForm);
  }

  onRemoveMember(member: CompanyMember) {
    console.log('[CompanyComponent.onRemoveMember] ===== REMOVENDO FUNCIONÁRIO =====');
    console.log('[CompanyComponent.onRemoveMember] Funcionário:', member);
    
    const memberName = this.getMemberDisplayName(member);
    
    Swal.fire({
      title: 'Confirmar Remoção',
      text: `Tem certeza que deseja remover o funcionário ${memberName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, remover!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('[CompanyComponent.onRemoveMember] Confirmação recebida, removendo...');
        
        this.companyService.removeMember(member.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: async () => {
              console.log('[CompanyComponent.onRemoveMember] Funcionário removido com sucesso');
              
              this.members = this.members.filter(m => m.id !== member.id);
              
              // Mostrar notificação de sucesso
              await Swal.fire({
                icon: 'success',
                title: 'Removido!',
                text: 'Funcionário removido com sucesso.',
                showConfirmButton: true,
                timer: 3000
              });
            },
            error: async (error: any) => {
              console.error('[CompanyComponent.onRemoveMember] Erro ao remover:', error);
              
              this.membersError = 'Erro ao remover funcionário';
              
              // Mostrar notificação de erro
              await Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: 'Não foi possível remover o funcionário. Tente novamente.',
                showConfirmButton: true
              });
            }
          });
      } else {
        console.log('[CompanyComponent.onRemoveMember] Remoção cancelada');
      }
    });
  }

  getMemberDisplayName(member: CompanyMember): string {
    return member.name || member.email || 'Nome não informado';
  }

  getRoleClass(role: string): string {
    switch (role) {
      case 'owner':
        return 'role-owner';
      case 'admin':
        return 'role-admin';
      case 'member':
        return 'role-member';
      default:
        return 'role-member';
    }
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'owner':
        return 'Proprietário';
      case 'admin':
        return 'Administrador';
      case 'member':
        return 'Membro';
      default:
        return 'Membro';
    }
  }

  // ===== MÉTODOS DE DOCUMENTOS =====
  
  private loadDocuments() {
    this.documentsLoading = true;
    this.documentsError = '';

    this.companyService.getCompanyDocuments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (documents) => {
          this.documents = documents;
          this.documentsLoading = false;
        },
        error: (error) => {
          this.documentsError = 'Erro ao carregar documentos';
          this.documentsLoading = false;
          console.error('Load documents error:', error);
        }
      });
  }

  private loadMissingDocuments() {
    this.companyService.getMissingDocuments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (documents) => {
          this.missingDocuments = documents;
        },
        error: (error) => {
          console.error('Load missing documents error:', error);
        }
      });
  }

  getDocumentsByStatus(status: 'valid' | 'warning' | 'expired'): CompanyDocument[] {
    return this.missingDocuments.filter(doc => {
      const daysUntilExpiry = this.getDaysUntilExpiry(doc.expires_at);
      switch (status) {
        case 'valid':
          return daysUntilExpiry > 15;
        case 'warning':
          return daysUntilExpiry > 0 && daysUntilExpiry <= 15;
        case 'expired':
          return daysUntilExpiry <= 0;
        default:
          return false;
      }
    });
  }

  onUpdateDocument(doc: CompanyDocument) {
    // TODO: Implementar modal de upload de documento
    console.log('Atualizando documento:', doc);
  }

  // ===== MÉTODOS GETTER PARA FORMULÁRIOS =====
  
  getCompanyFormValue(key: string): any {
    const value = (this.companyForm as any)[key] || '';
    console.log(`[CompanyComponent.getCompanyFormValue] Campo: ${key}, Valor: ${value}`);
    return value;
  }

  setCompanyFormValue(key: string, value: any): void {
    console.log(`[CompanyComponent.setCompanyFormValue] ===== DEFININDO VALOR =====`);
    console.log(`[CompanyComponent.setCompanyFormValue] Chave: ${key}`);
    console.log(`[CompanyComponent.setCompanyFormValue] Valor: ${value}`);
    console.log(`[CompanyComponent.setCompanyFormValue] Tipo do valor: ${typeof value}`);
    console.log(`[CompanyComponent.setCompanyFormValue] Formulário antes:`, this.companyForm);
    
    (this.companyForm as any)[key] = value;
    
    console.log(`[CompanyComponent.setCompanyFormValue] Formulário depois:`, this.companyForm);
    console.log(`[CompanyComponent.setCompanyFormValue] Valor confirmado: ${(this.companyForm as any)[key]}`);
    console.log(`[CompanyComponent.setCompanyFormValue] ===== VALOR DEFINIDO =====`);
  }

  getMemberFormValue(key: string): any {
    return (this.memberForm as any)[key] || '';
  }

  setMemberFormValue(key: string, value: any): void {
    (this.memberForm as any)[key] = value;
  }

  onInputChange(key: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    console.log(`[CompanyComponent.onInputChange] ===== CAPTURANDO INPUT =====`);
    console.log(`[CompanyComponent.onInputChange] Campo: ${key}`);
    console.log(`[CompanyComponent.onInputChange] Valor anterior: ${(this.companyForm as any)[key]}`);
    console.log(`[CompanyComponent.onInputChange] Valor novo: ${target.value}`);
    console.log(`[CompanyComponent.onInputChange] Tipo do valor: ${typeof target.value}`);
    
    this.setCompanyFormValue(key, target.value);
    
    console.log(`[CompanyComponent.onInputChange] Formulário após mudança:`, this.companyForm);
    console.log(`[CompanyComponent.onInputChange] Valor confirmado: ${(this.companyForm as any)[key]}`);
    console.log(`[CompanyComponent.onInputChange] ===== INPUT CAPTURADO =====`);
  }

  onTextareaChange(key: string, event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    console.log(`[CompanyComponent.onTextareaChange] ===== CAPTURANDO TEXTAREA =====`);
    console.log(`[CompanyComponent.onTextareaChange] Campo: ${key}`);
    console.log(`[CompanyComponent.onTextareaChange] Valor anterior: ${(this.companyForm as any)[key]}`);
    console.log(`[CompanyComponent.onTextareaChange] Valor novo: ${target.value}`);
    console.log(`[CompanyComponent.onTextareaChange] Tipo do valor: ${typeof target.value}`);
    
    this.setCompanyFormValue(key, target.value);
    
    console.log(`[CompanyComponent.onTextareaChange] Formulário após mudança:`, this.companyForm);
    console.log(`[CompanyComponent.onTextareaChange] Valor confirmado: ${(this.companyForm as any)[key]}`);
    console.log(`[CompanyComponent.onTextareaChange] ===== TEXTAREA CAPTURADO =====`);
  }

  onSelectChange(key: string, event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.setMemberFormValue(key, target.value);
  }

  // ===== MÉTODOS UTILITÁRIOS =====
  
  private getDaysUntilExpiry(expiresAt: string): number {
    const today = new Date();
    const expiryDate = new Date(expiresAt);
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  formatDate(date: string | null): string {
    if (!date) return 'Não informado';
    return new Date(date).toLocaleDateString('pt-BR');
  }

  // ===== MÉTODOS DE VALIDAÇÃO (para compatibilidade com HTML) =====
  
  getValidDocumentsCount(): number {
    return this.getDocumentsByStatus('valid').length;
  }

  getWarningDocumentsCount(): number {
    return this.getDocumentsByStatus('warning').length;
  }

  getExpiredDocumentsCount(): number {
    return this.getDocumentsByStatus('expired').length;
  }
}
