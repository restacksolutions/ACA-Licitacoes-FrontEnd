import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, switchMap } from 'rxjs';
import { CompanyService, Company, CompanyMember, CompanyUpdateData, DocumentUpdateData } from './company.service';
import { AuthService } from '../auth-pages/auth.service';
import { DocumentsService, UploadDocumentRequest, CompanyDocument } from '../../core/services/documents.service';
import { ApiService } from '../../core/services/api.service';
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
  filteredDocuments: CompanyDocument[] = [];
  missingDocuments: any[] = [];
  documentsLoading = false;
  documentsError = '';
  showUploadModal = false;
  showEditModal = false;
  selectedFile: File | null = null;
  selectedEditFile: File | null = null;
  selectedDocType: string = '';
  editingDocument: CompanyDocument | null = null;
  
  // Upload form
  uploadForm: UploadDocumentRequest = {
    docType: 'CNPJ',
    file: null as any
  };

  // Edit form
  editForm: {
    docType: string;
    docNumber?: string;
    issuer?: string;
    issueDate?: string;
    expiresAt?: string;
    notes?: string;
    file?: File | null;
  } = {
    docType: 'CNPJ',
    file: null
  };

  // Document types
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
    private documentsService: DocumentsService,
    private apiService: ApiService,
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

        return this.documentsService.getDocuments(companyId);
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.documents = response.documents;
        this.filteredDocuments = response.documents;
        this.documentsLoading = false;
      },
      error: (error) => {
        this.documentsError = error.message || 'Erro ao carregar documentos';
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
    return this.documents.filter(doc => {
      if (!doc.expiresAt) {
        return status === 'valid'; // Documentos sem data de expiração são considerados válidos
      }
      
      const now = new Date();
      const expirationDate = new Date(doc.expiresAt);
      const daysDiff = (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      
      switch (status) {
        case 'valid':
          return daysDiff > 30; // Mais de 30 dias para expirar
        case 'warning':
          return daysDiff > 0 && daysDiff <= 30; // Entre 1 e 30 dias para expirar
        case 'expired':
          return daysDiff <= 0; // Já expirado
        default:
          return false;
      }
    });
  }

  // ===== MÉTODOS CRUD DE DOCUMENTOS =====

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
    this.documentsError = '';
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validar tamanho (20MB)
      if (file.size > 20 * 1024 * 1024) {
        this.documentsError = 'Arquivo muito grande. Máximo 20MB.';
        return;
      }

      // Validar tipo
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        this.documentsError = 'Tipo de arquivo não permitido. Use PDF, JPEG ou PNG.';
        return;
      }

      this.selectedFile = file;
      this.uploadForm.file = file;
      this.documentsError = '';
    }
  }

  uploadDocument() {
    if (!this.uploadForm.file) {
      this.documentsError = 'Selecione um arquivo';
      return;
    }

    this.documentsLoading = true;
    this.documentsError = '';

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
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (document) => {
        this.loadDocuments(); // Recarregar lista
        this.closeUploadModal();
        this.documentsLoading = false;
        Swal.fire('Sucesso!', 'Documento enviado com sucesso!', 'success');
      },
      error: (error) => {
        this.documentsError = error.message || 'Erro ao fazer upload do documento';
        this.documentsLoading = false;
        Swal.fire('Erro!', this.documentsError, 'error');
      }
    });
  }

  downloadDocument(document: CompanyDocument) {
    console.log('🔽 [CompanyComponent.downloadDocument] ===== INICIANDO DOWNLOAD =====');
    console.log('📄 Documento:', document);
    
    this.apiService.getCompanies().pipe(
      switchMap(companies => {
        console.log('🏢 [CompanyComponent.downloadDocument] Empresas encontradas:', companies);
        
        if (companies.length === 0) {
          throw new Error('Nenhuma empresa encontrada');
        }
        
        const companyData = companies[0];
        const company = companyData.company || companyData;
        const companyId = company.id;
        
        console.log('🏢 [CompanyComponent.downloadDocument] CompanyId:', companyId);
        
        if (!companyId) {
          throw new Error('ID da empresa não encontrado');
        }

        console.log('📥 [CompanyComponent.downloadDocument] Chamando downloadDocument...');
        return this.documentsService.downloadDocument(companyId, document.id);
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (blob) => {
        console.log('✅ [CompanyComponent.downloadDocument] Blob recebido:', blob);
        console.log('📊 [CompanyComponent.downloadDocument] Tamanho do blob:', blob.size);
        
        const url = window.URL.createObjectURL(blob);
        const link = window.document.createElement('a');
        link.href = url;
        link.download = `${document.docType}_v${document.version}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        console.log('✅ [CompanyComponent.downloadDocument] Download iniciado com sucesso');
      },
      error: (error) => {
        console.error('❌ [CompanyComponent.downloadDocument] Erro no download:', error);
        this.documentsError = error.message || 'Erro ao baixar documento';
        Swal.fire('Erro!', this.documentsError, 'error');
      }
    });
  }

  editDocument(document: CompanyDocument) {
    console.log('✏️ [CompanyComponent.editDocument] ===== INICIANDO EDIÇÃO =====');
    console.log('📄 [CompanyComponent.editDocument] Documento:', document);
    this.editingDocument = document;
    this.showEditModal = true;
    this.initializeEditForm(document);
    console.log('✅ [CompanyComponent.editDocument] Modal de edição aberto');
  }

  initializeEditForm(document: CompanyDocument) {
    this.editForm = {
      docType: document.docType,
      docNumber: document.docNumber || '',
      issuer: document.issuer || '',
      issueDate: document.issueDate ? new Date(document.issueDate).toISOString().split('T')[0] : '',
      expiresAt: document.expiresAt ? new Date(document.expiresAt).toISOString().split('T')[0] : '',
      notes: document.notes || '',
      file: null
    };
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingDocument = null;
    this.selectedEditFile = null;
    this.editForm = {
      docType: 'CNPJ',
      file: null
    };
  }

  onEditFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validar tamanho (20MB)
      if (file.size > 20 * 1024 * 1024) {
        this.documentsError = 'Arquivo muito grande. Máximo 20MB.';
        return;
      }

      // Validar tipo
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        this.documentsError = 'Tipo de arquivo não permitido. Use PDF, JPEG ou PNG.';
        return;
      }

      this.selectedEditFile = file;
      this.editForm.file = file;
      this.documentsError = '';
    }
  }

  updateDocument() {
    if (!this.editingDocument) {
      this.documentsError = 'Nenhum documento selecionado para edição';
      return;
    }

    this.documentsLoading = true;
    this.documentsError = '';

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

        // Se há um novo arquivo, fazer reupload (criar nova versão)
        if (this.editForm.file) {
          const uploadData: UploadDocumentRequest = {
            docType: this.editForm.docType as any,
            docNumber: this.editForm.docNumber,
            issuer: this.editForm.issuer,
            issueDate: this.editForm.issueDate,
            expiresAt: this.editForm.expiresAt,
            notes: this.editForm.notes,
            file: this.editForm.file
          };
          return this.documentsService.reuploadDocument(companyId, this.editingDocument!.id, uploadData);
        } else {
          // Apenas atualizar metadados
          const updateData = {
            docType: this.editForm.docType as any,
            docNumber: this.editForm.docNumber,
            issuer: this.editForm.issuer,
            issueDate: this.editForm.issueDate,
            expiresAt: this.editForm.expiresAt,
            notes: this.editForm.notes
          };
          return this.documentsService.updateDocument(companyId, this.editingDocument!.id, updateData);
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (document) => {
        this.loadDocuments(); // Recarregar lista
        this.closeEditModal();
        this.documentsLoading = false;
        Swal.fire('Sucesso!', 'Documento atualizado com sucesso!', 'success');
      },
      error: (error) => {
        this.documentsError = error.message || 'Erro ao atualizar documento';
        this.documentsLoading = false;
        Swal.fire('Erro!', this.documentsError, 'error');
      }
    });
  }

  deleteDocument(document: CompanyDocument) {
    console.log('🗑️ [CompanyComponent.deleteDocument] ===== INICIANDO EXCLUSÃO =====');
    console.log('📄 [CompanyComponent.deleteDocument] Documento:', document);
    
    Swal.fire({
      title: 'Tem certeza?',
      text: 'Esta ação não pode ser desfeita!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('✅ [CompanyComponent.deleteDocument] Confirmação recebida, excluindo...');
        
        this.apiService.getCompanies().pipe(
          switchMap(companies => {
            console.log('🏢 [CompanyComponent.deleteDocument] Empresas encontradas:', companies);
            
            if (companies.length === 0) {
              throw new Error('Nenhuma empresa encontrada');
            }
            
            const companyData = companies[0];
            const company = companyData.company || companyData;
            const companyId = company.id;
            
            console.log('🏢 [CompanyComponent.deleteDocument] CompanyId:', companyId);
            
            if (!companyId) {
              throw new Error('ID da empresa não encontrado');
            }

            console.log('🗑️ [CompanyComponent.deleteDocument] Chamando deleteDocument...');
            return this.documentsService.deleteDocument(companyId, document.id);
          }),
          takeUntil(this.destroy$)
        ).subscribe({
          next: () => {
            console.log('✅ [CompanyComponent.deleteDocument] Documento excluído com sucesso');
            this.loadDocuments(); // Recarregar lista
            Swal.fire('Excluído!', 'Documento excluído com sucesso!', 'success');
          },
          error: (error) => {
            console.error('❌ [CompanyComponent.deleteDocument] Erro na exclusão:', error);
            console.error('❌ [CompanyComponent.deleteDocument] Status:', error.status);
            console.error('❌ [CompanyComponent.deleteDocument] Message:', error.message);
            console.error('❌ [CompanyComponent.deleteDocument] Error:', error.error);
            this.documentsError = error.message || 'Erro ao excluir documento';
            Swal.fire('Erro!', this.documentsError, 'error');
          }
        });
      } else {
        console.log('❌ [CompanyComponent.deleteDocument] Exclusão cancelada pelo usuário');
      }
    });
  }

  onDocTypeFilterChange() {
    if (this.selectedDocType) {
      this.filteredDocuments = this.documents.filter(doc => doc.docType === this.selectedDocType);
    } else {
      this.filteredDocuments = this.documents;
    }
  }

  getDocumentTypeLabel(docType: string): string {
    const type = this.docTypes.find(t => t.value === docType);
    return type ? type.label : docType;
  }

  getDocumentStatus(document: CompanyDocument): 'valid' | 'warning' | 'expired' {
    if (!document.expiresAt) return 'valid';
    
    const now = new Date();
    const expirationDate = new Date(document.expiresAt);
    const daysDiff = (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysDiff < 0) return 'expired';
    if (daysDiff <= 30) return 'warning';
    return 'valid';
  }

  getDocumentStatusLabel(status: 'valid' | 'warning' | 'expired'): string {
    const labels = {
      'valid': 'Válido',
      'warning': 'Expirando em breve',
      'expired': 'Expirado'
    };
    return labels[status] || status;
  }

  formatFileSize(bytes?: number): string {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
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
