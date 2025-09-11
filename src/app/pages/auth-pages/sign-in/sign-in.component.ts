import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sign-in.component.html',
  styles: ``
})
export class SignInComponent implements OnInit {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('[SignIn] init');
    if (this.authService.isLoggedIn()) {
      console.log('[SignIn] já logado → /dashboard');
      this.router.navigate(['/dashboard']);
    }
  }

  async onSubmit() {
    if (!this.email || !this.password) {
      this.error = 'Por favor, preencha todos os campos';
      await Swal.fire({ icon: 'warning', title: 'Campos obrigatórios', text: this.error });
      return;
    }

    this.loading = true;
    this.error = '';

    // Fallback: se algo travar, tenta forçar /dashboard em 2,5s
    const navFallback = setTimeout(() => {
      console.warn('[SignIn] fallback: forçando /dashboard após 2.5s');
      this.forceDashboardNav();
    }, 2500);

    try {
      console.log('[SignIn] calling authService.login...');
      const ok = await firstValueFrom(this.authService.login(this.email, this.password));
      console.log('[SignIn] login result:', ok);

      if (ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Login realizado!',
          timer: 1100,
          showConfirmButton: false
        });
        await this.forceDashboardNav();
      } else {
        const msg = this.authService.getLastError?.() || 'Email ou senha incorretos';
        this.error = msg;
        await Swal.fire({
          icon: 'error',
          title: 'Não foi possível entrar',
          text: msg
        });
        clearTimeout(navFallback); // em erro, não tenta navegar
      }
    } catch (err: any) {
      console.error('[SignIn] login error:', err);
      this.error = 'Erro ao fazer login. Tente novamente.';
      await Swal.fire({ icon: 'error', title: 'Erro', text: this.error });
      clearTimeout(navFallback);
    } finally {
      this.loading = false;
    }
  }

  onSignUp() {
    this.router.navigate(['/signup']);
  }

  /** Navegação robusta para /dashboard */
  private async forceDashboardNav() {
    try {
      console.log('[SignIn] navigating → /dashboard …');
      const ok = await this.router.navigate(['/dashboard'], { replaceUrl: true });
      console.log('[SignIn] navigate /dashboard →', ok);
      if (ok) return;

      const ok2 = await this.router.navigateByUrl('/dashboard', { replaceUrl: true });
      console.log('[SignIn] navigateByUrl /dashboard →', ok2);
      if (ok2) return;

      console.warn('[SignIn] SPA navigation falhou — hard redirect /dashboard');
      window.location.assign('/dashboard');
    } catch (err) {
      console.error('[SignIn] erro ao navegar para /dashboard:', err);
      window.location.assign('/dashboard');
    }
  }
}
