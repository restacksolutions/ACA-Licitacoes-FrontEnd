import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../services/token.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const tokenSvc = inject(TokenService);

  return next(req).pipe(
    catchError((err: unknown) => {
      const e = err as HttpErrorResponse;
      if (e && e.status === 401) {
        tokenSvc.clear();
        router.navigateByUrl('/login');
      }
      return throwError(() => e);
    })
  );
};
