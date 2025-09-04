import { Component } from '@angular/core';
import { DashboardComponent } from '../dashboard.component';

@Component({
  selector: 'app-ecommerce',
  imports: [DashboardComponent],
  template: '<app-dashboard></app-dashboard>',
})
export class EcommerceComponent {}
