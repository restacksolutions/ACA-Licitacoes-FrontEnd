// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { GuestGuard } from './core/guards/guest.guard';
import { RoleGuard } from './core/guards/role.guard';

import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';

// Páginas logadas
import { EcommerceComponent } from './pages/dashboard/ecommerce/ecommerce.component';
import { CalenderComponent } from './pages/calender/calender.component';
import { TendersListComponent } from './pages/tenders/tenders-list/tenders-list.component';
import { TenderDetailComponent } from './pages/tenders/tender-detail/tender-detail.component';
import { NewTenderComponent } from './pages/tenders/new-tender/new-tender.component';
import { TenderSuccessComponent } from './pages/tenders/tender-success/tender-success.component';
import { VehiclesListComponent } from './pages/vehicles/vehicles-list/vehicles-list.component';
import { VehicleDetailComponent } from './pages/vehicles/vehicle-detail/vehicle-detail.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { ProfileComponent } from './pages/profile/profile.component';

// Auth pages (públicas)
import { SignInComponent } from './pages/auth-pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/auth-pages/sign-up/sign-up.component';

export const routes: Routes = [
  // Área autenticada — tudo dentro deste layout é protegido
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      {
        path: '',
        component: EcommerceComponent,
        pathMatch: 'full',
        title: 'Dashboard - Sistema de Licitações',
      },
      {
        path: 'dashboard',
        component: EcommerceComponent,
        title: 'Dashboard - Sistema de Licitações',
      },
      {
        path: 'calendar',
        component: CalenderComponent,
        title: 'Calendário - Sistema de Licitações',
      },
      {
        path: 'tenders',
        component: TendersListComponent,
        title: 'Licitações - Sistema de Licitações',
      },
      {
        path: 'tenders/new',
        component: NewTenderComponent,
        title: 'Nova Licitação - Sistema de Licitações',
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'ANALYST'] }
      },
      {
        path: 'tenders/:id',
        component: TenderDetailComponent,
        title: 'Detalhes da Licitação - Sistema de Licitações',
      },
      {
        path: 'tenders/:id/success',
        component: TenderSuccessComponent,
        title: 'Licitação Processada - Sistema de Licitações',
      },
      {
        path: 'vehicles',
        component: VehiclesListComponent,
        title: 'Veículos - Sistema de Licitações',
      },
      {
        path: 'vehicles/:id',
        component: VehicleDetailComponent,
        title: 'Detalhes do Veículo - Sistema de Licitações',
      },
      {
        path: 'reports',
        component: ReportsComponent,
        title: 'Relatórios - Sistema de Licitações',
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'ANALYST'] }
      },
      {
        path: 'settings',
        component: SettingsComponent,
        title: 'Configurações - Sistema de Licitações',
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'profile',
        component: ProfileComponent,
        title: 'Perfil - Sistema de Licitações',
      },
    ],
  },

  // Auth (públicas) - redireciona usuários logados
  { 
    path: 'login',  
    component: SignInComponent, 
    title: 'Login - Sistema de Licitações',
    canActivate: [GuestGuard]
  },
  { 
    path: 'signin', 
    component: SignInComponent, 
    title: 'Login - Sistema de Licitações',
    canActivate: [GuestGuard]
  },
  { 
    path: 'signup', 
    component: SignUpComponent, 
    title: 'Cadastro - Sistema de Licitações',
    canActivate: [GuestGuard]
  },

  // Fallback
  { path: '**', redirectTo: 'login' },
];
