import { Routes } from '@angular/router';
import { EcommerceComponent } from './pages/dashboard/ecommerce/ecommerce.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';
import { SignInComponent } from './pages/auth-pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/auth-pages/sign-up/sign-up.component';
import { CalenderComponent } from './pages/calender/calender.component';
import { TendersListComponent } from './pages/tenders/tenders-list/tenders-list.component';
import { TenderDetailComponent } from './pages/tenders/tender-detail/tender-detail.component';
import { NewTenderComponent } from './pages/tenders/new-tender/new-tender.component';
import { TenderSuccessComponent } from './pages/tenders/tender-success/tender-success.component';
import { VehiclesListComponent } from './pages/vehicles/vehicles-list/vehicles-list.component';
import { VehicleDetailComponent } from './pages/vehicles/vehicle-detail/vehicle-detail.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { SettingsComponent } from './pages/settings/settings.component';
// import { AuthGuard } from './core/guards/auth.guard'; // Temporarily disabled

export const routes: Routes = [
  {
    path:'',
    component:AppLayoutComponent,
    // canActivate: [AuthGuard], // Temporarily disabled
    children:[
      {
        path: '',
        component: EcommerceComponent,
        pathMatch: 'full',
        title: 'Dashboard - Sistema de Licitações',
      },
      {
        path:'dashboard',
        component: EcommerceComponent,
        title: 'Dashboard - Sistema de Licitações'
      },
      {
        path:'calendar',
        component:CalenderComponent,
        title:'Calendário - Sistema de Licitações'
      },
      {
        path:'tenders',
        component:TendersListComponent,
        title:'Licitações - Sistema de Licitações'
      },
      {
        path:'tenders/new',
        component:NewTenderComponent,
        title:'Nova Licitação - Sistema de Licitações'
      },
      {
        path:'tenders/:id',
        component:TenderDetailComponent,
        title:'Detalhes da Licitação - Sistema de Licitações'
      },
      {
        path:'tenders/:id/success',
        component:TenderSuccessComponent,
        title:'Licitação Processada - Sistema de Licitações'
      },
      {
        path:'vehicles',
        component:VehiclesListComponent,
        title:'Veículos - Sistema de Licitações'
      },
      {
        path:'vehicles/:id',
        component:VehicleDetailComponent,
        title:'Detalhes do Veículo - Sistema de Licitações'
      },
      {
        path:'reports',
        component:ReportsComponent,
        title:'Relatórios - Sistema de Licitações'
      },
      {
        path:'settings',
        component:SettingsComponent,
        title:'Configurações - Sistema de Licitações'
      },
      {
        path:'profile',
        component:ProfileComponent,
        title:'Perfil - Sistema de Licitações'
      }
    ]
  },
  // auth pages
  {
    path:'login',
    component:SignInComponent,
    title:'Login - Sistema de Licitações'
  },
  {
    path:'signin',
    component:SignInComponent,
    title:'Login - Sistema de Licitações'
  },
  {
    path:'signup',
    component:SignUpComponent,
    title:'Cadastro - Sistema de Licitações'
  },
  // error pages
  {
    path:'**',
    redirectTo: '/dashboard'
  },
];