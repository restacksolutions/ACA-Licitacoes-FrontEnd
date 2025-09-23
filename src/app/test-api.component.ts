import { Component } from '@angular/core';
import { ApiService } from './core/services/api.service';

@Component({
  selector: 'app-test-api',
  template: `
    <div style="padding: 20px;">
      <h2>Teste de API</h2>
      <button (click)="testHealthCheck()">Testar Health Check</button>
      <button (click)="testLogin()">Testar Login</button>
      <div *ngIf="result">
        <h3>Resultado:</h3>
        <pre>{{ result | json }}</pre>
      </div>
      <div *ngIf="error">
        <h3>Erro:</h3>
        <pre>{{ error }}</pre>
      </div>
    </div>
  `
})
export class TestApiComponent {
  result: any = null;
  error: string = '';

  constructor(private apiService: ApiService) {}

  testHealthCheck() {
    console.log('Testando health check...');
    this.apiService.healthCheck().subscribe({
      next: (response) => {
        console.log('Health check response:', response);
        this.result = response;
        this.error = '';
      },
      error: (error) => {
        console.error('Health check error:', error);
        this.error = error.message;
        this.result = null;
      }
    });
  }

  testLogin() {
    console.log('Testando login...');
    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    this.apiService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login response:', response);
        this.result = response;
        this.error = '';
      },
      error: (error) => {
        console.error('Login error:', error);
        this.error = error.message;
        this.result = null;
      }
    });
  }
}
