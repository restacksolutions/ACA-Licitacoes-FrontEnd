import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../services/token.service';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const tokenSvc = inject(TokenService);

  return next(req).pipe({
    error: (err: unknown) => {
      const e = err as HttpErrorResponse;
      // Mensagens amigáveis (pode plugar um toast depois)
      if (e.status === 401) {
        tokenSvc.clear();
        router.navigateByUrl('/login');
      }
      // Devolva o erro para o caller tratar também
      throw err;
    }
  } as any);
};
