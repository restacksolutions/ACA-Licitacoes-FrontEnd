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
  id: string; name: string; issuer?: string; docType?: string; required?: boolean;
  issueDate?: string | null; expiresAt?: string | null; notes?: string | null;
  fileName?: string; fileMime?: string; fileSize?: number; fileSha256?: string; updatedAt?: string;
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

  // Documentos
  listDocs(companyId: string) {
    return this.http.get<CompanyDoc[]>(`${this.API}/company-docs`);
  }
  createDoc(companyId: string, dto: Partial<CompanyDoc>) {
    return this.http.post<CompanyDoc>(`${this.API}/company-docs`, dto);
  }
  updateDoc(companyId: string, docId: string, dto: Partial<CompanyDoc>) {
    return this.http.patch<CompanyDoc>(`${this.API}/company-docs/${docId}`, dto);
  }
  deleteDoc(companyId: string, docId: string) {
    return this.http.delete<void>(`${this.API}/company-docs/${docId}`);
  }
  uploadDocFile(companyId: string, docId: string, file: File) {
    const fd = new FormData(); fd.append('file', file);
    return this.http.post<CompanyDoc>(`${this.API}/company-docs/${docId}/upload`, fd);
  }
  downloadDocFile(companyId: string, docId: string) {
    return this.http.get(`${this.API}/company-docs/${docId}/file`, { responseType: 'blob' });
  }
}
