import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, of, firstValueFrom } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { supabase } from '../../core/supa';
import { ApiService, LoginRequest, RegisterRequest, AuthResponse } from '../../core/services/api.service';

export interface User {
  id: string;          // app_users.id ou fallback
  email: string;
  name: string;
  role: 'ADMIN' | 'ANALYST' | 'TECH';
  company_id: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private lastErrorMessage = '';
  getLastError() { return this.lastErrorMessage; }

  constructor(private router: Router, private apiService: ApiService) {
    // sessão inicial
    supabase.auth.getSession().then(async ({ data }) => {
      const session = data.session;
      if (session?.access_token) {
        localStorage.setItem('access_token', session.access_token);
        try { await this.loadUserProfile(); } catch { /* tolerante */ }
      }
    });

    // sincroniza eventos de auth
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthState]', event, { hasSession: !!session });
      if (event === 'SIGNED_OUT' || !session) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('current_user');
        this.currentUserSubject.next(null);
      } else if (event === 'SIGNED_IN') {
        if (session.access_token) localStorage.setItem('access_token', session.access_token);
        try { await this.loadUserProfile(); } catch (e) { console.warn('[AuthState] loadUserProfile erro:', e); }
      }
    });

    const saved = localStorage.getItem('current_user');
    if (saved) {
      try { this.currentUserSubject.next(JSON.parse(saved)); } catch {}
    }
  }

  /** LOGIN: sucesso => true, falha => false; usa API do backend */
  login(email: string, password: string): Observable<boolean> {
    console.log('[AuthService.login] ===== INICIANDO LOGIN =====');
    console.log('📧 Email:', email);
    console.log('🌐 API Base URL:', this.apiService['apiBaseUrl']);
    
    const loginRequest: LoginRequest = { email, password };
    
    return this.apiService.login(loginRequest).pipe(
      switchMap((authResponse: AuthResponse) => {
        console.log('[AuthService.login] ===== RESPOSTA DA API RECEBIDA =====');
        console.log('📊 AuthResponse:', authResponse);
        console.log('👤 User ID:', authResponse.user_id);
        console.log('📧 Email:', authResponse.email);
        console.log('🔑 Access Token:', authResponse.access_token ? 'Presente' : 'Ausente');
        
        // Validação da resposta
        if (!authResponse || !authResponse.access_token) {
          console.error('[AuthService.login] Resposta inválida da API:', authResponse);
          this.lastErrorMessage = 'Resposta inválida do servidor';
          return of(false);
        }
        
        // Para modo de desenvolvimento, criar dados mock do usuário
        const user: User = {
          id: authResponse.user_id || 'mock-user-id',
          email: authResponse.email,
          name: authResponse.email.split('@')[0], // Nome baseado no email
          role: 'ADMIN', // Role padrão para desenvolvimento
          company_id: 'mock-company-id',
          created_at: new Date().toISOString()
        };

        console.log('[AuthService.login] ===== USUÁRIO CRIADO =====');
        console.log('👤 User object:', user);
        
        // Salvar no localStorage (tokens já salvos pelo ApiService)
        console.log('[AuthService.login] ===== SALVANDO DADOS DO USUÁRIO =====');
        console.log('💾 Salvando current_user no localStorage:', user);
        
        localStorage.setItem('current_user', JSON.stringify(user));
        this.currentUserSubject.next(user);
        this.lastErrorMessage = '';
        
        console.log('[AuthService.login] ===== LOGIN CONCLUÍDO COM SUCESSO =====');
        console.log('🔍 Verificando localStorage após login:', {
          access_token: localStorage.getItem('access_token') ? 'Presente' : 'Ausente',
          refresh_token: localStorage.getItem('refresh_token') ? 'Presente' : 'Ausente',
          current_user: localStorage.getItem('current_user') ? 'Presente' : 'Ausente'
        });
        return of(true);
      }),
      catchError((err) => {
        console.error('[AuthService.login] ===== ERRO NO LOGIN =====');
        console.error('🚨 Erro:', err);
        console.error('📝 Mensagem:', err.message);
        console.error('🔍 Stack:', err.stack);
        
        this.lastErrorMessage = this.mapApiError(err);
        console.error('📤 Mensagem de erro final:', this.lastErrorMessage);
        
        return of(false);
      })
    );
  }

  /**
   * SIGN UP: usa API do backend
   */
  async signUpAndOnboard(payload: {
    fullName: string; email: string; password: string;
    companyName: string; cnpj?: string; phone?: string; address?: string;
  }): Promise<boolean> {
    console.log('[AuthService.signUpAndOnboard] ===== INICIANDO CADASTRO =====');
    console.log('📧 Email:', payload.email);
    console.log('👤 Nome:', payload.fullName);
    console.log('🏢 Empresa:', payload.companyName);
    console.log('🌐 API Base URL:', this.apiService['apiBaseUrl']);

    const registerRequest: RegisterRequest = {
      fullName: payload.fullName,
      email: payload.email,
      password: payload.password,
      companyName: payload.companyName,
      companyCnpj: payload.cnpj || '',
      companyPhone: payload.phone || '',
      companyAddress: payload.address || ''
    };

    try {
      console.log('[AuthService.signUpAndOnboard] Enviando requisição para API...');
      const authResponse = await firstValueFrom(this.apiService.register(registerRequest));
      
      console.log('[AuthService.signUpAndOnboard] ===== RESPOSTA DA API RECEBIDA =====');
      console.log('📊 AuthResponse:', authResponse);
      console.log('👤 User ID:', authResponse.user_id);
      console.log('📧 Email:', authResponse.email);
      console.log('🔑 Access Token:', authResponse.access_token ? 'Presente' : 'Ausente');
      console.log('🏢 Company ID:', authResponse.company_id || 'Não fornecido');

      // Validação da resposta
      if (!authResponse || !authResponse.access_token) {
        console.error('[AuthService.signUpAndOnboard] Resposta inválida da API:', authResponse);
        this.lastErrorMessage = 'Resposta inválida do servidor';
        throw new Error(this.lastErrorMessage);
      }

      // Para modo de desenvolvimento, criar dados mock do usuário
      const user: User = {
        id: authResponse.user_id || 'mock-user-id',
        email: authResponse.email,
        name: payload.fullName, // Usar o nome fornecido no cadastro
        role: 'ADMIN', // Role padrão para desenvolvimento
        company_id: authResponse.company_id || 'mock-company-id',
        created_at: new Date().toISOString()
      };

      console.log('[AuthService.signUpAndOnboard] ===== USUÁRIO CRIADO =====');
      console.log('👤 User object:', user);
      
      // Salvar tokens no localStorage (já salvos pelo ApiService)
      console.log('[AuthService.signUpAndOnboard] ===== SALVANDO DADOS DO USUÁRIO =====');
      console.log('💾 Salvando current_user no localStorage:', user);
      
      localStorage.setItem('current_user', JSON.stringify(user));
      this.currentUserSubject.next(user);

      this.lastErrorMessage = 'Conta criada com sucesso!';
      console.log('[AuthService.signUpAndOnboard] ===== CADASTRO CONCLUÍDO COM SUCESSO =====');
      console.log('🔍 Verificando localStorage após cadastro:', {
        access_token: localStorage.getItem('access_token') ? 'Presente' : 'Ausente',
        refresh_token: localStorage.getItem('refresh_token') ? 'Presente' : 'Ausente',
        current_user: localStorage.getItem('current_user') ? 'Presente' : 'Ausente'
      });
      return true;
    } catch (error: any) {
      console.error('[AuthService.signUpAndOnboard] ===== ERRO NO CADASTRO =====');
      console.error('🚨 Erro:', error);
      console.error('📝 Mensagem:', error.message);
      console.error('🔍 Stack:', error.stack);
      
      this.lastErrorMessage = this.mapApiError(error);
      console.error('📤 Mensagem de erro final:', this.lastErrorMessage);
      
      throw new Error(this.lastErrorMessage);
    }
  }

  logout(): void {
    console.log('[AuthService.logout] Iniciando logout...');
    
    // Limpa tokens da API
    this.apiService.clearTokens();
    
    // Limpa dados do localStorage
    localStorage.removeItem('current_user');
    
    // Limpa o estado do usuário
    this.currentUserSubject.next(null);
    
    // Removido redirecionamento automático
    console.log('[AuthService.logout] Logout concluído');
  }

  getToken(): string | null { return this.apiService.getCurrentToken(); }

  isLoggedIn(): boolean {
    return this.apiService.isAuthenticated();
  }

  getCurrentUser(): User | null { 
    const user = this.currentUserSubject.value;
    console.log('[AuthService.getCurrentUser] currentUserSubject.value:', user);
    
    if (!user) {
      const saved = localStorage.getItem('current_user');
      console.log('[AuthService.getCurrentUser] localStorage current_user:', saved);
      if (saved) {
        try {
          const parsedUser = JSON.parse(saved);
          console.log('[AuthService.getCurrentUser] parsedUser do localStorage:', parsedUser);
          this.currentUserSubject.next(parsedUser);
          return parsedUser;
        } catch (e) {
          console.error('[AuthService.getCurrentUser] erro ao parsear current_user:', e);
        }
      }
    }
    
    return user;
  }

  // Método de debug temporário
  debugAuthState() {
    console.log('=== DEBUG AUTH STATE ===');
    console.log('🔑 Access Token:', localStorage.getItem('access_token') ? 'Presente' : 'Ausente');
    console.log('🔄 Refresh Token:', localStorage.getItem('refresh_token') ? 'Presente' : 'Ausente');
    console.log('👤 Current User (localStorage):', localStorage.getItem('current_user'));
    console.log('👤 Current User (Subject):', this.currentUserSubject.value);
    console.log('✅ isLoggedIn():', this.isLoggedIn());
    console.log('👤 getCurrentUser():', this.getCurrentUser());
    console.log('🌐 API Base URL:', this.apiService['apiBaseUrl']);
    console.log('========================');
  }

  /** Perfil tolerante: usa maybeSingle e fallbacks de session */
  private async loadUserProfile() {
    console.log('[AuthService.loadUserProfile] begin');
    const { data: sess } = await supabase.auth.getSession();

    const { data: appUser, error: eUser } = await supabase
      .from('app_users')
      .select('id, full_name, email, created_at')
      .maybeSingle();
    if (eUser) console.warn('[AuthService.loadUserProfile] app_users erro:', eUser.message || eUser);

    let companyId = '';
    const { data: companies, error: eComp } = await supabase
      .from('companies')
      .select('id')
      .order('created_at')
      .limit(1);
    if (eComp) console.warn('[AuthService.loadUserProfile] companies erro:', eComp.message || eComp);
    if (companies?.length) companyId = companies[0].id;

    // PADRÃO: ADMIN se não conseguir carregar do banco
    let roleUI: User['role'] = 'ADMIN';
    if (companyId && appUser?.id) {
      const { data: mem, error: eMem } = await supabase
        .from('company_members')
        .select('role')
        .eq('company_id', companyId)
        .eq('user_id', appUser.id)
        .limit(1);
      if (eMem) console.warn('[AuthService.loadUserProfile] company_members erro:', eMem.message || eMem);
      const roleCompany: 'owner' | 'admin' | 'member' | 'viewer' | undefined = mem?.[0]?.role;
      roleUI = this.mapRoleToUI(roleCompany);
    } else {
      console.log('[AuthService.loadUserProfile] Usando role padrão ADMIN (banco não retornou dados)');
    }

    const sessionUser = sess?.session?.user;
    const email = sessionUser?.email || appUser?.email || '';
    const name =
      (sessionUser?.user_metadata as any)?.full_name ||
      appUser?.full_name ||
      email ||
      'Usuário';

    const user: User = {
      id: appUser?.id || (sessionUser?.id ?? 'no-app-user'),
      email,
      name,
      role: roleUI,
      company_id: companyId,
      created_at: appUser?.created_at || new Date().toISOString(),
    };

    console.log('[AuthService.loadUserProfile] Usuário criado:', user);
    localStorage.setItem('current_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
    return user;
  }

  private mapRoleToUI(role?: 'owner' | 'admin' | 'member' | 'viewer'): User['role'] {
    if (role === 'owner' || role === 'admin') return 'ADMIN';
    if (role === 'member') return 'ANALYST';
    // PADRÃO: ADMIN se role não for reconhecida
    console.log('[AuthService.mapRoleToUI] Role não reconhecida:', role, '→ usando ADMIN como padrão');
    return 'ADMIN';
  }

  async resetPasswordForEmail(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`
    });
    if (error) throw error;
  }

  async resendEmailVerification(email: string): Promise<void> {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email
    });
    if (error) throw error;
  }

  private mapApiRoleToUI(apiRole: string): User['role'] {
    switch (apiRole) {
      case 'owner':
      case 'admin':
        return 'ADMIN';
      case 'member':
        return 'ANALYST';
      default:
        console.log('[AuthService.mapApiRoleToUI] Role não reconhecida:', apiRole, '→ usando ADMIN como padrão');
        return 'ADMIN';
    }
  }

  private mapApiError(err: any): string {
    const m = String(err?.message || err).toLowerCase();
    if (/invalid login credentials|invalid credentials/.test(m)) return 'E-mail ou senha incorretos.';
    if (/confirm|verification/.test(m)) return 'Sua conta precisa ser confirmada.';
    if (/user already registered|email.*(exists|already)/.test(m)) return 'Este e-mail já está cadastrado.';
    if (/password.*(weak|short)|password too weak/.test(m)) return 'Senha muito fraca.';
    if (/rate limit|too many requests/.test(m)) return 'Muitas tentativas. Aguarde alguns minutos.';
    if (/network|connection|timeout/.test(m)) return 'Erro de conexão. Tente novamente.';
    if (/dados inválidos/.test(m)) return 'Dados inválidos. Verifique os campos preenchidos.';
    if (/não autorizado/.test(m)) return 'Não autorizado. Faça login novamente.';
    if (/acesso negado/.test(m)) return 'Acesso negado. Você não tem permissão para esta ação.';
    if (/recurso não encontrado/.test(m)) return 'Recurso não encontrado.';
    if (/conflito.*email.*cnpj.*já existe/.test(m)) return 'E-mail ou CNPJ já cadastrado.';
    if (/erro interno do servidor/.test(m)) return 'Erro interno do servidor. Tente novamente.';
    return 'Falha na autenticação.';
  }

  private mapAuthError(err: any): string {
    const m = String(err?.message || err).toLowerCase();
    if (/invalid login credentials|invalid credentials/.test(m)) return 'E-mail ou senha incorretos.';
    if (/confirm|verification/.test(m)) return 'Sua conta precisa ser confirmada.';
    if (/user already registered|email.*(exists|already)/.test(m)) return 'Este e-mail já está cadastrado.';
    if (/password.*(weak|short)|password too weak/.test(m)) return 'Senha muito fraca.';
    if (/rate limit|too many requests/.test(m)) return 'Muitas tentativas. Aguarde alguns minutos.';
    if (/network|connection|timeout/.test(m)) return 'Erro de conexão. Tente novamente.';
    return 'Falha na autenticação.';
  }
}