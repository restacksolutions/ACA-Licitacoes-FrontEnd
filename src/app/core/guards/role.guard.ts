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
    
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.log('[RoleGuard] Usuário não encontrado → redirecionando para /login');
      this.router.navigate(['/login']);
      return false;
    }

    // Pega as roles necessárias da rota
    const requiredRoles = route.data?.['roles'] as string[];
    if (!requiredRoles || requiredRoles.length === 0) {
      console.log('[RoleGuard] Nenhuma role específica requerida → permitindo acesso');
      return true;
    }

    console.log('[RoleGuard] Roles requeridas:', requiredRoles);
    console.log('[RoleGuard] Role do usuário:', currentUser.role);

    // Verifica se o usuário tem uma das roles necessárias
    const hasRequiredRole = requiredRoles.includes(currentUser.role);
    
    if (hasRequiredRole) {
      console.log('[RoleGuard] Usuário tem permissão → permitindo acesso');
      return true;
    } else {
      console.log('[RoleGuard] Usuário não tem permissão → redirecionando para /dashboard');
      this.router.navigate(['/dashboard']);
      return false;
    }
  }
}
