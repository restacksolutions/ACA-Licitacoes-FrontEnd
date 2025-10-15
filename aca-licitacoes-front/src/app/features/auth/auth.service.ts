import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { TokenService } from '../../core/services/token.service';
import { CompanyService } from '../../core/services/company.service';
import { CompanyApiService } from '../company/company-api.service';
import { switchMap, tap, map } from 'rxjs/operators';

interface LoginReq { email: string; password: string; }
interface LoginRes { accessToken: string; }

interface RegisterBody {
  email: string;
  password: string;
  fullName: string;
  companyName: string;
  cnpj: string;
}
interface RegisterRes { id?: string; email: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private token = inject(TokenService);
  private companyStore = inject(CompanyService);
  private companyApi = inject(CompanyApiService);

  login(data: LoginReq) {
    return this.http.post<LoginRes>(`${environment.apiBaseUrl}/auth/login`, data).pipe(
      tap(res => this.token.set(res.accessToken)),                // 1) salva o token
      switchMap(() => this.companyApi.getMyCompanyIdFromList('/companies')), // 2) busca companies[]
      tap(companyId => {
        if (companyId) this.companyStore.set(companyId);
        else console.warn('[AuthService] Nenhuma company encontrada em /companies');
      }),
      map(() => void 0)
    );
  }

  register(body: RegisterBody) {
    return this.http.post<RegisterRes>(`${environment.apiBaseUrl}/auth/register`, body);
  }

  setToken(token: string){ this.token.set(token); }
  logout(){ this.token.clear(); this.companyStore.clear(); }
  isLogged(){ return !!this.token.get(); }
}
