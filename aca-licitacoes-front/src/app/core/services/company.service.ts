import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private k = 'companyId';
  get() { return localStorage.getItem(this.k) || ''; }
  set(v: string) { localStorage.setItem(this.k, v); }
}
