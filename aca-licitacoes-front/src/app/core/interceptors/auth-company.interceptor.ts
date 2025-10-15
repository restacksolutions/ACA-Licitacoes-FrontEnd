import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';
import { CompanyService } from '../services/company.service';

export const authCompanyInterceptor: HttpInterceptorFn = (req, next) => {
  // rotas públicas não recebem headers
  if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    return next(req);
  }

  const token = inject(TokenService).get();
  const companyId = inject(CompanyService).get();

  const setHeaders: Record<string, string> = {};
  if (token) setHeaders['Authorization'] = `Bearer ${token}`;
  if (companyId) setHeaders['X-Company-Id'] = companyId;

  return next(req.clone({ setHeaders }));
};
