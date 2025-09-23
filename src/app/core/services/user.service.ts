import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
  memberships: Membership[];
}

export interface Membership {
  membershipId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  company: {
    id: string;
    name: string;
    cnpj: string;
    phone: string;
    address: string;
    logoPath?: string;
    letterheadPath?: string;
    active: boolean;
    createdAt: string;
    createdBy: string;
    creator: {
      id: string;
      fullName: string;
      email: string;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private apiService: ApiService) {}

  /**
   * Obtém o perfil completo do usuário autenticado com empresas e membros
   */
  getCurrentUserProfile(): Observable<UserProfile> {
    return this.apiService.getCurrentUser();
  }

  /**
   * Obtém informações básicas do usuário autenticado
   */
  getMe(): Observable<any> {
    return this.apiService.getMe();
  }

  /**
   * Obtém todas as empresas do usuário
   */
  getUserCompanies(): Observable<any[]> {
    return this.apiService.getCompanies();
  }

  /**
   * Obtém uma empresa específica do usuário
   */
  getCompany(companyId: string): Observable<any> {
    return this.apiService.getCompany(companyId);
  }

  /**
   * Cria uma nova empresa para o usuário
   */
  createCompany(companyData: {
    name: string;
    cnpj: string;
    phone: string;
    address: string;
    logoPath?: string;
    letterheadPath?: string;
    active?: boolean;
  }): Observable<any> {
    return this.apiService.createCompany(companyData);
  }

  /**
   * Atualiza uma empresa do usuário
   */
  updateCompany(companyId: string, companyData: {
    name?: string;
    phone?: string;
    address?: string;
    logoPath?: string;
    letterheadPath?: string;
    active?: boolean;
  }): Observable<any> {
    return this.apiService.updateCompany(companyId, companyData);
  }

  /**
   * Obtém membros de uma empresa
   */
  getCompanyMembers(companyId: string): Observable<any[]> {
    return this.apiService.getCompanyMembers(companyId);
  }

  /**
   * Convida um novo membro para a empresa
   */
  inviteMember(companyId: string, email: string, role: 'admin' | 'member'): Observable<any> {
    return this.apiService.inviteMember(companyId, { email, role });
  }

  /**
   * Atualiza o role de um membro
   */
  updateMemberRole(companyId: string, memberId: string, role: 'owner' | 'admin' | 'member'): Observable<any> {
    return this.apiService.updateMember(companyId, memberId, { role });
  }

  /**
   * Remove um membro da empresa
   */
  removeMember(companyId: string, memberId: string): Observable<any> {
    return this.apiService.removeMember(companyId, memberId);
  }
}
