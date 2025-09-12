import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { supabase } from '../../core/supa';

export interface User {
  id: string;          // app_users.id
  email: string;
  name: string;
  role: 'ADMIN' | 'ANALYST' | 'TECH'; // mapeado de role_company (owner/admin/member/viewer)
  company_id: string;
  created_at: string;
}

export interface LoginRequest { email: string; password: string; }
export interface LoginResponse { access_token: string; token_type: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private lastErrorMessage = '';
  getLastError() { return this.lastErrorMessage; }

  constructor(private router: Router) {
    // Sessão inicial
    supabase.auth.getSession().then(async ({ data }) => {
      const session = data.session;
      if (session) {
        localStorage.setItem('access_token', session.access_token);
        try {
          await this.loadUserProfile(); // carrega app_user + empresa + papel
        } catch (e) {
          console.warn('[AuthService] loadUserProfile falhou na inicialização:', e);
          this.clearAuthData();
        }
      } else {
        // Se não há sessão, limpa tudo
        this.clearAuthData();
      }
    });

    // Sincroniza mudanças de sessão
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthState]', event, { hasSession: !!session });
      if (event === 'SIGNED_OUT' || !session) {
        this.clearAuthData();
      } else if (event === 'SIGNED_IN') {
        localStorage.setItem('access_token', session.access_token);
        try {
          await this.loadUserProfile();
        } catch (e) {
          console.warn('[AuthState] loadUserProfile falhou:', e);
          this.clearAuthData();
        }
      }
    });

    // Recupera do localStorage apenas se há token válido
    const token = localStorage.getItem('access_token');
    const saved = localStorage.getItem('current_user');
    if (token && saved) {
      try {
        const user = JSON.parse(saved);
        if (user && user.id && user.email) {
          this.currentUserSubject.next(user);
        } else {
          this.clearAuthData();
        }
      } catch (e) {
        console.warn('[AuthService] Erro ao recuperar usuário do localStorage:', e);
        this.clearAuthData();
      }
    } else {
      this.clearAuthData();
    }
  }

  /** LOGIN via Supabase Auth */
  login(email: string, password: string): Observable<boolean> {
    return from(supabase.auth.signInWithPassword({ email, password })).pipe(
      mergeMap(async ({ data, error }) => {
        console.log('[AuthService.login] result', { hasSession: !!data?.session, err: error?.message || null });
        if (error) throw error;

        if (data.session?.access_token) {
          localStorage.setItem('access_token', data.session.access_token);
        }

        try {
          await this.loadUserProfile();
        } catch (e) {
          console.warn('[AuthService.login] loadUserProfile falhou:', e);
          // fallback mínimo
          const basicUser: User = {
            id: data.user?.id || email,
            email: data.user?.email || email,
            name: (data.user?.user_metadata as any)?.full_name || email,
            role: 'ADMIN',
            company_id: '',
            created_at: new Date().toISOString(),
          };
          localStorage.setItem('current_user', JSON.stringify(basicUser));
          this.currentUserSubject.next(basicUser);
        }

        this.lastErrorMessage = '';
        return true;
      }),
      map(() => true),
      catchError((err) => {
        console.error('[AuthService.login] erro:', err);
        this.lastErrorMessage = this.mapAuthError(err);
        return of(false);
      })
    );
  }

   /**
    * SIGN UP:
    * - envia metadata da empresa no signup (trigger no DB cria app_users/companies/membership)
    * - se vier sessão: salva token, carrega perfil e **REDIRECIONA PARA /dashboard**
    * - se NÃO vier sessão (projetos com confirmação de e-mail): **REDIRECIONA PARA /login** com mensagem amigável
    */
  async signUpAndOnboard(payload: {
    fullName: string; email: string; password: string;
    companyName: string; cnpj?: string; phone?: string; address?: string;
  }): Promise<boolean> {
    console.log('[AuthService.signUpAndOnboard] payload', { ...payload, password: '***' });

    // 1) Criar conta com metadata lida pelo trigger
    const { data: signUpData, error: e1 } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          full_name: payload.fullName,
          company_name: payload.companyName,
          cnpj: payload.cnpj ?? null,
          phone: payload.phone ?? null,
          address: payload.address ?? null,
        }
      },
    });
    console.log('[AuthService.signUpAndOnboard] signUp', { hasSession: !!signUpData?.session, err: e1?.message || null });
    if (e1) throw new Error(this.mapAuthError(e1));

    // 2) Fluxo A: projetos com confirmação de e-mail (não veio sessão)
    if (!signUpData.session?.access_token) {
      console.log('[AuthService.signUpAndOnboard] sem sessão (provável confirmação de e-mail) → ir para /login');
      // opcional: gravar info para UI
      this.lastErrorMessage = 'Conta criada. Verifique seu e-mail para confirmar o cadastro.';
      await this.navigateToLoginSafe();
      return true;
    }

     // 3) Fluxo B: sessão veio (confirmação desativada) → salva token, carrega perfil e vai para dashboard
     localStorage.setItem('access_token', signUpData.session.access_token);
     console.log('[AuthService.signUpAndOnboard] Token salvo, carregando perfil...');

     try {
       await this.loadUserProfile();
       console.log('[AuthService.signUpAndOnboard] perfil carregado com sucesso');
     } catch (profileError) {
       console.warn('[AuthService.signUpAndOnboard] loadUserProfile falhou, criando usuário básico:', profileError);
       // Cria usuário básico como fallback
       const basicUser: User = {
         id: signUpData.user?.id || payload.email,
         email: signUpData.user?.email || payload.email,
         name: payload.fullName,
         role: 'ADMIN',
         company_id: '',
         created_at: new Date().toISOString(),
       };
       localStorage.setItem('current_user', JSON.stringify(basicUser));
       this.currentUserSubject.next(basicUser);
     }

     // 4) Redireciona para dashboard (usuário já está logado)
     console.log('[AuthService.signUpAndOnboard] Redirecionando para dashboard...');
     console.log('[AuthService.signUpAndOnboard] Usuário atual:', this.currentUserSubject.value);
     console.log('[AuthService.signUpAndOnboard] Token no localStorage:', !!localStorage.getItem('access_token'));
     
     // Navega diretamente para o dashboard
     await this.navigateToDashboardSafe();
     
     return true;
  }

  logout(): void {
    console.log('[AuthService] Iniciando logout...');
    
    // 1) Limpa o estado do usuário
    this.currentUserSubject.next(null);
    
    // 2) Limpa o localStorage completamente
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');
    localStorage.removeItem('pending_onboarding');
    
    // 3) Faz logout do Supabase
    supabase.auth.signOut();
    
    // 4) Redireciona para login
    console.log('[AuthService] Redirecionando para /login...');
    this.router.navigate(['/login']).then(() => {
      console.log('[AuthService] Logout concluído');
    }).catch((error) => {
      console.error('[AuthService] Erro ao redirecionar:', error);
      // Fallback: redirecionamento forçado
      window.location.href = '/login';
    });
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isLoggedIn(): boolean {
    const hasToken = !!this.getToken();
    const hasUser = !!this.currentUserSubject.value;
    const hasValidUser = !!(this.currentUserSubject.value && 
                           this.currentUserSubject.value.id && 
                           this.currentUserSubject.value.email);
    
    console.log('[AuthService.isLoggedIn] Verificação:', {
      hasToken,
      hasUser,
      hasValidUser,
      user: this.currentUserSubject.value
    });
    
    return hasToken && hasUser && hasValidUser;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // ===================== privados ======================

  /** Carrega app_user + empresa + papel */
  private async loadUserProfile() {
    // 1) app_users
    const { data: appUser, error: eUser } = await supabase
      .from('app_users')
      .select('id, full_name, email, created_at')
      .single();
    if (eUser) throw eUser;

    // 2) empresa do usuário (RLS já filtra por membro/admin)
    const { data: companies, error: eComp } = await supabase
      .from('companies')
      .select('id')
      .order('created_at')
      .limit(1);
    if (eComp) throw eComp;

    const company = companies?.[0] ?? null;
    let roleUI: User['role'] = 'ANALYST';

    if (company) {
      // 3) papel do usuário
      const { data: mem, error: eMem } = await supabase
        .from('company_members')
        .select('role')
        .eq('company_id', company.id)
        .eq('user_id', appUser.id)
        .limit(1);
      if (eMem) throw eMem;

      const roleCompany: 'owner' | 'admin' | 'member' | 'viewer' | undefined = mem?.[0]?.role;
      roleUI = this.mapRoleToUI(roleCompany);
    }

    const user: User = {
      id: appUser.id,
      email: appUser.email,
      name: appUser.full_name ?? appUser.email,
      role: roleUI,
      company_id: company?.id ?? '',
      created_at: appUser.created_at,
    };

    localStorage.setItem('current_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private mapRoleToUI(role?: 'owner' | 'admin' | 'member' | 'viewer'): User['role'] {
    if (role === 'owner' || role === 'admin') return 'ADMIN';
    if (role === 'member') return 'ANALYST';
    return 'TECH';
  }

   private async navigateToLoginSafe() {
     try {
       const ok = await this.router.navigate(['/login'], { replaceUrl: true });
       console.log('[AuthService] navigate /login →', ok);
       if (ok) return;
       const ok2 = await this.router.navigateByUrl('/login', { replaceUrl: true });
       console.log('[AuthService] navigateByUrl /login →', ok2);
       if (ok2) return;
       console.warn('[AuthService] SPA navigation falhou — hard redirect /login');
       window.location.assign('/login');
     } catch (err) {
       console.error('[AuthService] erro ao navegar para /login:', err);
       window.location.assign('/login');
     }
   }

   private async navigateToDashboardSafe() {
     try {
       console.log('[AuthService] Tentando navegar para /dashboard...');
       console.log('[AuthService] Router disponível:', !!this.router);
       console.log('[AuthService] URL atual:', this.router.url);
       
       const ok = await this.router.navigate(['/dashboard'], { replaceUrl: true });
       console.log('[AuthService] navigate /dashboard →', ok);
       if (ok) {
         console.log('[AuthService] Navegação bem-sucedida via navigate()');
         return;
       }
       
       console.log('[AuthService] Tentando navigateByUrl...');
       const ok2 = await this.router.navigateByUrl('/dashboard', { replaceUrl: true });
       console.log('[AuthService] navigateByUrl /dashboard →', ok2);
       if (ok2) {
         console.log('[AuthService] Navegação bem-sucedida via navigateByUrl()');
         return;
       }
       
       console.warn('[AuthService] SPA navigation falhou — hard redirect /dashboard');
       window.location.assign('/dashboard');
     } catch (err) {
       console.error('[AuthService] erro ao navegar para /dashboard:', err);
       window.location.assign('/dashboard');
     }
   }

  private clearAuthData(): void {
    console.log('[AuthService] Limpando dados de autenticação...');
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');
    localStorage.removeItem('pending_onboarding');
    this.currentUserSubject.next(null);
  }

  private mapAuthError(error: any): string {
    const m = String(error?.message || error);
    const map: Record<string,string> = {
      'User already registered': 'Este e-mail já está cadastrado',
      'Invalid email': 'E-mail inválido',
      'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres',
      'Email not confirmed': 'E-mail não confirmado',
      'Invalid login credentials': 'Credenciais inválidas',
      'Too many requests': 'Muitas tentativas. Tente novamente mais tarde',
    };
    return map[m] || m || 'Erro desconhecido';
  }
}
