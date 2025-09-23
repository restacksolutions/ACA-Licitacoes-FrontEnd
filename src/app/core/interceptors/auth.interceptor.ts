import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from '../../pages/auth-pages/auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('[AuthInterceptor] Interceptando requisição:', req.url);

  // Não adicionar token para requisições de autenticação
  const isAuthRequest = req.url.includes('/auth/login') || req.url.includes('/auth/register');
  
  if (!isAuthRequest) {
    // Adicionar token de autorização se disponível
    const token = authService.getToken();
    if (token) {
      console.log('[AuthInterceptor] Adicionando token de autorização');
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    } else {
      console.log('[AuthInterceptor] Nenhum token disponível');
    }
  } else {
    console.log('[AuthInterceptor] Requisição de autenticação, não adicionando token');
  }

  return next(req).pipe(
    tap(response => {
      console.log('[AuthInterceptor] Resposta recebida:', response);
    }),
    catchError((error: HttpErrorResponse) => {
      console.error('[AuthInterceptor] Erro na requisição:', error);
      if (error.status === 401 && !isAuthRequest) {
        // Token expirado ou inválido (apenas para requisições não-auth)
        console.log('[AuthInterceptor] Token expirado, fazendo logout');
        authService.logout();
        // Removido redirecionamento automático
      }
      return throwError(() => error);
    })
  );
};
