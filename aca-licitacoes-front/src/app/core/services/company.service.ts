import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

const KEY = 'companyId';

export interface Company {
  id: string;
  name: string;
  cnpj?: string | null;
  phone?: string | null;
  address?: string | null;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private http = inject(HttpClient);
  private apiBase = environment.apiBaseUrl;
  
  // Signal reativo para o companyId
  private _companyId = signal<string>(localStorage.getItem(KEY) || '');
  
  constructor() {
    // Observar mudanças no localStorage (para sincronizar entre abas)
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === KEY) {
          this._companyId.set(e.newValue || '');
        }
      });
    }
  }

  get() { 
    const current = localStorage.getItem(KEY) || '';
    if (current !== this._companyId()) {
      this._companyId.set(current);
    }
    return current;
  }
  
  set(v: string) { 
    const value = v?.trim() || '';
    if (value) {
      localStorage.setItem(KEY, value);
      this._companyId.set(value);
    }
  }
  
  clear() { 
    localStorage.removeItem(KEY);
    this._companyId.set('');
  }
  
  // Signal reativo para observar mudanças
  companyId$ = this._companyId.asReadonly();

  // Busca o nome da empresa atual
  getCompanyName(companyId: string): Observable<string | null> {
    if (!companyId) {
      return new Observable(observer => {
        observer.next(null);
        observer.complete();
      });
    }
    return this.http.get<Company[]>(`${this.apiBase}/companies`).pipe(
      map(companies => {
        const company = companies.find(c => c.id === companyId);
        return company?.name || null;
      })
    );
  }
}
