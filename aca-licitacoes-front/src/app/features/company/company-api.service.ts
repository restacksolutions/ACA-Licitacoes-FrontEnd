import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface Company {
  id: string;
  name?: string;
  cnpj?: string;
  active?: boolean;
}

@Injectable({ providedIn: 'root' })
export class CompanyApiService {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl;

  /**
   * GET /companies -> Company[]
   * Regra: pega a primeira ativa; se não houver, pega a primeira da lista.
   * Retorna '' se array vier vazio.
   */
  getMyCompanyIdFromList(path: string = '/companies'): Observable<string> {
    return this.http.get<Company[]>(`${this.base}${path}`).pipe(
      map((arr) => {
        if (!Array.isArray(arr) || arr.length === 0) {
          console.warn('[CompanyApi] /companies retornou vazio:', arr);
          return '';
        }
        const active = arr.find(c => c.active);
        return (active?.id || arr[0].id || '').toString();
      })
    );
  }
}
