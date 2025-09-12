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
    
    // Verifica se o usuário está logado
    const isLoggedIn = this.authService.isLoggedIn();
    const hasToken = !!localStorage.getItem('access_token');
    
    console.log('[GuestGuard] isLoggedIn():', isLoggedIn);
    console.log('[GuestGuard] hasToken:', hasToken);
    
    if (isLoggedIn && hasToken) {
      console.log('[GuestGuard] Usuário já logado → redirecionando para /dashboard');
      this.router.navigate(['/dashboard']);
      return false;
    }
    
    console.log('[GuestGuard] Usuário é convidado → permitindo acesso');
    return true;
  }
}
