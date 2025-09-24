import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { delay, catchError, map, switchMap } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';

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
  created_at: string | null;
}

export interface CompanyMember {
  id: string;
  company_id: string;
  user_id: string;
  role: 'admin' | 'member' | 'owner';
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
  private readonly apiUrl = 'http://localhost:3000/v1'; // Usando a URL correta da API
  private readonly companyEndpoint = `${this.apiUrl}/companies`;
  private readonly membersEndpoint = `${this.apiUrl}/companies`;
  private readonly documentsEndpoint = `${this.apiUrl}/companies`;

  constructor(private http: HttpClient, private apiService: ApiService) { }

  // ===== MÉTODOS DA EMPRESA =====
  
  getCompanyInfo(): Observable<Company> {
    console.log('[CompanyService.getCompanyInfo] ===== BUSCANDO INFORMAÇÕES DA EMPRESA =====');
    
    // Usa a API do backend para obter informações da empresa
    return this.apiService.getCompanies().pipe(
      map(companies => {
        console.log('[CompanyService.getCompanyInfo] Dados brutos recebidos:', companies);
        
        if (companies.length > 0) {
          // A API retorna um array de objetos com { role, company }
          // Precisamos extrair o objeto company
          const companyData = companies[0];
          console.log('[CompanyService.getCompanyInfo] Primeiro item:', companyData);
          
          // Verificar se tem a estrutura { role, company }
          const company = companyData.company || companyData;
          console.log('[CompanyService.getCompanyInfo] Empresa extraída:', company);
          
          const companyInfo: Company = {
            id: company.id,
            name: company.name,
            cnpj: company.cnpj || '',
            legal_name: company.name,
            state_registration: '',
            municipal_registration: '',
            phone: company.phone || '',
            address: company.address || '',
            email: '',
            logo_path: company.logoPath || '',
            letterhead_path: company.letterheadPath || '',
            active: company.active,
            created_by: company.createdById || '',
            created_at: company.createdAt
          };
          
          console.log('[CompanyService.getCompanyInfo] Informações da empresa processadas:', companyInfo);
          return companyInfo;
        }
        
        console.log('[CompanyService.getCompanyInfo] Nenhuma empresa encontrada - retornando empresa vazia');
        
        // Retornar uma empresa vazia para permitir criação/edição
        const emptyCompany: Company = {
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
          created_at: null
        };
        
        console.log('[CompanyService.getCompanyInfo] Empresa vazia criada:', emptyCompany);
        return emptyCompany;
      }),
      catchError(error => {
        console.error('[CompanyService.getCompanyInfo] Erro ao buscar empresa:', error);
        return this.handleError(error);
      })
    );
  }

