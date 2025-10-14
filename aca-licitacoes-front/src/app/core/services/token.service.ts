import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private k = 'accessToken';
  get() { return localStorage.getItem(this.k) || ''; }
  set(v: string) { localStorage.setItem(this.k, v); }
  clear() { localStorage.removeItem(this.k); }
}
