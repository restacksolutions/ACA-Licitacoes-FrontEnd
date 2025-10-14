import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule],
  template: `
    <div class="p-6 space-y-3">
      <h1 class="text-2xl font-bold">VV Licitações</h1>
      <div class="flex gap-2">
        <input class="border rounded px-2 py-1" placeholder="CompanyId" #c>
        <button class="border rounded px-3 py-1" (click)="setCompany(c.value)">Salvar Empresa</button>
        <button class="border rounded px-3 py-1" (click)="ping()">Ping</button>
      </div>
      <pre class="text-sm text-gray-700 whitespace-pre-wrap">{{ result }}</pre>
    </div>
  `
})
export class HomeComponent {
  private http = inject(HttpClient);
  result = '';

  setCompany(v: string){
    localStorage.setItem('companyId', v);
    this.result = `companyId salvo: ${v}`;
  }

  ping(){
    this.http.get(`${environment.apiBaseUrl}/health`).subscribe({
      next: (r) => this.result = `OK: ${JSON.stringify(r)}`,
      error: (e) => this.result = `ERRO: ${e?.status} ${e?.message || ''}`
    });
  }
}
