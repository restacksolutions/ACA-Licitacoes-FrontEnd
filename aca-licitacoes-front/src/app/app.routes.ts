import { Routes } from '@angular/router';
import { authGuard } from './features/auth/auth.guard';

export const routes: Routes = [
  // Rotas privadas (com topbar)
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./private-layout/private-layout.component')
      .then(m => m.PrivateLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home.component')
          .then(m => m.HomeComponent),
      },
      {
        path: 'licitacoes',
        loadComponent: () => import('./features/licitacoes/licitacoes-list.component')
          .then(m => m.LicitacoesListComponent),
      },
    ]
  },

  // Rotas públicas (sem topbar) — usam AuthHeader local
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component')
      .then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register.component')
      .then(m => m.RegisterComponent),
  },

  { path: '**', redirectTo: '' },
];
