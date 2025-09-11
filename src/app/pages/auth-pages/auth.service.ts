import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
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

  constructor(private router: Router) {
    // Inicializa pelo estado atual da sessão do Supabase
    supabase.auth.getSession().then(async ({ data }) => {
      const session = data.session;
      if (session) {
        // Guardamos o token para compatibilidade com isLoggedIn/getToken existentes
        localStorage.setItem('access_token', session.access_token);
        await this.loadUserProfile(); // carrega app_user + empresa + papel
      }
    });
    // Mantém em sincronia quando o usuário loga/desloga
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('current_user');
        this.currentUserSubject.next(null);
      } else if (event === 'SIGNED_IN') {
        localStorage.setItem('access_token', session.access_token);
        await this.loadUserProfile();
      }
    });

    // Recupera do localStorage (fallback)
    const saved = localStorage.getItem('current_user');
    if (saved) this.currentUserSubject.next(JSON.parse(saved));
  }

  /** LOGIN via Supabase Auth, mantendo a assinatura Observable<boolean> */
  login(email: string, password: string): Observable<boolean> {
    return from(supabase.auth.signInWithPassword({ email, password })).pipe(
      mergeMap(async ({ data, error }) => {
        if (error) throw error;
        if (data.session?.access_token) {
          localStorage.setItem('access_token', data.session.access_token);
        }
        await this.loadUserProfile();
        return true;
      }),
      map(() => true),
      catchError(() => of(false))
    );
  }

  /** SIGN UP + criar empresa + virar admin (para sua tela de cadastro) */
  async signUpAndOnboard(payload: {
    fullName: string; email: string; password: string;
    companyName: string; cnpj?: string; phone?: string; address?: string;
  }): Promise<boolean> {
    // 1) cria conta
    const { error: e1 } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: { data: { full_name: payload.fullName } },
    });
    if (e1) throw e1;

    // Se seu projeto exige confirmação de e-mail, pare aqui e mostre instrução ao usuário.
    const { data: si, error: e2 } = await supabase.auth.signInWithPassword({
      email: payload.email, password: payload.password
    });
    if (e2) throw e2;
    if (si.session?.access_token) {
      localStorage.setItem('access_token', si.session.access_token);
    }

    // 2) chama o RPC para criar empresa e te tornar admin
    const { error: e3 } = await supabase.rpc('register_company_and_admin', {
      p_company_name: payload.companyName,
      p_cnpj: payload.cnpj ?? null,
      p_phone: payload.phone ?? null,
      p_address: payload.address ?? null,
      p_full_name: payload.fullName,
      p_email: payload.email,
    });
    if (e3) throw e3;

    // 3) carrega perfil
    await this.loadUserProfile();
    return true;
  }

  logout(): void {
    supabase.auth.signOut(); // onAuthStateChange já limpa tudo
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken() && !!this.currentUserSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // ===================== privados ======================

  /** Carrega app_user + empresa atual + papel (mapeando para seu enum de UI) */
  private async loadUserProfile() {
    // 1) app_users (RLS: read self)
    const { data: appUser, error: eUser } = await supabase
      .from('app_users')
      .select('id, full_name, email, created_at')
      .single();
    if (eUser) throw eUser;

    // 2) pega a primeira empresa visível (RLS já filtra por membro)
    const { data: companies, error: eComp } = await supabase
      .from('companies')
      .select('id')
      .order('created_at')
      .limit(1);
    if (eComp) throw eComp;

    const company = companies?.[0] ?? null;
    let roleUI: User['role'] = 'ANALYST';

    if (company) {
      // 3) papel do usuário nessa empresa
      const { data: mem, error: eMem } = await supabase
        .from('company_members')
        .select('role')
        .eq('company_id', company.id)
        .eq('user_id', appUser.id)
        .limit(1);
      if (eMem) throw eMem;
      const roleCompany: 'owner' | 'admin' | 'member' | 'viewer' | undefined = mem?.[0]?.role;

      // mapeamento simples para seu enum de UI
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
    // ajuste conforme sua política de acesso na UI:
    if (role === 'owner' || role === 'admin') return 'ADMIN';
    if (role === 'member') return 'ANALYST';
    return 'TECH'; // viewer ou indefinido
  }
}
