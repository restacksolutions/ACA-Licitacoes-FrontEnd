import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { TokenService } from '../../core/services/token.service';

interface LoginReq { email: string; password: string; }
interface LoginRes { accessToken: string; }

// Ajuste os nomes abaixo se o seu back usar chaves diferentes
interface RegisterBody {
  email: string;
  password: string;
  fullName: string;
  companyName: string;
  cnpj: string; // 14 dígitos, sem máscara
}

interface RegisterRes {
  id?: string; email: string; // ajuste se seu back retorna algo a mais
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private token = inject(TokenService);

  login(data: LoginReq) {
    return this.http.post<LoginRes>(`${environment.apiBaseUrl}/auth/login`, data);
  }

  // Se o seu back espera um formato diferente (ex.: {user:{}, company:{}}),
  // mapeie aqui antes de enviar
  register(body: RegisterBody) {
    return this.http.post<RegisterRes>(`${environment.apiBaseUrl}/auth/register`, body);
  }

  setToken(token: string){ this.token.set(token); }
  logout(){ this.token.clear(); }
  isLogged(){ return !!this.token.get(); }
}
