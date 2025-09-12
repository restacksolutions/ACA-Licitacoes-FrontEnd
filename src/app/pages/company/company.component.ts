import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CompanyService, Company, CompanyMember, CompanyDocument, CompanyUpdateData, DocumentUpdateData } from './company.service';
import { AuthService } from '../auth-pages/auth.service';

@Component({
  selector: 'app-company',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.css']
})
export class CompanyComponent implements OnInit, OnDestroy {
  @ViewChild('logoInput') logoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('letterheadInput') letterheadInput!: ElementRef<HTMLInputElement>;
  @ViewChild('documentInput') documentInput!: ElementRef<HTMLInputElement>;

  private destroy$ = new Subject<void>();

  // Company Info
  company: Company | null = null;
  companyLoading = false;
  companyError = '';
  editingCompany = false;
  companyForm: CompanyUpdateData = {};

  // Members
  members: CompanyMember[] = [];
  membersLoading = false;
  membersError = '';
  showAddMemberForm = false;
  newMemberEmail = '';
  newMemberRole: 'admin' | 'member' = 'member';
  editingMember: string | null = null;

  // Documents
  documents: CompanyDocument[] = [];
  missingDocuments: CompanyDocument[] = [];
  documentsLoading = false;
  documentsError = '';
  showAddDocumentForm = false;
  newDocument: DocumentUpdateData = {
    doc_type: 'outros',
    doc_number: '',
    issuer: '',
    issue_date: '',
    expires_at: '',
    notes: ''
  };

  // UI State
  activeTab: 'info' | 'members' | 'documents' = 'info';

