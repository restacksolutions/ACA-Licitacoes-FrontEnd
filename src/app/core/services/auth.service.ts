import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'ANALYST' | 'TECH';
  company_id: string;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Dados fictícios de usuários
  private mockUsers: User[] = [
    {
      id: '1',
      email: 'admin@sistema.com',
      name: 'Administrador',
      role: 'ADMIN',
      company_id: '1',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      email: 'analista@sistema.com',
      name: 'Analista',
      role: 'ANALYST',
      company_id: '1',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      email: 'tecnico@sistema.com',
      name: 'Técnico',
      role: 'TECH',
      company_id: '1',
      created_at: '2024-01-01T00:00:00Z'
    }
  ];

  constructor(private router: Router) {
    // Verificar se há usuário logado no localStorage
    const savedUser = localStorage.getItem('current_user');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  login(email: string, password: string): Observable<boolean> {
    // Simular delay da API
    return new Observable<boolean>(observer => {
      setTimeout(() => {
        const user = this.mockUsers.find(u => u.email === email);
        if (user && password === 'admin123') {
          const token = this.generateMockToken(user);
          localStorage.setItem('access_token', token);
          localStorage.setItem('current_user', JSON.stringify(user));
          this.currentUserSubject.next(user);
          
          observer.next(true);
          observer.complete();
        } else {
          observer.next(false);
          observer.complete();
        }
      }, 1000);
    });
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken() && !!this.currentUserSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private generateMockToken(user: User): string {
    // Simular um JWT simples
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      company_id: user.company_id,
      created_at: user.created_at,
      exp: Date.now() + 24 * 60 * 60 * 1000 // 24 horas
    }));
    const signature = btoa('mock-signature');
    return `${header}.${payload}.${signature}`;
  }
}