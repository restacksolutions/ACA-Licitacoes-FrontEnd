import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { supabase } from '../../core/supa';

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

  constructor(private router: Router) {
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

  /** LOGIN: sucesso => true, falha => false; tolerante a falhas de perfil */
  login(email: string, password: string): Observable<boolean> {
    return from(supabase.auth.signInWithPassword({ email, password })).pipe(
      mergeMap(async ({ data, error }) => {
        console.log('[AuthService.login] result', { hasSession: !!data?.session, err: error?.message || null });
        if (error) throw error;
        if (data.session?.access_token) localStorage.setItem('access_token', data.session.access_token);

        // carrega perfil (tolerante)
        try { 
          await this.loadUserProfile();
          console.log('[AuthService.login] loadUserProfile concluído com sucesso');
        }
        catch (e) {
          console.warn('[AuthService.login] loadUserProfile falhou, usando perfil básico ADMIN');
          const basicUser: User = {
            id: data.user?.id || email,
            email: data.user?.email || email,
            name: (data.user?.user_metadata as any)?.full_name || (data.user?.email ?? email),
            role: 'ADMIN', // SEMPRE ADMIN como padrão
            company_id: '',
            created_at: new Date().toISOString(),
          };
          console.log('[AuthService.login] Perfil básico criado:', basicUser);
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
   * SIGN UP (email verification OFF):
   * - envia metadata da empresa (trigger no DB cria app_users/companies/company_members)
   * - sessão vem imediatamente; salvamos token, tentamos perfil (tolerante)
   * - fazemos signOut e deixamos o componente redirecionar para /login
   */
  async signUpAndOnboard(payload: {
    fullName: string; email: string; password: string;
    companyName: string; cnpj?: string; phone?: string; address?: string;
  }): Promise<boolean> {
    console.log('[AuthService.signUpAndOnboard] payload', { ...payload, password: '***' });

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

    if (!signUpData.session?.access_token) {
      // com verificação OFF isso não deveria acontecer; trate como erro explícito
      this.lastErrorMessage = 'Sessão não criada após o cadastro. Revise as configurações do Auth.';
      throw new Error(this.lastErrorMessage);
    }

    localStorage.setItem('access_token', signUpData.session.access_token);

    // tenta perfil (tolerante)
    try { await this.loadUserProfile(); }
    catch (e) { console.warn('[AuthService.signUpAndOnboard] loadUserProfile falhou (ok):', e); }

    // sai da sessão e deixa o componente redirecionar para /login
    try { await supabase.auth.signOut(); }
    catch (e) { console.warn('[AuthService.signUpAndOnboard] signOut falhou:', e); }

    this.lastErrorMessage = 'Conta criada com sucesso! Faça login para continuar.';
    return true;
  }

  logout(): void {
    console.log('[AuthService.logout] Iniciando logout...');
    
    // Limpa dados do localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');
    
    // Limpa o estado do usuário
    this.currentUserSubject.next(null);
    
    // Faz logout do Supabase
    supabase.auth.signOut().then(() => {
      console.log('[AuthService.logout] Supabase signOut concluído');
    }).catch((error) => {
      console.warn('[AuthService.logout] Erro no signOut do Supabase:', error);
    });
    
    // Redireciona para login
    this.router.navigate(['/login']).then(() => {
      console.log('[AuthService.logout] Redirecionamento para /login concluído');
    }).catch((error) => {
      console.warn('[AuthService.logout] Erro no redirecionamento:', error);
      // Fallback: redirecionamento forçado
      window.location.href = '/login';
    });
  }

  getToken(): string | null { return localStorage.getItem('access_token'); }

  isLoggedIn(): boolean {
    const token = this.getToken();
    let user = this.currentUserSubject.value;
    const saved = localStorage.getItem('current_user');
    if (!user && saved) {
      try { user = JSON.parse(saved); this.currentUserSubject.next(user); } catch {}
    }
    return !!token;
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
    console.log('Token:', localStorage.getItem('access_token'));
    console.log('Current User (localStorage):', localStorage.getItem('current_user'));
    console.log('Current User (Subject):', this.currentUserSubject.value);
    console.log('isLoggedIn():', this.isLoggedIn());
    console.log('getCurrentUser():', this.getCurrentUser());
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