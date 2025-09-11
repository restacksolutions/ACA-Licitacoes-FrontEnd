import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sign-up.component.html',
  styles: ``
})
export class SignUpComponent implements OnInit {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  companyName = '';
  cnpj = '';
  phone = '';
  address = '';
  loading = false;
  error = '';
  info = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('[SignUpComponent] init');
    if (this.authService.isLoggedIn()) {
      console.log('[SignUpComponent] já logado → /dashboard');
      this.router.navigate(['/dashboard']);
    }
  }

  async onSubmit() {
    console.log('[SignUpComponent] submit');
    if (!this.name || !this.email || !this.password || !this.confirmPassword || !this.companyName) {
      this.error = 'Por favor, preencha todos os campos obrigatórios';
      await Swal.fire({ icon: 'warning', title: 'Campos obrigatórios', text: this.error });
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.error = 'As senhas não coincidem';
      await Swal.fire({ icon: 'error', title: 'Senha', text: this.error });
      return;
    }
    if (this.password.length < 6) {
      this.error = 'A senha deve ter pelo menos 6 caracteres';
      await Swal.fire({ icon: 'error', title: 'Senha fraca', text: this.error });
      return;
    }

    this.loading = true;
    this.error = '';
    this.info = '';

    // Fallback: se algo travar no fluxo, força /login após 3s
    const navFallback = setTimeout(() => {
      console.warn('[SignUpComponent] fallback: forçando /login após 3s');
      this.forceLoginNav();
    }, 3000);

    try {
      console.log('[SignUpComponent] Starting signUpAndOnboard...');
      const ok = await this.authService.signUpAndOnboard({
        fullName: this.name,
        email: this.email,
        password: this.password,
        companyName: this.companyName,
        cnpj: this.cnpj || undefined,
        phone: this.phone || undefined,
        address: this.address || undefined,
      });
      console.log('[SignUpComponent] signUpAndOnboard result:', ok);

      const msg = this.authService.getLastError?.() || 'Conta criada com sucesso! Faça login para continuar.';
      this.info = msg;

      await Swal.fire({
        icon: 'success',
        title: 'Conta criada',
        text: msg,
        timer: 1600,
        showConfirmButton: false
      });

      // Redireciona para /login (o service também tenta, mas garantimos aqui)
      await this.forceLoginNav();
    } catch (e: any) {
      console.error('[SignUpComponent] signUpAndOnboard failed:', e);
      this.error = e?.message || 'Erro ao criar conta. Tente novamente.';
      await Swal.fire({ icon: 'error', title: 'Falha no cadastro', text: this.error });
    } finally {
      clearTimeout(navFallback);
      this.loading = false;
    }
  }

  onSignIn() {
    this.router.navigate(['/login']);
  }

  /** Navegação robusta para /login */
  private async forceLoginNav() {
    try {
      console.log('[SignUpComponent] navigating → /login …');
      const ok = await this.router.navigate(['/login'], { replaceUrl: true });
      console.log('[SignUpComponent] navigate /login →', ok);
      if (ok) return;

      const ok2 = await this.router.navigateByUrl('/login', { replaceUrl: true });
      console.log('[SignUpComponent] navigateByUrl /login →', ok2);
      if (ok2) return;

      console.warn('[SignUpComponent] SPA navigation falhou — hard redirect /login');
      window.location.assign('/login');
    } catch (err) {
      console.error('[SignUpComponent] erro ao navegar para /login:', err);
      window.location.assign('/login');
    }
  }
}
