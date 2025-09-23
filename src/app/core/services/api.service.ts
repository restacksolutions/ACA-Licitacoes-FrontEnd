import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  status?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  companyName: string;
  companyCnpj: string;
  companyPhone: string;
  companyAddress: string;
}

export interface AuthResponse {
  access_token: string;
  access_expires_at: string;
  refresh_token: string;
  refresh_expires_at: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    createdAt: string;
  };
  company: {
    id: string;
    name: string;
    cnpj: string;
    active: boolean;
    createdAt: string;
  };
  membership: {
    id: string;
    role: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiBaseUrl = environment.apiBaseUrl;
  private tokenSubject = new BehaviorSubject<string | null>(this.getStoredToken());
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {
    console.log('🏗️ [ApiService] ===== INICIALIZANDO API SERVICE =====');
    console.log('🌐 API Base URL configurada:', this.apiBaseUrl);
    console.log('🔧 HttpClient injetado:', !!this.http);
    console.log('📋 Configuração do ambiente:', {
      production: false,
      apiBaseUrl: this.apiBaseUrl
    });
  }

  private getStoredToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private getHeaders(): HttpHeaders {
    const token = this.tokenSubject.value;
    console.log('📋 [ApiService.getHeaders] ===== CRIANDO HEADERS =====');
    console.log('🔑 Token disponível?', token ? 'Sim' : 'Não');
    if (token) {
      console.log('🔑 Token (primeiros 20 chars):', token.substring(0, 20) + '...');
    }
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
    
    console.log('📋 Headers criados:', headers);
    return headers;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Erro desconhecido';
    
    if (error.error instanceof ErrorEvent) {
      // Erro do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do servidor
      switch (error.status) {
        case 400:
          errorMessage = 'Dados inválidos';
          break;
        case 401:
          errorMessage = 'Não autorizado';
          break;
        case 403:
          errorMessage = 'Acesso negado';
          break;
        case 404:
          errorMessage = 'Recurso não encontrado';
          break;
        case 409:
          errorMessage = 'Conflito (email/CNPJ já existe)';
          break;
        case 500:
          errorMessage = 'Erro interno do servidor';
          break;
        default:
          errorMessage = `Erro ${error.status}: ${error.message}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }

  // Métodos de autenticação
  login(credentials: LoginRequest): Observable<AuthResponse> {
    console.log('🔐 [ApiService.login] ===== INICIANDO LOGIN =====');
    console.log('📧 Email:', credentials.email);
    console.log('🌐 API Base URL:', this.apiBaseUrl);
    console.log('🔗 URL completa:', `${this.apiBaseUrl}/auth/login`);
    console.log('📦 Dados enviados:', credentials);
    
    // Criar headers manualmente para evitar problemas com interceptor
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    console.log('📋 Headers criados:', headers);
    console.log('🚀 Enviando requisição POST...');
    
    return this.http.post<AuthResponse>(`${this.apiBaseUrl}/auth/login`, credentials, { headers })
      .pipe(
        tap(response => {
          console.log('✅ [ApiService.login] ===== RESPOSTA RECEBIDA =====');
          console.log('📊 Status da resposta:', response);
          console.log('🔑 Access Token:', response.access_token ? 'Presente' : 'Ausente');
          console.log('🔄 Refresh Token:', response.refresh_token ? 'Presente' : 'Ausente');
          console.log('👤 User:', response.user);
          this.setTokens(response.access_token, response.refresh_token);
          console.log('💾 Tokens salvos no localStorage');
        }),
        catchError(error => {
          console.error('❌ [ApiService.login] ===== ERRO NA REQUISIÇÃO =====');
          console.error('🚨 Tipo do erro:', error.constructor.name);
          console.error('📊 Status HTTP:', error.status);
          console.error('📝 Mensagem:', error.message);
          console.error('🔍 Detalhes do erro:', error);
          console.error('🌐 URL que falhou:', error.url);
          console.error('📋 Headers da resposta:', error.headers);
          return this.handleError(error);
        })
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    console.log('[ApiService.register] Iniciando cadastro:', { email: userData.email, apiUrl: this.apiBaseUrl });
    
    // Criar headers manualmente para evitar problemas com interceptor
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    return this.http.post<AuthResponse>(`${this.apiBaseUrl}/auth/register`, userData, { headers })
      .pipe(
        tap(response => {
          console.log('[ApiService.register] Resposta recebida:', response);
          this.setTokens(response.access_token, response.refresh_token);
        }),
        catchError(error => {
          console.error('[ApiService.register] Erro na requisição:', error);
          return this.handleError(error);
        })
      );
  }

  getMe(): Observable<any> {
    return this.http.get(`${this.apiBaseUrl}/auth/me`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Métodos de usuários
  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.apiBaseUrl}/users/me`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Métodos de empresas
  getCompanies(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiBaseUrl}/companies`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getCompany(companyId: string): Observable<any> {
    return this.http.get(`${this.apiBaseUrl}/companies/${companyId}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  createCompany(companyData: any): Observable<any> {
    return this.http.post(`${this.apiBaseUrl}/companies`, companyData, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateCompany(companyId: string, companyData: any): Observable<any> {
    return this.http.patch(`${this.apiBaseUrl}/companies/${companyId}`, companyData, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Métodos de membros
  getCompanyMembers(companyId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiBaseUrl}/companies/${companyId}/members`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  inviteMember(companyId: string, memberData: { email: string; role: string }): Observable<any> {
    return this.http.post(`${this.apiBaseUrl}/companies/${companyId}/members`, memberData, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateMember(companyId: string, memberId: string, memberData: { role: string }): Observable<any> {
    return this.http.patch(`${this.apiBaseUrl}/companies/${companyId}/members/${memberId}`, memberData, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  removeMember(companyId: string, memberId: string): Observable<any> {
    return this.http.delete(`${this.apiBaseUrl}/companies/${companyId}/members/${memberId}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Métodos de licitações
  getBids(companyId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiBaseUrl}/companies/${companyId}/bids`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getBid(companyId: string, bidId: string): Observable<any> {
    return this.http.get(`${this.apiBaseUrl}/companies/${companyId}/bids/${bidId}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  createBid(companyId: string, bidData: any): Observable<any> {
    return this.http.post(`${this.apiBaseUrl}/companies/${companyId}/bids`, bidData, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateBid(companyId: string, bidId: string, bidData: any): Observable<any> {
    return this.http.patch(`${this.apiBaseUrl}/companies/${companyId}/bids/${bidId}`, bidData, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteBid(companyId: string, bidId: string): Observable<any> {
    return this.http.delete(`${this.apiBaseUrl}/companies/${companyId}/bids/${bidId}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Métodos de documentos
  getDocuments(companyId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiBaseUrl}/companies/${companyId}/documents`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  createDocument(companyId: string, documentData: any): Observable<any> {
    return this.http.post(`${this.apiBaseUrl}/companies/${companyId}/documents`, documentData, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  uploadDocument(companyId: string, documentId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    const headers = new HttpHeaders();
    const token = this.tokenSubject.value;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.post(`${this.apiBaseUrl}/companies/${companyId}/documents/${documentId}/upload`, formData, { headers })
      .pipe(catchError(this.handleError));
  }

  // Métodos de health check
  healthCheck(): Observable<any> {
    console.log('🏥 [ApiService.healthCheck] ===== INICIANDO HEALTH CHECK =====');
    console.log('🌐 API Base URL:', this.apiBaseUrl);
    console.log('🔗 URL completa:', `${this.apiBaseUrl}/health`);
    console.log('🚀 Enviando requisição GET...');
    
    return this.http.get(`${this.apiBaseUrl}/health`)
      .pipe(
        tap(response => {
          console.log('✅ [ApiService.healthCheck] ===== RESPOSTA RECEBIDA =====');
          console.log('📊 Status da resposta:', response);
        }),
        catchError(error => {
          console.error('❌ [ApiService.healthCheck] ===== ERRO NA REQUISIÇÃO =====');
          console.error('🚨 Tipo do erro:', error.constructor.name);
          console.error('📊 Status HTTP:', error.status);
          console.error('📝 Mensagem:', error.message);
          console.error('🔍 Detalhes do erro:', error);
          console.error('🌐 URL que falhou:', error.url);
          return this.handleError(error);
        })
      );
  }

  databaseHealthCheck(): Observable<any> {
    return this.http.get(`${this.apiBaseUrl}/health/database`)
      .pipe(catchError(this.handleError));
  }

  // Gerenciamento de tokens
  setTokens(accessToken: string, refreshToken: string): void {
    console.log('💾 [ApiService.setTokens] ===== SALVANDO TOKENS =====');
    console.log('🔑 Access Token (primeiros 20 chars):', accessToken.substring(0, 20) + '...');
    console.log('🔄 Refresh Token (primeiros 20 chars):', refreshToken.substring(0, 20) + '...');
    
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    this.tokenSubject.next(accessToken);
    
    console.log('✅ Tokens salvos no localStorage e BehaviorSubject atualizado');
    console.log('🔍 Verificando localStorage:', {
      access_token: localStorage.getItem('access_token') ? 'Presente' : 'Ausente',
      refresh_token: localStorage.getItem('refresh_token') ? 'Presente' : 'Ausente'
    });
  }

  clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.tokenSubject.next(null);
  }

  getCurrentToken(): string | null {
    return this.tokenSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentToken();
  }
}
