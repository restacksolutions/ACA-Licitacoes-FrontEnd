import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NavigationInterceptor {
  
  constructor(private router: Router) {
    this.setupNavigationLogging();
  }

  private setupNavigationLogging(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        console.log('[NavigationInterceptor] Navegação detectada:', {
          url: event.url,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          referrer: document.referrer
        });
        
        // Log de segurança para rotas sensíveis
        this.logSecurityEvent(event.url);
      });
  }

  private logSecurityEvent(url: string): void {
    const sensitiveRoutes = ['/settings', '/reports', '/tenders/new'];
    const isSensitiveRoute = sensitiveRoutes.some(route => url.includes(route));
    
    if (isSensitiveRoute) {
      console.log('[NavigationInterceptor] Acesso a rota sensível:', {
        url,
        timestamp: new Date().toISOString(),
        user: localStorage.getItem('current_user') ? 'logado' : 'não logado'
      });
    }
  }
}
