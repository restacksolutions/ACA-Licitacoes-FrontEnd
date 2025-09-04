import { Routes } from '@angular/router';
import { EcommerceComponent } from './pages/dashboard/ecommerce/ecommerce.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { FormElementsComponent } from './pages/forms/form-elements/form-elements.component';
import { BasicTablesComponent } from './pages/tables/basic-tables/basic-tables.component';
import { BlankComponent } from './pages/blank/blank.component';
import { NotFoundComponent } from './pages/other-page/not-found/not-found.component';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';
import { InvoicesComponent } from './pages/invoices/invoices.component';
import { LineChartComponent } from './pages/charts/line-chart/line-chart.component';
import { BarChartComponent } from './pages/charts/bar-chart/bar-chart.component';
import { AlertsComponent } from './pages/ui-elements/alerts/alerts.component';
import { AvatarElementComponent } from './pages/ui-elements/avatar-element/avatar-element.component';
import { BadgesComponent } from './pages/ui-elements/badges/badges.component';
import { ButtonsComponent } from './pages/ui-elements/buttons/buttons.component';
import { ImagesComponent } from './pages/ui-elements/images/images.component';
import { VideosComponent } from './pages/ui-elements/videos/videos.component';
import { SignInComponent } from './pages/auth-pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/auth-pages/sign-up/sign-up.component';
import { CalenderComponent } from './pages/calender/calender.component';
import { TendersListComponent } from './pages/tenders/tenders-list/tenders-list.component';
import { TenderDetailComponent } from './pages/tenders/tender-detail/tender-detail.component';
import { TenderNewComponent } from './pages/tenders/tender-new/tender-new.component';
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
        component:TenderNewComponent,
        title:'Nova Licitação - Sistema de Licitações'
      },
      {
        path:'tenders/:id',
        component:TenderDetailComponent,
        title:'Detalhes da Licitação - Sistema de Licitações'
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
      },
      // Rotas antigas mantidas para compatibilidade
      {
        path:'form-elements',
        component:FormElementsComponent,
        title:'Form Elements - Sistema de Licitações'
      },
      {
        path:'basic-tables',
        component:BasicTablesComponent,
        title:'Tabelas - Sistema de Licitações'
      },
      {
        path:'blank',
        component:BlankComponent,
        title:'Página em Branco - Sistema de Licitações'
      },
      {
        path:'invoice',
        component:InvoicesComponent,
        title:'Faturas - Sistema de Licitações'
      },
      {
        path:'line-chart',
        component:LineChartComponent,
        title:'Gráfico de Linha - Sistema de Licitações'
      },
      {
        path:'bar-chart',
        component:BarChartComponent,
        title:'Gráfico de Barras - Sistema de Licitações'
      },
      {
        path:'alerts',
        component:AlertsComponent,
        title:'Alertas - Sistema de Licitações'
      },
      {
        path:'avatars',
        component:AvatarElementComponent,
        title:'Avatares - Sistema de Licitações'
      },
      {
        path:'badge',
        component:BadgesComponent,
        title:'Badges - Sistema de Licitações'
      },
      {
        path:'buttons',
        component:ButtonsComponent,
        title:'Botões - Sistema de Licitações'
      },
      {
        path:'images',
        component:ImagesComponent,
        title:'Imagens - Sistema de Licitações'
      },
      {
        path:'videos',
        component:VideosComponent,
        title:'Vídeos - Sistema de Licitações'
      },
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
    component:NotFoundComponent,
    title:'Página não encontrada - Sistema de Licitações'
  },
];
