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
    console.log('[SignUp] ===== INICIANDO SUBMIT =====');
    console.log('👤 Nome:', this.name);
    console.log('📧 Email:', this.email);
    console.log('🔒 Password:', this.password ? '***' : 'vazio');
    console.log('🏢 Empresa:', this.companyName);
    
    if (!this.name || !this.email || !this.password || !this.confirmPassword || !this.companyName) {
      console.log('[SignUp] Campos obrigatórios não preenchidos');
      await Swal.fire({ 
        icon: 'warning', 
        title: 'Campos obrigatórios', 
        text: 'Preencha todos os campos obrigatórios.' 
      });
      return;
    }
    
    if (this.password !== this.confirmPassword) {
      console.log('[SignUp] Senhas não coincidem');
      await Swal.fire({ 
        icon: 'error', 
        title: 'Senhas diferentes', 
        text: 'As senhas não coincidem.' 
      });
      return;
    }
    
    if (this.password.length < 6) {
      console.log('[SignUp] Senha muito fraca');
      await Swal.fire({ 
        icon: 'error', 
        title: 'Senha fraca', 
        text: 'Use pelo menos 6 caracteres.' 
      });
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      console.log('[SignUp] Chamando auth.signUpAndOnboard...');
      const ok = await this.auth.signUpAndOnboard({
        fullName: this.name,
        email: this.email,
        password: this.password,
        companyName: this.companyName,
        cnpj: this.cnpj || undefined,
        phone: this.phone || undefined,
        address: this.address || undefined,
      });
      
      console.log('[SignUp] ===== RESULTADO DO CADASTRO =====');
      console.log('✅ Sucesso:', ok);

      if (ok) {
        console.log('[SignUp] Cadastro bem-sucedido!');
        console.log('[SignUp] Verificando se usuário está logado:', this.auth.isLoggedIn());
        console.log('[SignUp] Dados do usuário:', this.auth.getCurrentUser());
        
        await Swal.fire({
          icon: 'success',
          title: 'Conta criada com sucesso!',
          text: 'Sua conta foi criada e você foi automaticamente logado.',
          showConfirmButton: true
        });
        
        // Redirecionar para dashboard após cadastro bem-sucedido (usuário já está logado)
        console.log('[SignUp] Redirecionando para dashboard...');
        this.router.navigate(['/dashboard']);
      } else {
        const msg = this.auth.getLastError() || 'Erro ao criar conta.';
        console.log('[SignUp] Cadastro falhou:', msg);
        this.error = msg;
        await Swal.fire({ 
          icon: 'error', 
          title: 'Falha no cadastro', 
          text: msg 
        });
      }
    } catch (e: any) {
      console.error('[SignUp] ===== ERRO NO SUBMIT =====');
      console.error('🚨 Erro:', e);
      console.error('📝 Mensagem:', e.message);
      
      const errorMsg = e?.message || 'Erro inesperado. Tente novamente.';
      this.error = errorMsg;
      await Swal.fire({ 
        icon: 'error', 
        title: 'Falha no cadastro', 
        text: errorMsg 
      });
    } finally {
      this.loading = false;
      console.log('[SignUp] ===== SUBMIT FINALIZADO =====');
    }
  }

  onSignIn() { this.router.navigate(['/login']); }

}