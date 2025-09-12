import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const AuthGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const token = localStorage.getItem('access_token');
  if (token) return true;
  return router.createUrlTree(['/login']);
};