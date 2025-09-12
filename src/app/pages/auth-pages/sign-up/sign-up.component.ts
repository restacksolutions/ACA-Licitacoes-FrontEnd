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

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    console.log('[SignUp] init');
    if (this.auth.isLoggedIn()) this.router.navigate(['/dashboard']);
  }

  async onSubmit() {
    if (!this.name || !this.email || !this.password || !this.confirmPassword || !this.companyName) {
      await Swal.fire({ icon: 'warning', title: 'Campos obrigatórios', text: 'Preencha todos os campos.' });
      return;
    }
    if (this.password !== this.confirmPassword) {
      await Swal.fire({ icon: 'error', title: 'Senhas diferentes', text: 'As senhas não coincidem.' });
      return;
    }
    if (this.password.length < 6) {
      await Swal.fire({ icon: 'error', title: 'Senha fraca', text: 'Use pelo menos 6 caracteres.' });
      return;
    }

    this.loading = true;

    // fallback: força /login em 3s se algo travar
    const fallback = setTimeout(() => {
      console.warn('[SignUp] fallback → /login');
      this.forceLogin();
    }, 3000);

    try {
      const ok = await this.auth.signUpAndOnboard({
        fullName: this.name,
        email: this.email,
        password: this.password,
        companyName: this.companyName,
        cnpj: this.cnpj || undefined,
        phone: this.phone || undefined,
        address: this.address || undefined,
      });
      console.log('[SignUp] result:', ok);

      await Swal.fire({
        icon: 'success',
        title: 'Conta criada',
        text: this.auth.getLastError() || 'Faça login para continuar.',
        timer: 1500,
        showConfirmButton: false
      });

      await this.forceLogin();
    } catch (e: any) {
      console.error('[SignUp] erro:', e);
      await Swal.fire({ icon: 'error', title: 'Falha no cadastro', text: e?.message || 'Tente novamente.' });
    } finally {
      clearTimeout(fallback);
      this.loading = false;
    }
  }

  onSignIn() { this.router.navigate(['/login']); }

  private async forceLogin() {
    try {
      const ok = await this.router.navigate(['/login'], { replaceUrl: true });
      if (ok) return;
      const ok2 = await this.router.navigateByUrl('/login', { replaceUrl: true });
      if (ok2) return;
      window.location.assign('/login');
    } catch {
      window.location.assign('/login');
    }
  }
}