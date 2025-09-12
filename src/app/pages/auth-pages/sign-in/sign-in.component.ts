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

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    console.log('[SignIn] init');
    if (this.auth.isLoggedIn()) this.router.navigate(['/dashboard']);
  }

  async onSubmit() {
    if (!this.email || !this.password) {
      await Swal.fire({ icon: 'warning', title: 'Campos obrigatórios', text: 'Informe e-mail e senha.' });
      return;
    }

    this.loading = true;

    // fallback: força /dashboard em 2.5s se algo travar
    const fallback = setTimeout(() => {
      console.warn('[SignIn] fallback → /dashboard');
      this.forceDashboard();
    }, 2500);

    try {
      const ok = await firstValueFrom(this.auth.login(this.email, this.password));
      console.log('[SignIn] result:', ok);

      if (ok) {
        await Swal.fire({ icon: 'success', title: 'Login realizado!', timer: 1000, showConfirmButton: false });
        await this.forceDashboard();
      } else {
        const msg = this.auth.getLastError() || 'E-mail ou senha incorretos.';
        await Swal.fire({ icon: 'error', title: 'Não foi possível entrar', text: msg });
        clearTimeout(fallback);
      }
    } catch (e: any) {
      console.error('[SignIn] erro:', e);
      await Swal.fire({ icon: 'error', title: 'Erro no login', text: 'Tente novamente.' });
      clearTimeout(fallback);
    } finally {
      this.loading = false;
    }
  }

  onSignUp() { this.router.navigate(['/signup']); }

  onForgotPassword() {
    if (!this.email) {
      Swal.fire({
        icon: 'warning',
        title: 'E-mail necessário',
        text: 'Digite seu e-mail para redefinir a senha.'
      });
      return;
    }

    this.auth.resetPasswordForEmail(this.email).then(() => {
      Swal.fire({
        icon: 'success',
        title: 'E-mail enviado',
        text: 'Verifique sua caixa de entrada para redefinir a senha.'
      });
    }).catch((error) => {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Não foi possível enviar o e-mail. Tente novamente.'
      });
    });
  }

  onResendVerification() {
    if (!this.email) {
      Swal.fire({
        icon: 'warning',
        title: 'E-mail necessário',
        text: 'Digite seu e-mail para reenviar a verificação.'
      });
      return;
    }

    this.auth.resendEmailVerification(this.email).then(() => {
      Swal.fire({
        icon: 'success',
        title: 'E-mail enviado',
        text: 'Verifique sua caixa de entrada para confirmar sua conta.'
      });
    }).catch((error) => {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Não foi possível reenviar o e-mail. Tente novamente.'
      });
    });
  }

  private async forceDashboard() {
    try {
      const ok = await this.router.navigate(['/dashboard'], { replaceUrl: true });
      if (ok) return;
      const ok2 = await this.router.navigateByUrl('/dashboard', { replaceUrl: true });
      if (ok2) return;
      window.location.assign('/dashboard');
    } catch {
      window.location.assign('/dashboard');
    }
  }
}