import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from '../../pages/auth-pages/auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('🔍 [AuthInterceptor] ===== INTERCEPTANDO REQUISIÇÃO =====');
  console.log('🌐 URL:', req.url);
  console.log('📋 Método:', req.method);
  console.log('📦 Headers originais:', req.headers);

  // Não adicionar token para requisições de autenticação
  const isAuthRequest = req.url.includes('/auth/login') || req.url.includes('/auth/register');
  console.log('🔐 É requisição de autenticação?', isAuthRequest);
  
  if (!isAuthRequest) {
    // Adicionar token de autorização se disponível
    const token = authService.getToken();
    console.log('🔑 Token disponível?', token ? 'Sim' : 'Não');
    if (token) {
      console.log('✅ [AuthInterceptor] Adicionando token de autorização');
      console.log('🔑 Token (primeiros 20 chars):', token.substring(0, 20) + '...');
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('📋 Headers após adicionar token:', req.headers);
    } else {
      console.log('⚠️ [AuthInterceptor] Nenhum token disponível - requisição sem autenticação');
    }
  } else {
    console.log('🔓 [AuthInterceptor] Requisição de autenticação - não adicionando token');
  }

  return next(req).pipe(
    tap(response => {
      console.log('✅ [AuthInterceptor] ===== RESPOSTA RECEBIDA =====');
      console.log('📊 Tipo da resposta:', response.type);
      if (response.type === 4) { // HttpResponse
        const httpResponse = response as any;
        console.log('📊 Status:', httpResponse.status);
        console.log('📋 Headers da resposta:', httpResponse.headers);
        console.log('📦 Corpo da resposta:', httpResponse.body);
      }
    }),
    catchError((error: HttpErrorResponse) => {
      console.error('❌ [AuthInterceptor] ===== ERRO NA REQUISIÇÃO =====');
      console.error('🚨 Status HTTP:', error.status);
      console.error('📝 Mensagem:', error.message);
      console.error('🌐 URL que falhou:', error.url);
      console.error('📋 Headers da resposta:', error.headers);
      console.error('📦 Corpo do erro:', error.error);
      
      if (error.status === 401 && !isAuthRequest) {
        // Token expirado ou inválido (apenas para requisições não-auth)
        console.log('🔓 [AuthInterceptor] Token expirado - fazendo logout');
        authService.logout();
        // Removido redirecionamento automático
      }
      return throwError(() => error);
    })
  );
};
