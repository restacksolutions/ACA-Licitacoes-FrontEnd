import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

// Interfaces baseadas no schema SQL
export interface Company {
  id: string;
  name: string;
  cnpj: string;
  legal_name?: string;
  state_registration?: string;
  municipal_registration?: string;
  phone?: string;
  address?: string;
  email?: string;
  logo_path?: string;
  letterhead_path?: string;
  active: boolean;
  created_by: string;
  created_at: string;
}

export interface CompanyMember {
  id: string;
  company_id: string;
  user_id: string;
  role: 'admin' | 'member';
  name?: string;
  email: string;
  created_at: string;
  user?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface CompanyDocument {
  id: string;
  company_id: string;
  doc_type: 'cnpj' | 'inscricao_estadual' | 'inscricao_municipal' | 'alvara' | 'contrato_social' | 'certificado_digital' | 'licenca_ambiental' | 'certidao_fgts' | 'certidao_inss' | 'certidao_trabalhista' | 'certidao_municipal' | 'outros';
  doc_number: string;
  issuer: string;
  issue_date: string | null;
  expires_at: string;
  file_path: string | null;
  notes?: string;
  version: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface CompanyUpdateData {
  name?: string;
  cnpj?: string;
  legal_name?: string;
  state_registration?: string;
  municipal_registration?: string;
  phone?: string;
  address?: string;
  email?: string;
  logo_path?: string;
  letterhead_path?: string;
  active?: boolean;
}

export interface MemberUpdateData {
  role: 'admin' | 'member';
}

export interface DocumentUpdateData {
  doc_type: string;
  doc_number?: string;
  issuer?: string;
  issue_date?: string;
  expires_at?: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  constructor() { }

  // ===== COMPANY METHODS =====
  
  getCompanyInfo(): Observable<Company> {
    // TODO: Implementar chamada real para API
    const mockCompany: Company = {
      id: '1',
      name: 'Empresa Exemplo Ltda',
      cnpj: '12.345.678/0001-90',
      phone: '(11) 99999-9999',
      address: 'Rua das Flores, 123 - Centro - São Paulo/SP - 01234-567',
      logo_path: '/assets/images/company-logo.png',
      letterhead_path: '/assets/images/company-letterhead.png',
      active: true,
      created_by: 'user-1',
      created_at: '2024-01-15T10:00:00Z'
    };

    return of(mockCompany).pipe(delay(500));
  }

  updateCompanyInfo(data: CompanyUpdateData): Observable<Company> {
    // TODO: Implementar chamada real para API
    console.log('Atualizando informações da empresa:', data);
    return this.getCompanyInfo();
  }

  uploadCompanyLogo(file: File): Observable<{ logo_path: string }> {
    // TODO: Implementar upload real para API
    console.log('Fazendo upload do logo:', file.name);
    return of({ logo_path: '/assets/images/new-logo.png' }).pipe(delay(1000));
  }

  uploadCompanyLetterhead(file: File): Observable<{ letterhead_path: string }> {
    // TODO: Implementar upload real para API
    console.log('Fazendo upload do papel timbrado:', file.name);
    return of({ letterhead_path: '/assets/images/new-letterhead.png' }).pipe(delay(1000));
  }

  // ===== MEMBERS METHODS =====

  getCompanyMembers(): Observable<CompanyMember[]> {
    // TODO: Implementar chamada real para API
    const mockMembers: CompanyMember[] = [
      {
        id: '1',
        company_id: '1',
        user_id: 'user-1',
        role: 'admin',
        name: 'João Silva',
        email: 'joao@empresa.com',
        created_at: '2023-01-15',
        user: {
          id: 'user-1',
          full_name: 'João Silva',
          email: 'joao@empresa.com'
        }
      },
      {
        id: '2',
        company_id: '1',
        user_id: 'user-2',
        role: 'member',
        name: 'Maria Santos',
        email: 'maria@empresa.com',
        created_at: '2023-02-01',
        user: {
          id: 'user-2',
          full_name: 'Maria Santos',
          email: 'maria@empresa.com'
        }
      },
      {
        id: '3',
        company_id: '1',
        user_id: 'user-3',
        role: 'member',
        name: 'Pedro Oliveira',
        email: 'pedro@empresa.com',
        created_at: '2023-03-01',
        user: {
          id: 'user-3',
          full_name: 'Pedro Oliveira',
          email: 'pedro@empresa.com'
        }
      }
    ];

    return of(mockMembers).pipe(delay(500));
  }

  addMember(email: string, role: 'admin' | 'member'): Observable<CompanyMember> {
    // TODO: Implementar chamada real para API
    console.log('Adicionando membro:', { email, role });
    const newMember: CompanyMember = {
      id: 'new-member-id',
      company_id: '1',
      user_id: 'new-user-id',
      role,
      name: 'Novo Usuário',
      email,
      created_at: new Date().toISOString(),
      user: {
        id: 'new-user-id',
        full_name: 'Novo Usuário',
        email
      }
    };
    return of(newMember).pipe(delay(500));
  }

  updateMemberRole(memberId: string, role: 'admin' | 'member'): Observable<CompanyMember> {
    // TODO: Implementar chamada real para API
    console.log('Atualizando role do membro:', { memberId, role });
    const mockUpdatedMember: CompanyMember = {
      id: memberId,
      company_id: '1',
      user_id: 'user-id',
      role,
      name: 'Usuário Atualizado',
      email: 'usuario@empresa.com',
      created_at: '2023-01-01',
      user: {
        id: 'user-id',
        full_name: 'Usuário Atualizado',
        email: 'usuario@empresa.com'
      }
    };
    return of(mockUpdatedMember).pipe(delay(500));
  }

  removeMember(memberId: string): Observable<{ success: boolean }> {
    // TODO: Implementar chamada real para API
    console.log('Removendo membro:', memberId);
    return of({ success: true }).pipe(delay(500));
  }

  // ===== DOCUMENTS METHODS =====

  getCompanyDocuments(): Observable<CompanyDocument[]> {
    // TODO: Implementar chamada real para API
    const mockDocuments: CompanyDocument[] = [
      {
        id: '1',
        company_id: '1',
        doc_type: 'cnpj',
        doc_number: '12.345.678/0001-90',
        issuer: 'Receita Federal',
        issue_date: '2020-01-15',
        expires_at: '2030-01-15',
        file_path: '/documents/cnpj.pdf',
        notes: 'CNPJ principal da empresa',
        version: 1,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        company_id: '1',
        doc_type: 'inscricao_estadual',
        doc_number: '123.456.789.012',
        issuer: 'Sefaz-SP',
        issue_date: '2020-02-01',
        expires_at: '2025-02-01',
        file_path: '/documents/ie.pdf',
        notes: 'Inscrição Estadual de SP',
        version: 1,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      },
      {
        id: '3',
        company_id: '1',
        doc_type: 'certificado_digital',
        doc_number: 'CERT123456789',
        issuer: 'Certificadora Digital',
        issue_date: '2023-06-01',
        expires_at: '2024-06-01',
        file_path: '/documents/certificado.p12',
        notes: 'Certificado digital A1',
        version: 2,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      }
    ];

    return of(mockDocuments).pipe(delay(500));
  }

  getMissingDocuments(): Observable<CompanyDocument[]> {
    // TODO: Implementar chamada real para API
    const mockMissingDocuments: CompanyDocument[] = [
      {
        id: '1',
        company_id: '1',
        doc_type: 'outros',
        doc_number: 'ACT-2024-001',
        issuer: 'Órgão Competente',
        issue_date: null,
        expires_at: '2024-12-31',
        file_path: null,
        notes: 'Atestado de Capacidade Técnica',
        version: 0,
        created_at: null,
        updated_at: null
      },
      {
        id: '2',
        company_id: '1',
        doc_type: 'outros',
        doc_number: 'CNH-SOCIO-001',
        issuer: 'DETRAN',
        issue_date: null,
        expires_at: '2025-06-15',
        file_path: null,
        notes: 'CNH Sócio',
        version: 0,
        created_at: null,
        updated_at: null
      },
      {
        id: '3',
        company_id: '1',
        doc_type: 'outros',
        doc_number: 'CNH-PROC-001',
        issuer: 'DETRAN',
        issue_date: null,
        expires_at: '2025-08-20',
        file_path: null,
        notes: 'CNH Procurador',
        version: 0,
        created_at: null,
        updated_at: null
      },
      {
        id: '4',
        company_id: '1',
        doc_type: 'outros',
        doc_number: 'PROC-2024-001',
        issuer: 'Cartório',
        issue_date: null,
        expires_at: '2024-11-30',
        file_path: null,
        notes: 'Procuração',
        version: 0,
        created_at: null,
        updated_at: null
      },
      {
        id: '5',
        company_id: '1',
        doc_type: 'contrato_social',
        doc_number: 'CS-2024-001',
        issuer: 'Cartório',
        issue_date: null,
        expires_at: '2025-01-15',
        file_path: null,
        notes: 'Contrato Social',
        version: 0,
        created_at: null,
        updated_at: null
      },
      {
        id: '6',
        company_id: '1',
        doc_type: 'outros',
        doc_number: 'CERT-SIMP-001',
        issuer: 'Receita Federal',
        issue_date: null,
        expires_at: '2024-10-10',
        file_path: null,
        notes: 'Certidão Simplificada',
        version: 0,
        created_at: null,
        updated_at: null
      },
      {
        id: '7',
        company_id: '1',
        doc_type: 'outros',
        doc_number: 'CICAD-2024-001',
        issuer: 'CICAD',
        issue_date: null,
        expires_at: '2024-09-25',
        file_path: null,
        notes: 'CICAD',
        version: 0,
        created_at: null,
        updated_at: null
      },
      {
        id: '8',
        company_id: '1',
        doc_type: 'inscricao_municipal',
        doc_number: 'IM-2024-001',
        issuer: 'Prefeitura Municipal',
        issue_date: null,
        expires_at: '2024-12-15',
        file_path: null,
        notes: 'Inscrição Municipal',
        version: 0,
        created_at: null,
        updated_at: null
      },
      {
        id: '9',
        company_id: '1',
        doc_type: 'alvara',
        doc_number: 'AF-2024-001',
        issuer: 'Prefeitura Municipal',
        issue_date: null,
        expires_at: '2024-11-20',
        file_path: null,
        notes: 'Alvará de Funcionamento',
        version: 0,
        created_at: null,
        updated_at: null
      },
      {
        id: '10',
        company_id: '1',
        doc_type: 'outros',
        doc_number: 'QSA-2024-001',
        issuer: 'Cartório',
        issue_date: null,
        expires_at: '2025-02-28',
        file_path: null,
        notes: 'QSA',
        version: 0,
        created_at: null,
        updated_at: null
      },
      {
        id: '11',
        company_id: '1',
        doc_type: 'outros',
        doc_number: 'SINTEGRA-2024-001',
        issuer: 'Sefaz',
        issue_date: null,
        expires_at: '2024-08-30',
        file_path: null,
        notes: 'SINTEGRA',
        version: 0,
        created_at: null,
        updated_at: null
      },
      {
        id: '12',
        company_id: '1',
        doc_type: 'outros',
        doc_number: 'CERT-FAL-001',
        issuer: 'Tribunal de Justiça',
        issue_date: null,
        expires_at: '2024-12-31',
        file_path: null,
        notes: 'Certidão de Falência',
        version: 0,
        created_at: null,
        updated_at: null
      },
      {
        id: '13',
        company_id: '1',
        doc_type: 'outros',
        doc_number: 'BAL-2023-001',
        issuer: 'Contador',
        issue_date: null,
        expires_at: '2024-12-31',
        file_path: null,
        notes: 'Balanço de 2023',
        version: 0,
        created_at: null,
        updated_at: null
      },
      {
        id: '14',
        company_id: '1',
        doc_type: 'outros',
        doc_number: 'BAL-2024-001',
        issuer: 'Contador',
        issue_date: null,
        expires_at: '2025-03-31',
        file_path: null,
        notes: 'Balanço 2024',
        version: 0,
        created_at: null,
        updated_at: null
      },
      {
        id: '15',
        company_id: '1',
        doc_type: 'outros',
        doc_number: 'IND-ECON-001',
        issuer: 'Órgão Competente',
        issue_date: null,
        expires_at: '2024-10-15',
        file_path: null,
        notes: 'Índices Econômicos',
        version: 0,
        created_at: null,
        updated_at: null
      },
      {
        id: '16',
        company_id: '1',
        doc_type: 'cnpj',
        doc_number: '12.345.678/0001-90',
        issuer: 'Receita Federal',
        issue_date: null,
        expires_at: '2025-01-01',
        file_path: null,
        notes: 'CNPJ',
        version: 0,
        created_at: null,
        updated_at: null
      },
      {
        id: '17',
        company_id: '1',
        doc_type: 'outros',
        doc_number: 'CND-FED-001',
        issuer: 'Receita Federal',
        issue_date: null,
        expires_at: '2024-09-10',
        file_path: null,
        notes: 'CND Federal',
        version: 0,
        created_at: null,
        updated_at: null
      },
      {
        id: '18',
        company_id: '1',
        doc_type: 'outros',
        doc_number: 'CND-EST-001',
        issuer: 'Sefaz',
        issue_date: null,
        expires_at: '2026-08-25',
        file_path: null,
        notes: 'CND Estadual',
        version: 0,
        created_at: null,
        updated_at: null
      },
      {
        id: '19',
        company_id: '1',
        doc_type: 'outros',
        doc_number: 'CND-MUN-001',
        issuer: 'Prefeitura Municipal',
        issue_date: null,
        expires_at: '2025-09-20',
        file_path: null,
        notes: 'CND Municipal',
        version: 0,
        created_at: null,
        updated_at: null
      },
      {
        id: '20',
        company_id: '1',
        doc_type: 'outros',
        doc_number: 'CND-FGTS-001',
        issuer: 'Caixa Econômica Federal',
        issue_date: null,
        expires_at: '2024-06-15',
        file_path: null,
        notes: 'CND FGTS',
        version: 0,
        created_at: null,
        updated_at: null
      },
      {
        id: '21',
        company_id: '1',
        doc_type: 'outros',
        doc_number: 'CNDT-001',
        issuer: 'Ministério do Trabalho',
        issue_date: null,
        expires_at: '2024-05-30',
        file_path: null,
        notes: 'CNDT - Trabalhista',
        version: 0,
        created_at: null,
        updated_at: null
      }
    ];

    return of(mockMissingDocuments).pipe(delay(500));
  }

  uploadDocument(file: File, documentData: DocumentUpdateData): Observable<CompanyDocument> {
    // TODO: Implementar upload real para API
    console.log('Fazendo upload de documento:', { fileName: file.name, documentData });
    const newDocument: CompanyDocument = {
      id: 'new-doc-id',
      company_id: '1',
      doc_type: documentData.doc_type as any,
      doc_number: documentData.doc_number || '',
      issuer: documentData.issuer || '',
      issue_date: documentData.issue_date || new Date().toISOString().split('T')[0],
      expires_at: documentData.expires_at || '',
      file_path: `/documents/${file.name}`,
      notes: documentData.notes,
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return of(newDocument).pipe(delay(1000));
  }

  updateDocument(documentId: string, data: DocumentUpdateData): Observable<CompanyDocument> {
    // TODO: Implementar chamada real para API
    console.log('Atualizando documento:', { documentId, data });
    const mockUpdatedDocument: CompanyDocument = {
      id: documentId,
      company_id: '1',
      doc_type: data.doc_type as any,
      doc_number: data.doc_number || '',
      issuer: data.issuer || '',
      issue_date: data.issue_date || new Date().toISOString().split('T')[0],
      expires_at: data.expires_at || '',
      file_path: '/documents/updated-document.pdf',
      notes: data.notes,
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return of(mockUpdatedDocument).pipe(delay(500));
  }

  deleteDocument(documentId: string): Observable<{ success: boolean }> {
    // TODO: Implementar chamada real para API
    console.log('Deletando documento:', documentId);
    return of({ success: true }).pipe(delay(500));
  }

  downloadDocument(documentId: string): Observable<Blob> {
    // TODO: Implementar download real para API
    console.log('Baixando documento:', documentId);
    const mockBlob = new Blob(['Conteúdo do documento'], { type: 'application/pdf' });
    return of(mockBlob).pipe(delay(500));
  }

  // ===== UTILITY METHODS =====

  getDocumentTypeLabel(docType: string): string {
    const labels: { [key: string]: string } = {
      'cnpj': 'CNPJ',
      'inscricao_estadual': 'Inscrição Estadual',
      'inscricao_municipal': 'Inscrição Municipal',
      'alvara': 'Alvará',
      'contrato_social': 'Contrato Social',
      'certificado_digital': 'Certificado Digital',
      'outros': 'Outros'
    };
    return labels[docType] || docType;
  }

  getRoleLabel(role: string): string {
    const labels: { [key: string]: string } = {
      'admin': 'Administrador',
      'member': 'Membro'
    };
    return labels[role] || role;
  }

  isDocumentExpiringSoon(expiresAt: string, daysThreshold: number = 30): boolean {
    const expirationDate = new Date(expiresAt);
    const today = new Date();
    const diffTime = expirationDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= daysThreshold && diffDays >= 0;
  }

  isDocumentExpired(expiresAt: string): boolean {
    const expirationDate = new Date(expiresAt);
    const today = new Date();
    return expirationDate < today;
  }
}
