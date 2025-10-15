import { Injectable } from '@angular/core';
const KEY = 'companyId';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  get() { return localStorage.getItem(KEY) || ''; }
  set(v: string) { v?.trim() && localStorage.setItem(KEY, v.trim()); }
  clear() { localStorage.removeItem(KEY); }
}
