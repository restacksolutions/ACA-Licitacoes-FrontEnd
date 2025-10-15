import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export type LicStatus = 'draft' | 'open' | 'closed' | 'cancelled' | 'awarded';

export interface Licitacao {
  id: string;
  title: string;
  status: LicStatus;
  editalUrl?: string;
  sessionDate?: string;
  submissionDeadline?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLicitacaoDto {
  title: string;
  status: LicStatus;
  editalUrl?: string;
  sessionDate?: string;          // ISO
  submissionDeadline?: string;   // ISO
}

export interface UpdateLicitacaoDto {
  title?: string;
  status?: LicStatus;
  editalUrl?: string;
  sessionDate?: string;
  submissionDeadline?: string;
}

export interface LicDocDto {
  name: string;
  docType?: string;
  required?: boolean;
  submitted?: boolean;
  signed?: boolean;
  issueDate?: string;
  expiresAt?: string;
  notes?: string;
}

export interface LicSummary {
  total: number;
  required: number;
  submitted: number;
  signed: number;
  coveragePercent: number;
}

@Injectable({ providedIn: 'root' })
export class LicitacoesService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/licitacoes`;

  // LISTAR: /licitacoes?status=&search=
  list(search?: string, status?: LicStatus) {
    let params = new HttpParams();
    if (search?.trim()) params = params.set('search', search.trim());
    if (status) params = params.set('status', status);
    return this.http.get<Licitacao[]>(this.base, { params });
  }

  // OBTER: /licitacoes/:id
  getById(id: string) {
    return this.http.get<Licitacao>(`${this.base}/${id}`);
  }

  // CRIAR: POST /licitacoes
  create(data: CreateLicitacaoDto) {
    return this.http.post<Licitacao>(this.base, data);
  }

  // ATUALIZAR: PATCH /licitacoes/:id
  update(id: string, data: UpdateLicitacaoDto) {
    return this.http.patch<Licitacao>(`${this.base}/${id}`, data);
  }

  // EXCLUIR: DELETE /licitacoes/:id
  remove(id: string) {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }

  // DOCUMENTOS: GET/POST /licitacoes/:id/documents
  listDocuments(licId: string) {
    return this.http.get<any[]>(`${this.base}/${licId}/documents`);
  }
  addDocument(licId: string, dto: LicDocDto) {
    return this.http.post<any>(`${this.base}/${licId}/documents`, dto);
  }

  // UPLOAD DE ARQUIVO DO DOCUMENTO: POST /licitacoes/:id/documents/:docId/upload (multipart)
  uploadDocument(licId: string, docId: string, file: File) {
    const form = new FormData();
    form.append('file', file);
    // não setar Content-Type (o browser define)
    return this.http.post<any>(`${this.base}/${licId}/documents/${docId}/upload`, form);
  }

  // EVENTOS: GET/POST /licitacoes/:id/events
  listEvents(licId: string) {
    return this.http.get<any[]>(`${this.base}/${licId}/events`);
  }
  addEvent(licId: string, evt: { type: string; payload: any }) {
    return this.http.post<any>(`${this.base}/${licId}/events`, evt);
  }

  // RESUMO: GET /licitacoes/:id/summary
  getSummary(licId: string) {
    return this.http.get<LicSummary>(`${this.base}/${licId}/summary`);
  }
}
