import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService, User } from '../services';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    console.log('[RoleGuard] Verificando permissões de acesso...');
    console.log('[RoleGuard] URL atual:', this.router.url);
    console.log('[RoleGuard] isLoggedIn():', this.authService.isLoggedIn());
    
    const currentUser = this.authService.getCurrentUser();
    console.log('[RoleGuard] currentUser completo:', currentUser);
    
    if (!currentUser) {
      console.log('[RoleGuard] ❌ Usuário não encontrado → redirecionando para /login');
      this.router.navigate(['/login']);
      return false;
    }

    // Pega as roles necessárias da rota
    const requiredRoles = route.data?.['roles'] as string[];
    console.log('[RoleGuard] requiredRoles da rota:', requiredRoles);
    
    if (!requiredRoles || requiredRoles.length === 0) {
      console.log('[RoleGuard] ✅ Nenhuma role específica requerida → permitindo acesso');
      return true;
    }

    console.log('[RoleGuard] Roles requeridas:', requiredRoles);
    console.log('[RoleGuard] Role do usuário:', currentUser.role);
    console.log('[RoleGuard] Tipo da role do usuário:', typeof currentUser.role);

    // Verifica se o usuário tem uma das roles necessárias
    const hasRequiredRole = requiredRoles.includes(currentUser.role);
    console.log('[RoleGuard] hasRequiredRole:', hasRequiredRole);
    
    if (hasRequiredRole) {
      console.log('[RoleGuard] ✅ Usuário tem permissão → permitindo acesso');
      return true;
    } else {
      console.log('[RoleGuard] ❌ Usuário não tem permissão → redirecionando para /dashboard');
      console.log('[RoleGuard] Role do usuário:', currentUser.role, 'não está em:', requiredRoles);
      this.router.navigate(['/dashboard']);
      return false;
    }
  }
}
