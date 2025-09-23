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
        title: 'Conta criada com sucesso!',
        text: 'Sua conta foi criada. Agora você pode fazer login.',
        showConfirmButton: true
      });

      // Removido redirecionamento automático
    } catch (e: any) {
      console.error('[SignUp] erro:', e);
      await Swal.fire({ icon: 'error', title: 'Falha no cadastro', text: e?.message || 'Tente novamente.' });
    } finally {
      this.loading = false;
    }
  }

  onSignIn() { this.router.navigate(['/login']); }

}