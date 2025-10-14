import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-auth-header',
  imports: [CommonModule, RouterLink],
  templateUrl: './auth-header.component.html',
  styleUrls: [],
})
export class AuthHeaderComponent {
  private router = inject(Router);

  /** opcional: forceMode = 'login' | 'register' para forçar estado via input */
  forceMode = input<'login' | 'register' | null>(null);

  isLogin = computed(() => {
    if (this.forceMode()) return this.forceMode() === 'login';
    const url = this.router.url;
    return url.includes('/login');
  });
}
