import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule],
  template: `
  <section class="space-y-4">
    <h1 class="text-2xl font-semibold tracking-tight">Bem-vindo(a) 👋</h1>
    <p class="text-neutral-600">Este é o painel inicial. Em seguida vamos criar as telas de Licitações.</p>
  </section>
  `
})
export class HomeComponent {

}
