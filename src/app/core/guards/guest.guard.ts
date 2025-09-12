import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services';

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    console.log('[GuestGuard] Verificando se usuário é convidado...');
    console.log('[GuestGuard] URL atual:', this.router.url);
    
    // Verifica apenas se tem token válido no localStorage
    const token = localStorage.getItem('access_token');
    const hasToken = !!token;
    
    console.log('[GuestGuard] hasToken:', hasToken);
    
    if (hasToken) {
      // Verifica se o token é válido (não expirado)
      const isTokenValid = this.isTokenValid(token);
      console.log('[GuestGuard] Token válido:', isTokenValid);
      
      if (isTokenValid) {
        console.log('[GuestGuard] Usuário já logado → redirecionando para /dashboard');
        this.router.navigate(['/dashboard']);
        return false;
      } else {
        // Token expirado, limpa e permite acesso
        console.log('[GuestGuard] Token expirado → limpando e permitindo acesso');
        this.clearAuthData();
      }
    }
    
    console.log('[GuestGuard] Usuário é convidado → permitindo acesso');
    return true;
  }

  private isTokenValid(token: string): boolean {
    try {
      // Decodifica o JWT para verificar se está expirado
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp < currentTime;
      
      console.log('[GuestGuard] Token expira em:', new Date(payload.exp * 1000));
      console.log('[GuestGuard] Token expirado:', isExpired);
      
      return !isExpired;
    } catch (error) {
      console.error('[GuestGuard] Erro ao validar token:', error);
      return false;
    }
  }

  private clearAuthData(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');
    localStorage.removeItem('pending_onboarding');
  }
}
