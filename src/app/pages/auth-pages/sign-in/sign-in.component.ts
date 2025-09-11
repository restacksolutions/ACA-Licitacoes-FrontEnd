import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service'; // <== caminho atualizado

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
    // Se já existe sessão válida, vai direto pro dashboard
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit() {
    if (!this.email || !this.password) {
      this.error = 'Por favor, preencha todos os campos';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (success) => {
        if (success) {
          this.router.navigate(['/dashboard']);
        } else {
          // Quando credenciais estão erradas ou o Supabase retornou erro genérico
          this.error = 'Email ou senha incorretos';
        }
        this.loading = false;
      },
      error: (err) => {
        // Em geral, o AuthService já converte erro em "false", então esse bloco raramente dispara.
        // Mantemos por segurança.
        this.error = 'Erro ao fazer login. Tente novamente.';
        this.loading = false;
        console.error('Login error:', err);
      }
    });
  }

  onSignUp() {
    this.router.navigate(['/signup']);
  }
}
