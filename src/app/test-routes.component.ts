import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from './core/services/api.service';

@Component({
  selector: 'app-test-routes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 p-8">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">🧪 Teste de Rotas e API</h1>
        
        <!-- Status do Sistema -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <h2 class="text-xl font-semibold mb-4">📊 Status do Sistema</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 border rounded-lg">
              <h3 class="font-medium text-gray-700">Frontend Angular</h3>
              <p class="text-green-600 font-semibold">✅ Funcionando (porta 4200)</p>
            </div>
            <div class="p-4 border rounded-lg">
              <h3 class="font-medium text-gray-700">Backend API</h3>
              <p [class]="backendStatus === 'ok' ? 'text-green-600' : 'text-red-600'" class="font-semibold">
                {{ backendStatus === 'ok' ? '✅ Funcionando' : '❌ Erro' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Testes de API -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <h2 class="text-xl font-semibold mb-4">🔌 Testes de API</h2>
          <div class="space-y-4">
            <button 
              (click)="testHealthCheck()" 
              [disabled]="loading"
              class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 mr-4"
            >
              {{ loading ? 'Testando...' : 'Testar Health Check' }}
            </button>
            
            <button 
              (click)="testCors()" 
              [disabled]="loading"
              class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 mr-4"
            >
              {{ loading ? 'Testando...' : 'Testar CORS' }}
            </button>

            <button 
              (click)="testLogin()" 
              [disabled]="loading"
              class="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
            >
              {{ loading ? 'Testando...' : 'Testar Login' }}
            </button>
          </div>

          <div *ngIf="testResult" class="mt-4 p-4 bg-gray-100 rounded">
            <h3 class="font-medium mb-2">Resultado do Teste:</h3>
            <pre class="text-sm overflow-auto">{{ testResult | json }}</pre>
          </div>

          <div *ngIf="testError" class="mt-4 p-4 bg-red-100 border border-red-300 rounded">
            <h3 class="font-medium text-red-800 mb-2">Erro:</h3>
            <p class="text-red-700">{{ testError }}</p>
          </div>
        </div>

        <!-- Navegação de Teste -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <h2 class="text-xl font-semibold mb-4">🧭 Teste de Navegação</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              (click)="navigateTo('/login')" 
              class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Login
            </button>
            <button 
              (click)="navigateTo('/signup')" 
              class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cadastro
            </button>
            <button 
              (click)="navigateTo('/dashboard')" 
              class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Dashboard
            </button>
            <button 
              (click)="navigateTo('/company')" 
              class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Empresa
            </button>
          </div>
        </div>

        <!-- Informações de Debug -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">🐛 Informações de Debug</h2>
          <div class="space-y-2 text-sm">
            <p><strong>URL da API:</strong> {{ apiUrl }}</p>
            <p><strong>URL Atual:</strong> {{ currentUrl }}</p>
            <p><strong>Timestamp:</strong> {{ timestamp }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class TestRoutesComponent {
  loading = false;
  backendStatus = 'unknown';
  testResult: any = null;
  testError: string | null = null;
  apiUrl = '';
  currentUrl = '';
  timestamp = '';

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
    this.apiUrl = this.apiService['apiBaseUrl'] || 'Não definido';
    this.currentUrl = window.location.href;
    this.timestamp = new Date().toISOString();
    
    // Testar health check automaticamente
    this.testHealthCheck();
  }

  async testHealthCheck() {
    this.loading = true;
    this.testError = null;
    this.testResult = null;

    try {
      const result = await this.apiService.healthCheck().toPromise();
      this.testResult = result;
      this.backendStatus = 'ok';
    } catch (error: any) {
      this.testError = error.message || 'Erro desconhecido';
      this.backendStatus = 'error';
    } finally {
      this.loading = false;
    }
  }

  async testCors() {
    this.loading = true;
    this.testError = null;
    this.testResult = null;

    try {
      // Teste usando URL relativa (com proxy)
      const response = await fetch('/v1/auth/login', {
        method: 'OPTIONS',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      this.testResult = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      };
    } catch (error: any) {
      this.testError = error.message || 'Erro de CORS';
    } finally {
      this.loading = false;
    }
  }

  async testLogin() {
    this.loading = true;
    this.testError = null;
    this.testResult = null;

    try {
      const result = await this.apiService.login({
        email: 'test@test.com',
        password: '123456'
      }).toPromise();
      
      this.testResult = result;
    } catch (error: any) {
      this.testError = error.message || 'Erro no login';
    } finally {
      this.loading = false;
    }
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
