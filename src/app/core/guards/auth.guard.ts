import { Injectable } from '@angular/core';
import { CanActivate, Router, CanActivateChild } from '@angular/router';
import { AuthService } from '../services';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    return this.checkAuth();
  }

  canActivateChild(): boolean {
    return this.checkAuth();
  }

  private checkAuth(): boolean {
    console.log('[AuthGuard] Verificando autenticação...');
    console.log('[AuthGuard] URL atual:', this.router.url);
    
    // 1) Verifica se tem token no localStorage
    const token = localStorage.getItem('access_token');
    console.log('[AuthGuard] Token no localStorage:', !!token);
    
    if (!token) {
      console.log('[AuthGuard] Sem token → redirecionando para /login');
      this.redirectToLogin();
      return false;
    }

    // 2) Verifica se o token é válido (não expirado)
    if (!this.isTokenValid(token)) {
      console.log('[AuthGuard] Token expirado → limpando e redirecionando para /login');
      this.clearAuthData();
      this.redirectToLogin();
      return false;
    }

    // 3) Verifica se o usuário está logado no serviço
    const isLoggedIn = this.authService.isLoggedIn();
    const currentUser = this.authService.getCurrentUser();
    
    console.log('[AuthGuard] isLoggedIn():', isLoggedIn);
    console.log('[AuthGuard] Usuário atual:', currentUser);
    
    if (isLoggedIn && currentUser) {
      console.log('[AuthGuard] Usuário autenticado → permitindo acesso');
      return true;
    } else {
      console.log('[AuthGuard] Usuário não logado → redirecionando para /login');
      this.clearAuthData();
      this.redirectToLogin();
      return false;
    }
  }

  private isTokenValid(token: string): boolean {
    try {
      // Decodifica o JWT para verificar se está expirado
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp < currentTime;
      
      console.log('[AuthGuard] Token expira em:', new Date(payload.exp * 1000));
      console.log('[AuthGuard] Token expirado:', isExpired);
      
      return !isExpired;
    } catch (error) {
      console.error('[AuthGuard] Erro ao validar token:', error);
      return false;
    }
  }

  private clearAuthData(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');
    localStorage.removeItem('pending_onboarding');
  }

  private redirectToLogin(): void {
    this.router.navigate(['/login']).catch((error) => {
      console.error('[AuthGuard] Erro ao redirecionar:', error);
      window.location.href = '/login';
    });
  }
}
