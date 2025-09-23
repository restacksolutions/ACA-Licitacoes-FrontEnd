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

    try {
      const ok = await firstValueFrom(this.auth.login(this.email, this.password));
      console.log('[SignIn] result:', ok);

      if (ok) {
        await Swal.fire({ 
          icon: 'success', 
          title: 'Login realizado!', 
          text: 'Você foi autenticado com sucesso.',
          showConfirmButton: true
        });
        // Removido redirecionamento automático
      } else {
        const msg = this.auth.getLastError() || 'E-mail ou senha incorretos.';
        await Swal.fire({ icon: 'error', title: 'Não foi possível entrar', text: msg });
      }
    } catch (e: any) {
      console.error('[SignIn] erro:', e);
      await Swal.fire({ icon: 'error', title: 'Erro no login', text: 'Tente novamente.' });
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

}