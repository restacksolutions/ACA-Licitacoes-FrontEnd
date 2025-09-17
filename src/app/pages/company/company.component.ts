import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CompanyService, Company, CompanyMember, CompanyDocument, CompanyUpdateData, DocumentUpdateData } from './company.service';
import { AuthService } from '../auth-pages/auth.service';

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
  memberForm: { email: string; role: 'admin' | 'member' } = { email: '', role: 'member' };

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
      key: 'email', 
      label: 'Email', 
      type: 'email', 
      required: true 
    },
    { 
      key: 'role', 
      label: 'Função', 
      type: 'select', 
      required: true,
      options: [
        { value: 'member', label: 'Membro' },
        { value: 'admin', label: 'Administrador' }
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
    this.initializeComponent();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== MÉTODOS DE INICIALIZAÇÃO =====
  
  private initializeComponent() {
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
    this.companyLoading = true;
    this.companyError = '';

    this.companyService.getCompanyInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (company: Company) => {
          this.company = company;
          this.companyLoading = false;
        },
        error: (error: any) => {
          this.companyError = 'Erro ao carregar dados da empresa';
          this.companyLoading = false;
          console.error('Load company error:', error);
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
  }

  onCancelEditCompany() {
    this.editingCompany = false;
    this.companyForm = {};
  }

  onSaveCompany() {
    if (!this.validateCompanyForm()) {
      return;
    }

    this.isSaving = true;
    this.companyError = '';

    this.companyService.updateCompanyInfo(this.companyForm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedCompany: Company) => {
          this.company = updatedCompany;
    this.editingCompany = false;
    this.companyForm = {};
          this.isSaving = false;
          // TODO: Mostrar notificação de sucesso
        },
        error: (error: any) => {
          this.companyError = 'Erro ao salvar informações da empresa';
          this.isSaving = false;
          console.error('Save company error:', error);
        }
      });
  }

  private validateCompanyForm(): boolean {
    if (!this.companyForm.name?.trim()) {
      this.companyError = 'Nome da empresa é obrigatório';
      return false;
    }
    if (!this.companyForm.cnpj?.trim()) {
      this.companyError = 'CNPJ é obrigatório';
      return false;
    }
    return true;
  }

  // ===== MÉTODOS DE FUNCIONÁRIOS =====
  
  private loadMembers() {
    this.membersLoading = true;
    this.membersError = '';

    this.companyService.getCompanyMembers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (members) => {
          this.members = members;
          this.membersLoading = false;
        },
        error: (error) => {
          this.membersError = 'Erro ao carregar membros';
          this.membersLoading = false;
          console.error('Load members error:', error);
        }
      });
  }

  onToggleAddMemberForm() {
    this.showAddMemberForm = !this.showAddMemberForm;
    if (!this.showAddMemberForm) {
      this.resetMemberForm();
    }
  }

  private resetMemberForm() {
    this.memberForm = { email: '', role: 'member' };
  }

  onAddMember() {
    if (!this.validateMemberForm()) {
      return;
    }

    this.isAddingMember = true;
    this.membersError = '';

    this.companyService.addMember(this.memberForm.email, this.memberForm.role)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newMember: CompanyMember) => {
          this.members.push(newMember);
          this.showAddMemberForm = false;
          this.resetMemberForm();
          this.isAddingMember = false;
          // TODO: Mostrar notificação de sucesso
        },
        error: (error: any) => {
          this.membersError = 'Erro ao adicionar funcionário';
          this.isAddingMember = false;
          console.error('Add member error:', error);
        }
      });
  }

  private validateMemberForm(): boolean {
    if (!this.memberForm.email?.trim()) {
      this.membersError = 'Email é obrigatório';
      return false;
    }
    if (!this.isValidEmail(this.memberForm.email)) {
      this.membersError = 'Email inválido';
      return false;
    }
    return true;
  }

  onEditMember(member: CompanyMember) {
    // TODO: Implementar modal de edição
    console.log('Editando funcionário:', member);
  }

  onRemoveMember(member: CompanyMember) {
    if (confirm(`Tem certeza que deseja remover o funcionário ${this.getMemberDisplayName(member)}?`)) {
      this.companyService.removeMember(member.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.members = this.members.filter(m => m.id !== member.id);
            // TODO: Mostrar notificação de sucesso
          },
          error: (error: any) => {
            this.membersError = 'Erro ao remover funcionário';
            console.error('Remove member error:', error);
          }
        });
    }
  }

  getMemberDisplayName(member: CompanyMember): string {
    return member.name || member.email || 'Nome não informado';
  }

  getRoleClass(role: string): string {
    return role === 'admin' ? 'role-admin' : 'role-member';
  }

  getRoleLabel(role: string): string {
    return role === 'admin' ? 'Administrador' : 'Membro';
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
    return (this.companyForm as any)[key] || '';
  }

  setCompanyFormValue(key: string, value: any): void {
    (this.companyForm as any)[key] = value;
  }

  getMemberFormValue(key: string): any {
    return (this.memberForm as any)[key] || '';
  }

  setMemberFormValue(key: string, value: any): void {
    (this.memberForm as any)[key] = value;
  }

  onInputChange(key: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.setCompanyFormValue(key, target.value);
  }

  onTextareaChange(key: string, event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.setCompanyFormValue(key, target.value);
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
