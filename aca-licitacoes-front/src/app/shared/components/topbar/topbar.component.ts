import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CompanyService } from '../../../core/services/company.service';
import { AuthService } from '../../../features/auth/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';

// Interface para informações do usuário
interface UserInfo {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  standalone: true,
  selector: 'app-topbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './topbar.component.html',
  styleUrls: [],
})
export class TopbarComponent {
  private company = inject(CompanyService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient);

  companyId = signal(this.company.get());
  
  // Informações do usuário
  userInfo = signal<UserInfo | null>(null);
  isLoading = signal(false);

  ngOnInit() {
    this.onSaveClick(new Event('init'));
  }

  saveCompany(v: string) {
    const id = (v || '').trim();
    this.company.set(id);
    this.companyId.set(this.company.get()); // reflete o valor persistido
  }

  onEnterKey(event: Event) {
    const target = event.target as HTMLInputElement;
    this.saveCompany(target.value);
  }

  // Método para buscar informações do usuário
  onSaveClick(event: Event) {
    // Previne o comportamento padrão do botão
    event.preventDefault();
    
    // Mostra loading
    this.isLoading.set(true);
    
    // Busca informações do usuário na rota /auth/me
    this.http.post<UserInfo>(`${environment.apiBaseUrl}/auth/me`, {}).subscribe({
      next: (userInfo) => {
        // Sucesso - armazena informações do usuário
        this.userInfo.set(userInfo);
        this.isLoading.set(false);
        
        // Mostra alerta de sucesso com informações do usuário
        //Swal.fire({
        //  icon: 'success',
        //  title: 'Informações do Usuário',
        //  html: `
        //    <div class="text-left">
        //      <p><strong>Nome:</strong> ${userInfo.fullName}</p>
        //      <p><strong>Email:</strong> ${userInfo.email}</p>
        //      <p><strong>ID:</strong> ${userInfo.id}</p>
        //      <p><strong>Criado em:</strong> ${new Date(userInfo.createdAt).toLocaleDateString('pt-BR')}</p>
        //    </div>
        //  `,
        //  confirmButtonText: 'OK'
        //});
      },
      error: (error) => {
        this.isLoading.set(false);
        
        // Verifica se é erro 401 (não autorizado)
        if (error.status === 401) {
          // Sessão expirada - mostra alerta e limpa localStorage
          Swal.fire({
            icon: 'warning',
            title: 'Sessão Expirada',
            text: 'Sua sessão expirou. Você será redirecionado para a tela de login.',
            confirmButtonText: 'OK',
            allowOutsideClick: false,
            allowEscapeKey: false
          }).then(() => {
            // Limpa o localStorage
            localStorage.clear();
            
            // Limpa os serviços de autenticação
            this.auth.logout();
            
            // Redireciona para login
            this.router.navigateByUrl('/login');
          });
        } else {
          // Outros erros - mostra alerta genérico
          console.error('Erro ao buscar informações do usuário:', error);
          Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: 'Ocorreu um erro ao buscar suas informações. Tente novamente.',
            confirmButtonText: 'OK'
          });
        }
      }
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
