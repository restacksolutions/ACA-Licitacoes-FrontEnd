import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Company {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  address: {
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  description: string;
  website: string;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  company: Company;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styles: ``
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  isEditing = false;
  loading = false;

  ngOnInit() {
    this.loadUserData();
  }

  private loadUserData() {
    // Mock user data
    this.user = {
      id: '1',
      name: 'João Silva',
      email: 'joao@empresa.com',
      role: 'Administrador',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      company: {
        id: '1',
        name: 'Empresa de Licitações LTDA',
        cnpj: '12.345.678/0001-90',
        email: 'contato@empresa.com',
        phone: '(41) 99999-9999',
        address: {
          street: 'Rua das Flores',
          number: '123',
          complement: 'Sala 456',
          neighborhood: 'Centro',
          city: 'Curitiba',
          state: 'PR',
          zipCode: '80000-000'
        },
        description: 'Empresa especializada em participação de licitações públicas',
        website: 'https://www.empresa.com.br',
        createdAt: '2024-01-01'
      }
    };
  }

  onEdit() {
    this.isEditing = true;
  }

  onSave() {
    this.loading = true;
    // Simulate save
    setTimeout(() => {
      this.loading = false;
      this.isEditing = false;
    }, 1000);
  }

  onCancel() {
    this.isEditing = false;
    this.loadUserData(); // Reset to original data
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }
}
