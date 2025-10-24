import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export type Company = {
  id: string; name: string; cnpj?: string | null; phone?: string | null; address?: string | null; active: boolean;
  createdAt?: string; updatedAt?: string;
};
export type Employee = {
  id: string; fullName: string; email: string; role?: string | null; active: boolean; createdAt?: string;
};
export type CompanyDoc = {
  id: string;
  clientName: string;  // Nome do cliente/empresa
  docType: string;     // Tipo do documento
  issueDate?: string;  // Data de emissão
  expiresAt?: string;  // Data de vencimento
  notes?: string;      // Observações
  companyId: string;   // ID da empresa
  createdAt?: string;  // Data de criação
  updatedAt?: string;  // Data de atualização
  // Campos de arquivo (após upload)
  fileName?: string;   // Nome do arquivo
  fileMime?: string;  // Tipo MIME
  fileSize?: number;  // Tamanho em bytes
  fileSha256?: string; // Hash SHA256
  version?: number;   // Versão do arquivo
};

@Injectable({ providedIn: 'root' })
export class CompanyFeatureService {
  private http = inject(HttpClient);
  private API = environment.apiBaseUrl;

  // Empresa
  getCompany(companyId: string) {
    return this.http.get<Company[]>(`${this.API}/companies`);
  }
  updateCompany(companyId: string, dto: Partial<Company>) {
    return this.http.patch<Company>(`${this.API}/companies/${companyId}`, dto);
  }

  // Funcionários
  listEmployees(companyId: string) {
    return this.http.get<Employee[]>(`${this.API}/companies/${companyId}/members`);
  }
  createEmployee(companyId: string, dto: Partial<Employee>) {
    return this.http.post<Employee>(`${this.API}/companies/${companyId}/members`, dto);
  }
  updateEmployee(companyId: string, employeeId: string, dto: Partial<Employee>) {
    return this.http.patch<Employee>(`${this.API}/companies/${companyId}/members/${employeeId}`, dto);
  }
  deleteEmployee(companyId: string, employeeId: string) {
    return this.http.delete<void>(`${this.API}/companies/${companyId}/members/${employeeId}`);
  }

  // Documentos - Métodos para gerenciar documentos da empresa
  // Lista todos os documentos da empresa
  listDocs(companyId: string) {
    return this.http.get<CompanyDoc[]>(`${this.API}/company-docs`);
  }
  
  // Cria um novo documento para a empresa
  createDoc(companyId: string, dto: Partial<CompanyDoc>) {
    return this.http.post<CompanyDoc>(`${this.API}/company-docs`, dto);
  }
  
  // Atualiza um documento existente
  updateDoc(companyId: string, docId: string, dto: Partial<CompanyDoc>) {
    return this.http.patch<CompanyDoc>(`${this.API}/company-docs/${docId}`, dto);
  }
  
  // Remove um documento
  deleteDoc(companyId: string, docId: string) {
    return this.http.delete<void>(`${this.API}/company-docs/${docId}`);
  }
  
  // Upload de arquivo para um documento específico
  uploadDocFile(companyId: string, docId: string, file: File) {
    const fd = new FormData(); 
    fd.append('file', file);
    return this.http.post<CompanyDoc>(`${this.API}/company-docs/${docId}/upload`, fd);
  }
  
  // Download do arquivo de um documento
  downloadDocFile(companyId: string, docId: string) {
    return this.http.get(`${this.API}/company-docs/${docId}/file`, { responseType: 'blob' });
  }
}