  constructor(
    private companyService: CompanyService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCompanyData();
    this.loadMembers();
    this.loadDocuments();
    this.loadMissingDocuments();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setActiveTab(tab: 'info' | 'members' | 'documents') {
    this.activeTab = tab;
  }

  // Company Methods
  loadCompanyData() {
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

  toggleEditCompany() {
    this.editingCompany = !this.editingCompany;
    if (this.editingCompany && this.company) {
      this.companyForm = {
        name: this.company.name || '',
        cnpj: this.company.cnpj || '',
        legal_name: this.company.legal_name || '',
        state_registration: this.company.state_registration || '',
        municipal_registration: this.company.municipal_registration || '',
        phone: this.company.phone || '',
        address: this.company.address || '',
        email: this.company.email || ''
      };
    }
  }

  cancelEditCompany() {
    this.editingCompany = false;
    this.companyForm = {};
  }

  saveCompany() {
    console.log('[Company] Salvando informações da empresa:', this.companyForm);
    
    // TODO: Implementar chamada para API
    // Por enquanto, apenas mostra um alerta
    alert('Informações da empresa salvas com sucesso!\n\nEsta funcionalidade será implementada em breve.');
    
    this.editingCompany = false;
    this.companyForm = {};
  }

  // Members Methods
  loadMembers() {
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

  toggleAddMemberForm() {
    this.showAddMemberForm = !this.showAddMemberForm;
    if (!this.showAddMemberForm) {
      this.newMemberEmail = '';
      this.newMemberRole = 'member';
    }
  }

  addMember() {
    if (!this.newMemberEmail) {
      alert('Por favor, informe o email do funcionário.');
      return;
    }

    console.log('[Company] Adicionando funcionário:', {
      email: this.newMemberEmail,
      role: this.newMemberRole
    });

    // TODO: Implementar chamada para API
    // Por enquanto, apenas mostra um alerta
    alert(`Funcionário adicionado com sucesso!\n\nEmail: ${this.newMemberEmail}\nFunção: ${this.newMemberRole}\n\nEsta funcionalidade será implementada em breve.`);
    
    this.toggleAddMemberForm();
  }

  editMember(member: CompanyMember) {
    console.log('[Company] Editando funcionário:', member);
    
    // TODO: Implementar modal de edição
    alert(`Editando funcionário: ${member.name || member.email}\n\nEsta funcionalidade será implementada em breve.`);
  }

  removeMember(member: CompanyMember) {
    if (confirm(`Tem certeza que deseja remover o funcionário ${member.name || member.email}?`)) {
      console.log('[Company] Removendo funcionário:', member);
      
      // TODO: Implementar chamada para API
      alert(`Funcionário ${member.name || member.email} removido com sucesso!\n\nEsta funcionalidade será implementada em breve.`);
    }
  }

  getRoleClass(role: string): string {
    switch (role) {
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
      case 'admin':
        return 'Administrador';
      case 'member':
        return 'Membro';
      default:
        return 'Membro';
    }
  }

  // Documents Methods
  loadDocuments() {
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

  loadMissingDocuments() {
    // Mock data para documentos faltantes com datas variadas (hoje: 12/09/2025)
    this.missingDocuments = [
      // DOCUMENTOS EXPIRADOS (vermelho) - expirados há mais de 1 dia
      {
        id: '1',
        company_id: 'company-1',
        doc_type: 'cnpj',
        doc_number: '12.345.678/0001-90',
        issuer: 'Receita Federal',
        issue_date: '2023-01-15',
        expires_at: '2024-12-31', // Expirado há 255 dias
        file_path: null,
        notes: 'CNPJ',
        version: 1,
        created_at: '2023-01-15',
        updated_at: '2023-01-15'
      },
      {
        id: '2',
        company_id: 'company-1',
        doc_type: 'inscricao_estadual',
        doc_number: '123456789',
        issuer: 'Sefaz',
        issue_date: '2023-02-01',
        expires_at: '2024-12-31', // Expirado há 255 dias
        file_path: null,
        notes: 'Inscrição Estadual',
        version: 1,
        created_at: '2023-02-01',
        updated_at: '2023-02-01'
      },
      {
        id: '3',
        company_id: 'company-1',
        doc_type: 'alvara',
        doc_number: 'ALV-2023-001',
        issuer: 'Prefeitura',
        issue_date: '2023-03-01',
        expires_at: '2024-03-01', // Expirado há 195 dias
        file_path: null,
        notes: 'Alvará de Funcionamento',
        version: 1,
        created_at: '2023-03-01',
        updated_at: '2023-03-01'
      },
      {
        id: '4',
        company_id: 'company-1',
        doc_type: 'contrato_social',
        doc_number: 'CS-2023-001',
        issuer: 'Cartório',
        issue_date: '2023-01-10',
        expires_at: '2024-01-10', // Expirado há 245 dias
        file_path: null,
        notes: 'Contrato Social',
        version: 1,
        created_at: '2023-01-10',
        updated_at: '2023-01-10'
      },
      {
        id: '5',
        company_id: 'company-1',
        doc_type: 'certidao_fgts',
        doc_number: 'CND-2023-001',
        issuer: 'Caixa Econômica',
        issue_date: '2023-04-01',
        expires_at: '2024-04-01', // Expirado há 164 dias
        file_path: null,
        notes: 'Certidão FGTS',
        version: 1,
        created_at: '2023-04-01',
        updated_at: '2023-04-01'
      },
      {
        id: '6',
        company_id: 'company-1',
        doc_type: 'certidao_inss',
        doc_number: 'CND-2023-002',
        issuer: 'INSS',
        issue_date: '2023-04-01',
        expires_at: '2024-04-01', // Expirado há 164 dias
        file_path: null,
        notes: 'Certidão INSS',
        version: 1,
        created_at: '2023-04-01',
        updated_at: '2023-04-01'
      },
      {
        id: '7',
        company_id: 'company-1',
        doc_type: 'outros',
        doc_number: 'AT-2023-001',
        issuer: 'Órgão Competente',
        issue_date: '2023-05-01',
        expires_at: '2024-05-01', // Expirado há 134 dias
        file_path: null,
        notes: 'Atestado de Capacidade Técnica',
        version: 1,
        created_at: '2023-05-01',
        updated_at: '2023-05-01'
      },
      {
        id: '8',
        company_id: 'company-1',
        doc_type: 'outros',
        doc_number: 'CNH-2023-001',
        issuer: 'DETRAN',
        issue_date: '2023-06-01',
        expires_at: '2024-06-01', // Expirado há 103 dias
        file_path: null,
        notes: 'CNH Sócio',
        version: 1,
        created_at: '2023-06-01',
        updated_at: '2023-06-01'
      },
      {
        id: '9',
        company_id: 'company-1',
        doc_type: 'outros',
        doc_number: 'CNH-2023-002',
        issuer: 'DETRAN',
        issue_date: '2023-07-01',
        expires_at: '2024-07-01', // Expirado há 73 dias
        file_path: null,
        notes: 'CNH Procurador',
        version: 1,
        created_at: '2023-07-01',
        updated_at: '2023-07-01'
      },
      {
        id: '10',
        company_id: 'company-1',
        doc_type: 'outros',
        doc_number: 'PROC-2023-001',
        issuer: 'Cartório',
        issue_date: '2023-08-01',
        expires_at: '2024-08-01', // Expirado há 42 dias
        file_path: null,
        notes: 'Procuração',
        version: 1,
        created_at: '2023-08-01',
        updated_at: '2023-08-01'
      },
      {
        id: '11',
        company_id: 'company-1',
        doc_type: 'outros',
        doc_number: 'CS-2023-002',
        issuer: 'Cartório',
        issue_date: '2023-09-01',
        expires_at: '2024-09-01', // Expirado há 11 dias
        file_path: null,
        notes: 'Contrato Social',
        version: 1,
        created_at: '2023-09-01',
        updated_at: '2023-09-01'
      },
      {
        id: '12',
        company_id: 'company-1',
        doc_type: 'outros',
        doc_number: 'CERT-2023-001',
        issuer: 'Receita Federal',
        issue_date: '2023-10-01',
        expires_at: '2024-10-01', // Expirado há 19 dias
        file_path: null,
        notes: 'Certidão Simplificada',
        version: 1,
        created_at: '2023-10-01',
        updated_at: '2023-10-01'
      },

      // DOCUMENTOS COM AVISO (amarelo) - expiram em 1-15 dias
      {
        id: '13',
        company_id: 'company-1',
        doc_type: 'outros',
        doc_number: 'CICAD-2023-001',
        issuer: 'Órgão Competente',
        issue_date: '2024-08-15',
        expires_at: '2025-09-15', // Expira em 3 dias
        file_path: null,
        notes: 'CICAD',
        version: 1,
        created_at: '2024-08-15',
        updated_at: '2024-08-15'
      },
      {
        id: '14',
        company_id: 'company-1',
        doc_type: 'inscricao_municipal',
        doc_number: 'IM-2023-001',
        issuer: 'Prefeitura',
        issue_date: '2024-08-20',
        expires_at: '2025-09-20', // Expira em 8 dias
        file_path: null,
        notes: 'Inscrição Municipal',
        version: 1,
        created_at: '2024-08-20',
        updated_at: '2024-08-20'
      },
      {
        id: '15',
        company_id: 'company-1',
        doc_type: 'alvara',
        doc_number: 'ALV-2024-001',
        issuer: 'Prefeitura',
        issue_date: '2024-09-01',
        expires_at: '2025-09-25', // Expira em 13 dias
        file_path: null,
        notes: 'Alvará de Funcionamento',
        version: 1,
        created_at: '2024-09-01',
        updated_at: '2024-09-01'
      },
      {
        id: '16',
        company_id: 'company-1',
        doc_type: 'outros',
        doc_number: 'QSA-2023-001',
        issuer: 'Cartório',
        issue_date: '2024-09-05',
        expires_at: '2025-09-27', // Expira em 15 dias
        file_path: null,
        notes: 'QSA',
        version: 1,
        created_at: '2024-09-05',
        updated_at: '2024-09-05'
      },
      {
        id: '17',
        company_id: 'company-1',
        doc_type: 'outros',
        doc_number: 'SINTEGRA-2023-001',
        issuer: 'Sefaz',
        issue_date: '2024-09-10',
        expires_at: '2025-09-30', // Expira em 18 dias (ainda válido, mas próximo)
        file_path: null,
        notes: 'SINTEGRA',
        version: 1,
        created_at: '2024-09-10',
        updated_at: '2024-09-10'
      },

      // DOCUMENTOS VÁLIDOS (verde) - expiram em mais de 15 dias
      {
        id: '18',
        company_id: 'company-1',
        doc_type: 'outros',
        doc_number: 'CERT-FAL-2023-001',
        issuer: 'Tribunal',
        issue_date: '2024-10-01',
        expires_at: '2025-12-31', // Expira em 110 dias
        file_path: null,
        notes: 'Certidão de Falência',
        version: 1,
        created_at: '2024-10-01',
        updated_at: '2024-10-01'
      },
      {
        id: '19',
        company_id: 'company-1',
        doc_type: 'outros',
        doc_number: 'BAL-2023-001',
        issuer: 'Contador',
        issue_date: '2024-01-01',
        expires_at: '2025-12-31', // Expira em 110 dias
        file_path: null,
        notes: 'Balanço de 2023',
        version: 1,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      },
      {
        id: '20',
        company_id: 'company-1',
        doc_type: 'outros',
        doc_number: 'BAL-2024-001',
        issuer: 'Contador',
        issue_date: '2024-12-31',
        expires_at: '2026-12-31', // Expira em 475 dias
        file_path: null,
        notes: 'Balanço 2024',
        version: 1,
        created_at: '2024-12-31',
        updated_at: '2024-12-31'
      },
      {
        id: '21',
        company_id: 'company-1',
        doc_type: 'outros',
        doc_number: 'IND-2024-001',
        issuer: 'Órgão Competente',
        issue_date: '2024-11-01',
        expires_at: '2025-11-01', // Expira em 50 dias
        file_path: null,
        notes: 'Índices Econômicos',
        version: 1,
        created_at: '2024-11-01',
        updated_at: '2024-11-01'
      },
      {
        id: '22',
        company_id: 'company-1',
        doc_type: 'cnpj',
        doc_number: '12.345.678/0001-90',
        issuer: 'Receita Federal',
        issue_date: '2024-12-01',
        expires_at: '2026-12-01', // Expira em 445 dias
        file_path: null,
        notes: 'CNPJ',
        version: 2,
        created_at: '2024-12-01',
        updated_at: '2024-12-01'
      },
      {
        id: '23',
        company_id: 'company-1',
        doc_type: 'certidao_fgts',
        doc_number: 'CND-FED-2024-001',
        issuer: 'Receita Federal',
        issue_date: '2024-10-15',
        expires_at: '2025-10-15', // Expira em 33 dias
        file_path: null,
        notes: 'CND Federal',
        version: 1,
        created_at: '2024-10-15',
        updated_at: '2024-10-15'
      },
      {
        id: '24',
        company_id: 'company-1',
        doc_type: 'certidao_inss',
        doc_number: 'CND-EST-2024-001',
        issuer: 'Sefaz',
        issue_date: '2024-10-20',
        expires_at: '2025-10-20', // Expira em 38 dias
        file_path: null,
        notes: 'CND Estadual',
        version: 1,
        created_at: '2024-10-20',
        updated_at: '2024-10-20'
      },
      {
        id: '25',
        company_id: 'company-1',
        doc_type: 'certidao_municipal',
        doc_number: 'CND-MUN-2024-001',
        issuer: 'Prefeitura',
        issue_date: '2024-10-25',
        expires_at: '2025-10-25', // Expira em 43 dias
        file_path: null,
        notes: 'CND Municipal',
        version: 1,
        created_at: '2024-10-25',
        updated_at: '2024-10-25'
      },
      {
        id: '26',
        company_id: 'company-1',
        doc_type: 'certidao_fgts',
        doc_number: 'CND-FGTS-2024-001',
        issuer: 'Caixa Econômica',
        issue_date: '2024-11-01',
        expires_at: '2025-11-01', // Expira em 50 dias
        file_path: null,
        notes: 'CND FGTS',
        version: 1,
        created_at: '2024-11-01',
        updated_at: '2024-11-01'
      },
      {
        id: '27',
        company_id: 'company-1',
        doc_type: 'certidao_trabalhista',
        doc_number: 'CNDT-2024-001',
        issuer: 'Ministério do Trabalho',
        issue_date: '2024-11-05',
        expires_at: '2025-11-05', // Expira em 54 dias
        file_path: null,
        notes: 'CNDT - Trabalhista',
        version: 1,
        created_at: '2024-11-05',
        updated_at: '2024-11-05'
      }
    ];
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

  getValidDocumentsCount(): number {
    return this.getDocumentsByStatus('valid').length;
  }

  getWarningDocumentsCount(): number {
    return this.getDocumentsByStatus('warning').length;
  }

  getExpiredDocumentsCount(): number {
    return this.getDocumentsByStatus('expired').length;
  }

  private getDaysUntilExpiry(expiresAt: string): number {
    const today = new Date();
    const expiryDate = new Date(expiresAt);
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getDocumentTypeLabel(docType: string): string {
    const labels: { [key: string]: string } = {
      'cnpj': 'CNPJ',
      'inscricao_estadual': 'Inscrição Estadual',
      'inscricao_municipal': 'Inscrição Municipal',
      'alvara': 'Alvará de Funcionamento',
      'contrato_social': 'Contrato Social',
      'certificado_digital': 'Certificado Digital',
      'licenca_ambiental': 'Licença Ambiental',
      'certidao_fgts': 'Certidão FGTS',
      'certidao_inss': 'Certidão INSS',
      'certidao_trabalhista': 'Certidão Trabalhista',
      'certidao_municipal': 'Certidão Municipal',
      'outros': 'Outros'
    };
    return labels[docType] || docType;
  }

  getDocumentStatusClass(doc: CompanyDocument): string {
    const daysUntilExpiry = this.getDaysUntilExpiry(doc.expires_at);
    if (daysUntilExpiry <= 0) {
      return 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200';
    } else if (daysUntilExpiry <= 15) {
      return 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200';
    } else {
      return 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200';
    }
  }

  getDocumentStatusText(doc: CompanyDocument): string {
    const daysUntilExpiry = this.getDaysUntilExpiry(doc.expires_at);
    if (daysUntilExpiry <= 0) {
      return 'Expirado';
    } else if (daysUntilExpiry <= 15) {
      return `${daysUntilExpiry} dias`;
    } else {
      return 'Válido';
    }
  }

  formatDate(date: string | null): string {
    if (!date) return 'Não informado';
    return new Date(date).toLocaleDateString('pt-BR');
  }

  updateDocument(doc: CompanyDocument) {
    console.log('[Company] Atualizando documento:', doc);
    
    // TODO: Implementar lógica de upload de documento
    // Por enquanto, apenas mostra um alerta
    alert(`Atualizando documento: ${doc.notes}\n\nEsta funcionalidade será implementada em breve.`);
    
    // Aqui você pode implementar:
    // 1. Abrir modal de upload
    // 2. Selecionar arquivo
    // 3. Fazer upload para o servidor
    // 4. Atualizar o documento no banco
    // 5. Recarregar a lista de documentos
  }
}