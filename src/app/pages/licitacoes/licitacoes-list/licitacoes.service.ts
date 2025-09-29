import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export type LicitacaoStatus = 'draft' | 'open' | 'closed' | 'cancelled' | 'awarded';

export interface Licitacao {
  id: string;
  title: string;
  orgao?: string;
  modalidade?: string;
  editalUrl?: string;
  sessionAt?: string;
  submissionDeadline?: string;
  status: LicitacaoStatus;
  saleValue?: string;
  notes?: string;
  documents?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface LicitacaoListResponse {
  licitacoes: Licitacao[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateLicitacaoRequest {
  title: string;
  orgao?: string;
  modalidade?: string;
  editalUrl?: string;
  sessionAt?: string;
  submissionDeadline?: string;
  status?: LicitacaoStatus;
  saleValue?: string;
  notes?: string;
}

export interface AnalisarEditalRequest {
  observacoes?: string;
  incluirSugestoesVeiculos?: boolean;
}

export interface ConformidadeResponse {
  totalRequired: number;
  totalSubmitted: number;
  totalSigned: number;
  coberturaPercentual: number;
  assinaturaPercentual: number;
  pendentes: Array<{
    docType: string;
    required: boolean;
    submitted: boolean;
    signed: boolean;
  }>;
  documents: Array<{
    id: string;
    docType: string;
    required: boolean;
    submitted: boolean;
    signed: boolean;
    issueDate?: string;
    expiresAt?: string;
    version: number;
    notes?: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class LicitacoesService {
  private baseUrl = 'http://localhost:3000/v1';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    console.log('🔑 [LicitacoesService] Token disponível?', token ? 'Sim' : 'Não');
    if (token) {
      console.log('🔑 [LicitacoesService] Token (primeiros 20 chars):', token.substring(0, 20) + '...');
    }
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
    
    console.log('📋 [LicitacoesService] Headers criados:', headers);
    return headers;
  }

  private getUploadHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    console.log('🔑 [LicitacoesService] Token para upload disponível?', token ? 'Sim' : 'Não');
    
    const headers = new HttpHeaders({
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
    
    console.log('📋 [LicitacoesService] Upload headers criados:', headers);
    return headers;
  }

  getLicitacoes(companyId: string, params: any = {}): Observable<LicitacaoListResponse> {
    let httpParams = new HttpParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });

    return this.http.get<LicitacaoListResponse>(`${this.baseUrl}/licitacoes`, { 
      params: httpParams,
      headers: this.getHeaders()
    });
  }

  getLicitacao(companyId: string, id: string): Observable<Licitacao & { conformidade: ConformidadeResponse }> {
    return this.http.get<Licitacao & { conformidade: ConformidadeResponse }>(`${this.baseUrl}/licitacoes/${id}`, {
      headers: this.getHeaders()
    });
  }

  createLicitacao(companyId: string, data: CreateLicitacaoRequest): Observable<Licitacao> {
    console.log('📝 [LicitacoesService.createLicitacao] Criando licitação...');
    console.log('📝 [LicitacoesService.createLicitacao] URL:', `${this.baseUrl}/licitacoes`);
    console.log('📝 [LicitacoesService.createLicitacao] Data:', data);
    
    return this.http.post<Licitacao>(`${this.baseUrl}/licitacoes`, data, {
      headers: this.getHeaders()
    });
  }

  updateLicitacao(companyId: string, id: string, data: Partial<CreateLicitacaoRequest>): Observable<Licitacao> {
    return this.http.patch<Licitacao>(`${this.baseUrl}/licitacoes/${id}`, data, {
      headers: this.getHeaders()
    });
  }

  deleteLicitacao(companyId: string, id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/licitacoes/${id}`, {
      headers: this.getHeaders()
    });
  }

  analisarEdital(companyId: string, id: string, data: AnalisarEditalRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/licitacoes/${id}/analisar-edital`, data, {
      headers: this.getHeaders()
    });
  }

  getDocuments(companyId: string, id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/licitacoes/${id}/documents`, {
      headers: this.getHeaders()
    });
  }

  getConformidade(companyId: string, id: string): Observable<ConformidadeResponse> {
    return this.http.get<ConformidadeResponse>(`${this.baseUrl}/licitacoes/${id}/conformidade`, {
      headers: this.getHeaders()
    });
  }

  // Métodos para documentos de licitação
  uploadDocument(companyId: string, licitacaoId: string, documentData: any, file: File): Observable<any> {
    console.log('📁 [LicitacoesService.uploadDocument] Fazendo upload de documento...');
    console.log('📁 [LicitacoesService.uploadDocument] LicitacaoId:', licitacaoId);
    console.log('📁 [LicitacoesService.uploadDocument] DocumentData:', documentData);
    console.log('📁 [LicitacoesService.uploadDocument] File:', file.name, file.size, file.type);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('docType', documentData.docType);
    formData.append('required', documentData.required.toString());
    formData.append('submitted', documentData.submitted.toString());
    formData.append('signed', documentData.signed.toString());
    
    if (documentData.issueDate) {
      formData.append('issueDate', documentData.issueDate);
    }
    if (documentData.expiresAt) {
      formData.append('expiresAt', documentData.expiresAt);
    }
    if (documentData.notes) {
      formData.append('notes', documentData.notes);
    }

    console.log('📁 [LicitacoesService.uploadDocument] FormData criado, enviando...');
    console.log('📁 [LicitacoesService.uploadDocument] URL:', `${this.baseUrl}/licitacoes/${licitacaoId}/documents/upload`);

    return this.http.post(`${this.baseUrl}/licitacoes/${licitacaoId}/documents/upload`, formData, {
      headers: this.getUploadHeaders()
    });
  }

  getDocumentContent(companyId: string, licitacaoId: string, docId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/licitacoes/${licitacaoId}/documents/${docId}/content`, {
      responseType: 'blob',
      headers: this.getHeaders()
    });
  }

  deleteDocument(companyId: string, licitacaoId: string, docId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/licitacoes/${licitacaoId}/documents/${docId}`, {
      headers: this.getHeaders()
    });
  }

  reuploadDocument(companyId: string, licitacaoId: string, docId: string, documentData: any, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('docType', documentData.docType);
    formData.append('required', documentData.required.toString());
    formData.append('submitted', documentData.submitted.toString());
    formData.append('signed', documentData.signed.toString());
    
    if (documentData.issueDate) {
      formData.append('issueDate', documentData.issueDate);
    }
    if (documentData.expiresAt) {
      formData.append('expiresAt', documentData.expiresAt);
    }
    if (documentData.notes) {
      formData.append('notes', documentData.notes);
    }

    return this.http.post(`${this.baseUrl}/licitacoes/${licitacaoId}/documents/${docId}/reupload`, formData, {
      headers: this.getUploadHeaders()
    });
  }
}
