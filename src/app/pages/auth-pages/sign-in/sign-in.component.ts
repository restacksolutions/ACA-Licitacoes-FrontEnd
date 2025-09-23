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
    console.log('[SignIn] ===== INICIANDO SUBMIT =====');
    console.log('📧 Email:', this.email);
    console.log('🔒 Password:', this.password ? '***' : 'vazio');
    
    if (!this.email || !this.password) {
      console.log('[SignIn] Campos obrigatórios não preenchidos');
      await Swal.fire({ 
        icon: 'warning', 
        title: 'Campos obrigatórios', 
        text: 'Informe e-mail e senha.' 
      });
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      console.log('[SignIn] Chamando auth.login...');
      const ok = await firstValueFrom(this.auth.login(this.email, this.password));
      console.log('[SignIn] ===== RESULTADO DO LOGIN =====');
      console.log('✅ Sucesso:', ok);

      if (ok) {
        console.log('[SignIn] Login bem-sucedido!');
        console.log('[SignIn] Verificando se usuário está logado:', this.auth.isLoggedIn());
        console.log('[SignIn] Dados do usuário:', this.auth.getCurrentUser());
        
        await Swal.fire({ 
          icon: 'success', 
          title: 'Login realizado!', 
          text: 'Você foi autenticado com sucesso.',
          showConfirmButton: true
        });
        
        // Redirecionar para dashboard após login bem-sucedido
        console.log('[SignIn] Redirecionando para dashboard...');
        this.router.navigate(['/dashboard']);
      } else {
        const msg = this.auth.getLastError() || 'E-mail ou senha incorretos.';
        console.log('[SignIn] Login falhou:', msg);
        this.error = msg;
        await Swal.fire({ 
          icon: 'error', 
          title: 'Não foi possível entrar', 
          text: msg 
        });
      }
    } catch (e: any) {
      console.error('[SignIn] ===== ERRO NO SUBMIT =====');
      console.error('🚨 Erro:', e);
      console.error('📝 Mensagem:', e.message);
      
      const errorMsg = e.message || 'Erro inesperado. Tente novamente.';
      this.error = errorMsg;
      await Swal.fire({ 
        icon: 'error', 
        title: 'Erro no login', 
        text: errorMsg 
      });
    } finally {
      this.loading = false;
      console.log('[SignIn] ===== SUBMIT FINALIZADO =====');
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