  updateCompanyInfo(data: CompanyUpdateData): Observable<Company> {
    console.log('[CompanyService.updateCompanyInfo] ===== ATUALIZANDO INFORMAÇÕES DA EMPRESA =====');
    console.log('[CompanyService.updateCompanyInfo] Dados recebidos do componente:', data);
    console.log('[CompanyService.updateCompanyInfo] Tipo dos dados:', typeof data);
    console.log('[CompanyService.updateCompanyInfo] Chaves dos dados:', Object.keys(data));
    
    // Usa a API do backend para atualizar informações da empresa
    return this.apiService.getCompanies().pipe(
      switchMap(companies => {
        console.log('[CompanyService.updateCompanyInfo] Empresas encontradas:', companies);
        console.log('[CompanyService.updateCompanyInfo] Quantidade de empresas:', companies.length);
        
        if (companies.length > 0) {
          // Extrair o ID da empresa da estrutura { role, company }
          const companyData = companies[0];
          console.log('[CompanyService.updateCompanyInfo] CompanyData completo:', companyData);
          
          const company = companyData.company || companyData;
          console.log('[CompanyService.updateCompanyInfo] Company extraída:', company);
          
          const companyId = company.id;
          console.log('[CompanyService.updateCompanyInfo] ID da empresa extraído:', companyId);
          console.log('[CompanyService.updateCompanyInfo] Tipo do ID:', typeof companyId);
          console.log('[CompanyService.updateCompanyInfo] Role do usuário na empresa:', companyData.role);
          
          if (!companyId) {
            console.error('[CompanyService.updateCompanyInfo] ERRO: companyId é undefined ou null');
            throw new Error('ID da empresa não encontrado');
          }
          
          console.log('[CompanyService.updateCompanyInfo] Dados recebidos do componente:', data);
          
          const updateData = {
            name: data.name,
            phone: data.phone,
            address: data.address,
            logoPath: data.logo_path,
            letterheadPath: data.letterhead_path,
            active: data.active
          };
          
          console.log('[CompanyService.updateCompanyInfo] Dados de atualização preparados:', updateData);
          console.log('[CompanyService.updateCompanyInfo] Campos mapeados:');
          console.log('  - name:', data.name, '->', updateData.name);
          console.log('  - phone:', data.phone, '->', updateData.phone);
          console.log('  - address:', data.address, '->', updateData.address);
          console.log('  - logoPath:', data.logo_path, '->', updateData.logoPath);
          console.log('  - letterheadPath:', data.letterhead_path, '->', updateData.letterheadPath);
          console.log('  - active:', data.active, '->', updateData.active);
          console.log('[CompanyService.updateCompanyInfo] Chamando updateCompany com ID:', companyId);
          return this.apiService.updateCompany(companyId, updateData);
        }
        
        // Se não há empresa, criar uma nova
        console.log('[CompanyService.updateCompanyInfo] Nenhuma empresa encontrada - criando nova empresa');
        
        const createData = {
          name: data.name,
          cnpj: data.cnpj,
          phone: data.phone,
          address: data.address,
          logoPath: data.logo_path,
          letterheadPath: data.letterhead_path,
          active: data.active !== undefined ? data.active : true
        };
        
        console.log('[CompanyService.updateCompanyInfo] Dados para criação:', createData);
        return this.apiService.createCompany(createData);
      }),
      map(updatedCompany => {
        console.log('[CompanyService.updateCompanyInfo] Empresa atualizada recebida:', updatedCompany);
        
        const companyInfo: Company = {
          id: updatedCompany.id,
          name: updatedCompany.name,
          cnpj: updatedCompany.cnpj || '',
          legal_name: updatedCompany.name,
          state_registration: '',
          municipal_registration: '',
          phone: updatedCompany.phone || '',
          address: updatedCompany.address || '',
          email: '',
          logo_path: updatedCompany.logoPath || '',
          letterhead_path: updatedCompany.letterheadPath || '',
          active: updatedCompany.active,
          created_by: updatedCompany.createdById || '',
          created_at: updatedCompany.createdAt
        };
        
        console.log('[CompanyService.updateCompanyInfo] Informações da empresa processadas:', companyInfo);
        return companyInfo;
      }),
      catchError(error => {
        console.error('[CompanyService.updateCompanyInfo] Erro ao atualizar empresa:', error);
        return this.handleError(error);
      })
    );
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

  // Criar usuário e adicionar como membro
  createUserAndAddMember(memberData: any): Observable<any> {
    console.log('[CompanyService.createUserAndAddMember] ===== CRIANDO USUÁRIO E ADICIONANDO COMO MEMBRO =====');
    console.log('[CompanyService.createUserAndAddMember] Dados do membro:', memberData);
    
    // Primeiro, obter os dados da empresa atual
    return this.apiService.getCompanies().pipe(
      switchMap(companies => {
        console.log('[CompanyService.createUserAndAddMember] Empresas encontradas:', companies);
        
        if (companies.length === 0) {
          throw new Error('Nenhuma empresa encontrada para adicionar membro');
        }
        
        const companyData = companies[0];
        const company = companyData.company || companyData;
        console.log('[CompanyService.createUserAndAddMember] Dados da empresa atual:', company);
        
        // Criar o usuário com os dados da empresa atual
        const userData = {
          fullName: memberData.name,
          email: memberData.email,
          password: memberData.password,
          companyName: company.name || 'Empresa',
          companyCnpj: company.cnpj || '',
          companyPhone: company.phone || '',
          companyAddress: company.address || ''
        };
        
        console.log('[CompanyService.createUserAndAddMember] Dados do usuário com empresa atual:', userData);
        
        return this.apiService.register(userData).pipe(
          switchMap((authResponse: any) => {
            console.log('[CompanyService.createUserAndAddMember] Usuário criado com sucesso:', authResponse);
            
            // Agora adicionar como membro da empresa
            const companyId = company.id;
            console.log('[CompanyService.createUserAndAddMember] Adicionando como membro da empresa:', companyId);
            
            const memberDataForApi = {
              email: userData.email,
              role: memberData.role
            };
            
            return this.apiService.addMember(companyId, memberDataForApi);
          })
        );
      }),
      catchError(error => {
        console.error('[CompanyService.createUserAndAddMember] Erro:', error);
        return this.handleError(error);
      })
    );
  }

  // Atualizar membro existente
  updateMember(memberId: string, memberData: any): Observable<CompanyMember> {
    console.log('[CompanyService.updateMember] ===== ATUALIZANDO MEMBRO =====');
    console.log('[CompanyService.updateMember] ID do membro:', memberId);
    console.log('[CompanyService.updateMember] Dados do membro:', memberData);
    
    return this.apiService.getCompanies().pipe(
      switchMap(companies => {
        if (companies.length > 0) {
          const companyData = companies[0];
          const company = companyData.company || companyData;
          const companyId = company.id;
          
          console.log('[CompanyService.updateMember] ID da empresa:', companyId);
          
          const updateData: any = {
            role: memberData.role
          };
          
          // Incluir senha apenas se fornecida
          if (memberData.password && memberData.password.trim()) {
            updateData.password = memberData.password;
          }
          
          return this.apiService.updateMember(companyId, memberId, updateData);
        }
        throw new Error('Nenhuma empresa encontrada');
      }),
      map(updatedMember => {
        console.log('[CompanyService.updateMember] Membro atualizado:', updatedMember);
        return {
          id: updatedMember.id,
          company_id: updatedMember.company_id,
          user_id: updatedMember.user_id,
          name: memberData.name,
          email: memberData.email,
          role: updatedMember.role,
          created_at: updatedMember.created_at
        };
      }),
      catchError(error => {
        console.error('[CompanyService.updateMember] Erro:', error);
        return this.handleError(error);
      })
    );
  }

  getCompanyMembers(): Observable<CompanyMember[]> {
    // Usa a API do backend para obter membros da empresa
    return this.apiService.getCompanies().pipe(
      switchMap(companies => {
        console.log('[CompanyService.getCompanyMembers] Empresas encontradas:', companies);
        
        if (companies.length > 0) {
          // Extrair o ID da empresa da estrutura { role, company }
          const companyData = companies[0];
          const company = companyData.company || companyData;
          const companyId = company.id;
          
          console.log('[CompanyService.getCompanyMembers] ID da empresa:', companyId);
          return this.apiService.getCompanyMembers(companyId);
        }
        throw new Error('Nenhuma empresa encontrada');
      }),
      map(members => {
        console.log('[CompanyService.getCompanyMembers] Membros recebidos:', members);
        console.log('[CompanyService.getCompanyMembers] Estrutura dos dados:', JSON.stringify(members, null, 2));
        
        return members.map(member => {
          console.log('[CompanyService.getCompanyMembers] Processando membro:', member);
          
          const mappedMember = {
            id: member.id,
            company_id: member.companyId || '',
            user_id: member.userId || '',
            role: member.role as 'admin' | 'member' | 'owner',
            name: member.user?.fullName || '',
            email: member.user?.email || '',
            created_at: member.user?.createdAt || '',
            user: {
              id: member.userId || '',
              full_name: member.user?.fullName || '',
              email: member.user?.email || ''
            }
          };
          
          console.log('[CompanyService.getCompanyMembers] Membro mapeado:', mappedMember);
          return mappedMember;
        });
      }),
      catchError(this.handleError)
    );
  }

  addMember(email: string, role: 'admin' | 'member'): Observable<CompanyMember> {
    // Usa a API do backend para adicionar membro
    return this.apiService.getCompanies().pipe(
      switchMap(companies => {
        console.log('[CompanyService.addMember] Empresas encontradas:', companies);
        
        if (companies.length > 0) {
          // Extrair o ID da empresa da estrutura { role, company }
          const companyData = companies[0];
          const company = companyData.company || companyData;
          const companyId = company.id;
          
          console.log('[CompanyService.addMember] ID da empresa:', companyId);
          return this.apiService.inviteMember(companyId, { email, role });
        }
        throw new Error('Nenhuma empresa encontrada');
      }),
      map(member => {
        console.log('[CompanyService.addMember] Membro adicionado:', member);
        return {
          id: member.id,
          company_id: member.companyId || '',
          user_id: member.userId || '',
          role: member.role as 'admin' | 'member',
          name: member.userFullName || '',
          email: member.userEmail || '',
          created_at: member.createdAt,
          user: {
            id: member.userId || '',
            full_name: member.userFullName || '',
            email: member.userEmail || ''
          }
        };
      }),
      catchError(this.handleError)
    );
  }

  updateMemberRole(memberId: string, role: 'admin' | 'member'): Observable<CompanyMember> {
    // Usa a API do backend para atualizar role do membro
    return this.apiService.getCompanies().pipe(
      switchMap(companies => {
        if (companies.length > 0) {
          // Extrair o ID da empresa da estrutura { role, company }
          const companyData = companies[0];
          const company = companyData.company || companyData;
          const companyId = company.id;
          
          return this.apiService.updateMember(companyId, memberId, { role });
        }
        throw new Error('Nenhuma empresa encontrada');
      }),
      map(member => ({
        id: member.id,
        company_id: member.companyId || '',
        user_id: member.userId || '',
        role: member.role as 'admin' | 'member',
        name: member.userFullName || '',
        email: member.userEmail || '',
        created_at: member.createdAt,
        user: {
          id: member.userId || '',
          full_name: member.userFullName || '',
          email: member.userEmail || ''
        }
      })),
      catchError(this.handleError)
    );
  }

  removeMember(memberId: string): Observable<{ success: boolean }> {
    // Usa a API do backend para remover membro
    return this.apiService.getCompanies().pipe(
      switchMap(companies => {
        if (companies.length > 0) {
          // Extrair o ID da empresa da estrutura { role, company }
          const companyData = companies[0];
          const company = companyData.company || companyData;
          const companyId = company.id;
          
          return this.apiService.removeMember(companyId, memberId);
        }
        throw new Error('Nenhuma empresa encontrada');
      }),
      map(() => ({ success: true })),
      catchError(this.handleError)
    );
  }

  // ===== MÉTODOS DE DOCUMENTOS =====

  getCompanyDocuments(): Observable<CompanyDocument[]> {
    // Usa a API do backend para obter documentos da empresa
    return this.apiService.getCompanies().pipe(
      switchMap(companies => {
        if (companies.length > 0) {
          // Extrair o ID da empresa da estrutura { role, company }
          const companyData = companies[0];
          const company = companyData.company || companyData;
          const companyId = company.id;
          
          return this.apiService.getDocuments(companyId);
        }
        throw new Error('Nenhuma empresa encontrada');
      }),
      map(documents => documents.map((doc: any) => ({
        id: doc.id,
        company_id: doc.companyId || '',
        doc_type: doc.docType as any,
        doc_number: doc.docNumber || '',
        issuer: doc.issuer || '',
        issue_date: doc.issueDate || null,
        expires_at: doc.expiresAt || '',
        file_path: doc.filePath || null,
        notes: doc.notes || '',
        version: doc.version || 1,
        created_at: doc.createdAt || null,
        updated_at: doc.updatedAt || null
      }))),
      catchError(this.handleError)
    );
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
    // Usa a API do backend para fazer upload de documento
    return this.apiService.getCompanies().pipe(
      switchMap(companies => {
        if (companies.length > 0) {
          // Extrair o ID da empresa da estrutura { role, company }
          const companyData = companies[0];
          const company = companyData.company || companyData;
          const companyId = company.id;
          
          // Primeiro cria o documento
          const createData = {
            docType: documentData.doc_type,
            docNumber: documentData.doc_number || '',
            issuer: documentData.issuer || '',
            issueDate: documentData.issue_date || new Date().toISOString().split('T')[0],
            expiresAt: documentData.expires_at || '',
            notes: documentData.notes || ''
          };
          return this.apiService.createDocument(companyId, createData).pipe(
            switchMap(createdDoc => {
              // Depois faz upload do arquivo
              return this.apiService.uploadDocument(companyId, createdDoc.id, file).pipe(
                map(() => createdDoc)
              );
            })
          );
        }
        throw new Error('Nenhuma empresa encontrada');
      }),
      map(doc => ({
        id: doc.id,
        company_id: doc.companyId || '',
        doc_type: doc.docType as any,
        doc_number: doc.docNumber || '',
        issuer: doc.issuer || '',
        issue_date: doc.issueDate || null,
        expires_at: doc.expiresAt || '',
        file_path: doc.filePath || null,
        notes: doc.notes || '',
        version: doc.version || 1,
        created_at: doc.createdAt || null,
        updated_at: doc.updatedAt || null
      })),
      catchError(this.handleError)
    );
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