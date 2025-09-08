import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpProgressEvent } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface TenderFormData {
  title: string;
  description: string;
  organ: string;
  uf: string;
  modality: string;
  deadline: string;
  estimatedValue?: number;
  contactEmail?: string;
  contactPhone?: string;
  observations?: string;
}

export interface TenderUploadResponse {
  id: string;
  status: 'processing' | 'completed' | 'error';
  message: string;
  extractedData?: any;
  processingTime?: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class TenderApiService {
  private uploadProgressSubject = new BehaviorSubject<UploadProgress>({ loaded: 0, total: 0, percentage: 0 });
  public uploadProgress$ = this.uploadProgressSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Simula o upload do PDF para a API
   * Em produção, substitua pela URL real da API
   */
  uploadTenderPdf(file: File, formData: TenderFormData): Observable<TenderUploadResponse> {
    const formDataToSend = new FormData();
    formDataToSend.append('pdf', file);
    formDataToSend.append('tenderData', JSON.stringify(formData));

    // Simula uma API que ainda não existe
    // Em produção, use: return this.http.post<TenderUploadResponse>('/api/tenders/upload', formDataToSend, { ... });
    
    return this.simulateApiCall(file, formData);
  }

  /**
   * Simula o processamento do PDF com OCR/IA
   */
  processTenderPdf(tenderId: string): Observable<TenderUploadResponse> {
    // Simula processamento com delay
    return this.simulateProcessing(tenderId);
  }

  /**
   * Obtém o status do processamento
   */
  getTenderStatus(tenderId: string): Observable<TenderUploadResponse> {
    // Simula verificação de status
    return this.simulateStatusCheck(tenderId);
  }

  private simulateApiCall(file: File, formData: TenderFormData): Observable<TenderUploadResponse> {
    return new Observable(observer => {
      // Simula progresso de upload
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          // Simula resposta da API
          setTimeout(() => {
            const response: TenderUploadResponse = {
              id: `tender_${Date.now()}`,
              status: 'processing',
              message: 'PDF recebido com sucesso! Iniciando processamento...',
              processingTime: Math.floor(Math.random() * 30) + 10
            };
            
            observer.next(response);
            observer.complete();
          }, 500);
        } else {
          this.uploadProgressSubject.next({
            loaded: progress,
            total: 100,
            percentage: Math.round(progress)
          });
        }
      }, 200);
    });
  }

  private simulateProcessing(tenderId: string): Observable<TenderUploadResponse> {
    return new Observable(observer => {
      setTimeout(() => {
        const response: TenderUploadResponse = {
          id: tenderId,
          status: 'completed',
          message: 'Processamento concluído! Dados extraídos com sucesso.',
          extractedData: {
            title: 'Licitação de Veículos',
            organ: 'SEDUC',
            uf: 'PR',
            modality: 'Pregão Eletrônico',
            deadline: '2024-12-31',
            estimatedValue: 150000,
            requirements: [
              'Veículo SUV 4x4',
              'Ano modelo 2020 ou superior',
              'Documentação em dia',
              'Seguro obrigatório'
            ],
            documents: [
              'Proposta técnica',
              'Proposta comercial',
              'Documentação da empresa',
              'Certidões negativas'
            ]
          },
          processingTime: 25
        };
        
        observer.next(response);
        observer.complete();
      }, 3000);
    });
  }

  private simulateStatusCheck(tenderId: string): Observable<TenderUploadResponse> {
    return new Observable(observer => {
      setTimeout(() => {
        const statuses = ['processing', 'completed', 'error'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        const response: TenderUploadResponse = {
          id: tenderId,
          status: randomStatus as any,
          message: randomStatus === 'completed' 
            ? 'Processamento concluído!' 
            : randomStatus === 'processing'
            ? 'Ainda processando...'
            : 'Erro no processamento',
          processingTime: randomStatus === 'completed' ? 30 : undefined
        };
        
        observer.next(response);
        observer.complete();
      }, 1000);
    });
  }

  resetProgress(): void {
    this.uploadProgressSubject.next({ loaded: 0, total: 0, percentage: 0 });
  }
}

