import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { delay, catchError, map } from 'rxjs/operators';

// ===== INTERFACES =====

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

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: any;
}

// ===== SERVICE =====

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private readonly apiUrl = 'http://localhost:3000/api'; // TODO: Mover para environment quando disponível
  private readonly companyEndpoint = `${this.apiUrl}/company`;
  private readonly membersEndpoint = `${this.apiUrl}/company/members`;
  private readonly documentsEndpoint = `${this.apiUrl}/company/documents`;

  constructor(private http: HttpClient) { }

  // ===== MÉTODOS DA EMPRESA =====
  
  getCompanyInfo(): Observable<Company> {
    // TODO: Implementar chamada real para API quando o backend estiver pronto
    // return this.http.get<ApiResponse<Company>>(`${this.companyEndpoint}`)
    //   .pipe(
    //     map(response => response.data),
    //     catchError(this.handleError)
    //   );

    // Mock data para desenvolvimento
    const mockCompany: Company = {
      id: '1',
      name: 'ACA Licitações',
      cnpj: '12.345.678/0001-90',
      legal_name: 'ACA Licitações Ltda',
      state_registration: '123.456.789.012',
      municipal_registration: '123456789',
      phone: '(11) 99999-9999',
      address: 'Rua das Flores, 123 - Centro - São Paulo/SP - 01234-567',
      email: 'contato@empresaexemplo.com.br',
      logo_path: '/assets/images/company-logo.png',
      letterhead_path: '/assets/images/company-letterhead.png',
      active: true,
      created_by: 'user-1',
      created_at: '2024-01-15T10:00:00Z'
    };

    return of(mockCompany).pipe(delay(500));
  }

  updateCompanyInfo(data: CompanyUpdateData): Observable<Company> {
    // TODO: Implementar chamada real para API quando o backend estiver pronto
    // return this.http.put<ApiResponse<Company>>(`${this.companyEndpoint}`, data)
    //   .pipe(
    //     map(response => response.data),
    //     catchError(this.handleError)
    //   );

    // Mock data para desenvolvimento
    console.log('Atualizando informações da empresa:', data);
    return this.getCompanyInfo();
  }

  uploadCompanyLogo(file: File): Observable<{ logo_path: string }> {
    // TODO: Implementar upload real para API quando o backend estiver pronto
    // const formData = new FormData();
    // formData.append('logo', file);
    // return this.http.post<ApiResponse<{ logo_path: string }>>(`${this.companyEndpoint}/logo`, formData)
    //   .pipe(
    //     map(response => response.data),
    //     catchError(this.handleError)
    //   );

    // Mock data para desenvolvimento
    console.log('Fazendo upload do logo:', file.name);
    return of({ logo_path: `/uploads/logo-${Date.now()}.${file.name.split('.').pop()}` }).pipe(delay(1000));
  }

  uploadCompanyLetterhead(file: File): Observable<{ letterhead_path: string }> {
    // TODO: Implementar upload real para API quando o backend estiver pronto
    // const formData = new FormData();
    // formData.append('letterhead', file);
    // return this.http.post<ApiResponse<{ letterhead_path: string }>>(`${this.companyEndpoint}/letterhead`, formData)
    //   .pipe(
    //     map(response => response.data),
    //     catchError(this.handleError)
    //   );

    // Mock data para desenvolvimento
    console.log('Fazendo upload do papel timbrado:', file.name);
    return of({ letterhead_path: `/uploads/letterhead-${Date.now()}.${file.name.split('.').pop()}` }).pipe(delay(1000));
  }

  // ===== MÉTODOS DE FUNCIONÁRIOS =====

  getCompanyMembers(): Observable<CompanyMember[]> {
    // TODO: Implementar chamada real para API quando o backend estiver pronto
    // return this.http.get<ApiResponse<CompanyMember[]>>(`${this.membersEndpoint}`)
    //   .pipe(
    //     map(response => response.data),
    //     catchError(this.handleError)
    //   );

    // Mock data para desenvolvimento
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
    // TODO: Implementar chamada real para API quando o backend estiver pronto
    // return this.http.post<ApiResponse<CompanyMember>>(`${this.membersEndpoint}`, { email, role })
    //   .pipe(
    //     map(response => response.data),
    //     catchError(this.handleError)
    //   );

    // Mock data para desenvolvimento
    console.log('Adicionando membro:', { email, role });
    const newMember: CompanyMember = {
      id: `member-${Date.now()}`,
      company_id: '1',
      user_id: `user-${Date.now()}`,
      role,
      name: 'Novo Usuário',
      email,
      created_at: new Date().toISOString(),
      user: {
        id: `user-${Date.now()}`,
        full_name: 'Novo Usuário',
        email
      }
    };
    return of(newMember).pipe(delay(500));
  }

  updateMemberRole(memberId: string, role: 'admin' | 'member'): Observable<CompanyMember> {
    // TODO: Implementar chamada real para API quando o backend estiver pronto
    // return this.http.put<ApiResponse<CompanyMember>>(`${this.membersEndpoint}/${memberId}`, { role })
    //   .pipe(
    //     map(response => response.data),
    //     catchError(this.handleError)
    //   );

    // Mock data para desenvolvimento
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
    // TODO: Implementar chamada real para API quando o backend estiver pronto
    // return this.http.delete<ApiResponse<{ success: boolean }>>(`${this.membersEndpoint}/${memberId}`)
    //   .pipe(
    //     map(response => response.data),
    //     catchError(this.handleError)
    //   );

    // Mock data para desenvolvimento
    console.log('Removendo membro:', memberId);
    return of({ success: true }).pipe(delay(500));
  }

  // ===== MÉTODOS DE DOCUMENTOS =====

  getCompanyDocuments(): Observable<CompanyDocument[]> {
    // TODO: Implementar chamada real para API quando o backend estiver pronto
    // return this.http.get<ApiResponse<CompanyDocument[]>>(`${this.documentsEndpoint}`)
    //   .pipe(
    //     map(response => response.data),
    //     catchError(this.handleError)
    //   );

    // Mock data para desenvolvimento
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
    // TODO: Implementar chamada real para API quando o backend estiver pronto
    // return this.http.get<ApiResponse<CompanyDocument[]>>(`${this.documentsEndpoint}/missing`)
    //   .pipe(
    //     map(response => response.data),
    //     catchError(this.handleError)
    //   );

    // Mock data para desenvolvimento - documentos com datas variadas
    const mockMissingDocuments: CompanyDocument[] = [
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
      }
    ];

    return of(mockMissingDocuments).pipe(delay(500));
  }

  uploadDocument(file: File, documentData: DocumentUpdateData): Observable<CompanyDocument> {
    // TODO: Implementar upload real para API quando o backend estiver pronto
    // const formData = new FormData();
    // formData.append('file', file);
    // formData.append('data', JSON.stringify(documentData));
    // return this.http.post<ApiResponse<CompanyDocument>>(`${this.documentsEndpoint}/upload`, formData)
    //   .pipe(
    //     map(response => response.data),
    //     catchError(this.handleError)
    //   );

    // Mock data para desenvolvimento
    console.log('Fazendo upload de documento:', { fileName: file.name, documentData });
    const newDocument: CompanyDocument = {
      id: `doc-${Date.now()}`,
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
    // TODO: Implementar chamada real para API quando o backend estiver pronto
    // return this.http.put<ApiResponse<CompanyDocument>>(`${this.documentsEndpoint}/${documentId}`, data)
    //   .pipe(
    //     map(response => response.data),
    //     catchError(this.handleError)
    //   );

    // Mock data para desenvolvimento
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
    // TODO: Implementar chamada real para API quando o backend estiver pronto
    // return this.http.delete<ApiResponse<{ success: boolean }>>(`${this.documentsEndpoint}/${documentId}`)
    //   .pipe(
    //     map(response => response.data),
    //     catchError(this.handleError)
    //   );

    // Mock data para desenvolvimento
    console.log('Deletando documento:', documentId);
    return of({ success: true }).pipe(delay(500));
  }

  downloadDocument(documentId: string): Observable<Blob> {
    // TODO: Implementar download real para API quando o backend estiver pronto
    // return this.http.get(`${this.documentsEndpoint}/${documentId}/download`, { responseType: 'blob' })
    //   .pipe(
    //     catchError(this.handleError)
    //   );

    // Mock data para desenvolvimento
    console.log('Baixando documento:', documentId);
    const mockBlob = new Blob(['Conteúdo do documento'], { type: 'application/pdf' });
    return of(mockBlob).pipe(delay(500));
  }

  // ===== MÉTODOS UTILITÁRIOS =====

  getDocumentTypeLabel(docType: string): string {
    const labels: { [key: string]: string } = {
      'cnpj': 'CNPJ',
      'inscricao_estadual': 'Inscrição Estadual',
      'inscricao_municipal': 'Inscrição Municipal',
      'alvara': 'Alvará',
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

  // ===== TRATAMENTO DE ERROS =====

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocorreu um erro inesperado';
    
    if (error.error instanceof ErrorEvent) {
      // Erro do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do servidor
      switch (error.status) {
        case 400:
          errorMessage = 'Dados inválidos fornecidos';
          break;
        case 401:
          errorMessage = 'Não autorizado. Faça login novamente';
          break;
        case 403:
          errorMessage = 'Acesso negado';
          break;
        case 404:
          errorMessage = 'Recurso não encontrado';
          break;
        case 409:
          errorMessage = 'Conflito: O recurso já existe';
          break;
        case 422:
          errorMessage = 'Dados de entrada inválidos';
          break;
        case 500:
          errorMessage = 'Erro interno do servidor';
          break;
        default:
          errorMessage = `Erro ${error.status}: ${error.message}`;
      }
    }

    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}