import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface CompanyDocument {
  id: string;
  docType: 'CNPJ' | 'INSCRICAO_ESTADUAL' | 'INSCRICAO_MUNICIPAL' | 'ALVARA' | 'CONTRATO_SOCIAL' | 'CERTIFICADO_DIGITAL' | 'LICENCA_AMBIENTAL' | 'CERTIDAO_FGTS' | 'CERTIDAO_INSS' | 'CERTIDAO_TRABALHISTA' | 'CERTIDAO_MUNICIPAL' | 'OUTROS';
  docNumber: string;
  issuer: string;
  issueDate: string;
  expiresAt: string;
  filePath?: string;
  notes?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentRequest {
  docType: CompanyDocument['docType'];
  docNumber: string;
  issuer: string;
  issueDate: string;
  expiresAt: string;
  notes?: string;
}

export interface UpdateDocumentRequest {
  docType?: CompanyDocument['docType'];
  docNumber?: string;
  issuer?: string;
  issueDate?: string;
  expiresAt?: string;
  notes?: string;
}

export interface DocumentStatistics {
  total: number;
  byType: Record<CompanyDocument['docType'], number>;
  expired: number;
  expiringSoon: number;
  valid: number;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentsService {
  constructor(private apiService: ApiService) {}

  /**
   * Obtém todos os documentos de uma empresa
   */
  getDocuments(companyId: string): Observable<CompanyDocument[]> {
    return this.apiService.getDocuments(companyId);
  }

  /**
   * Cria um novo documento
   */
  createDocument(companyId: string, documentData: CreateDocumentRequest): Observable<CompanyDocument> {
    return this.apiService.createDocument(companyId, documentData);
  }

  /**
   * Faz upload de arquivo para um documento
   */
  uploadDocument(companyId: string, documentId: string, file: File): Observable<any> {
    return this.apiService.uploadDocument(companyId, documentId, file);
  }

  /**
   * Obtém documentos por tipo
   */
  getDocumentsByType(companyId: string, docType: CompanyDocument['docType']): Observable<CompanyDocument[]> {
    return this.getDocuments(companyId).pipe(
      map(documents => documents.filter(doc => doc.docType === docType))
    );
  }

  /**
   * Obtém documentos expirados
   */
  getExpiredDocuments(companyId: string): Observable<CompanyDocument[]> {
    return this.getDocuments(companyId).pipe(
      map(documents => documents.filter(doc => this.isDocumentExpired(doc)))
    );
  }

  /**
   * Obtém documentos que expiram em breve
   */
  getExpiringSoonDocuments(companyId: string, daysThreshold: number = 30): Observable<CompanyDocument[]> {
    return this.getDocuments(companyId).pipe(
      map(documents => documents.filter(doc => this.isDocumentExpiringSoon(doc, daysThreshold)))
    );
  }

  /**
   * Obtém documentos válidos
   */
  getValidDocuments(companyId: string): Observable<CompanyDocument[]> {
    return this.getDocuments(companyId).pipe(
      map(documents => documents.filter(doc => !this.isDocumentExpired(doc)))
    );
  }

  /**
   * Obtém estatísticas dos documentos
   */
  getDocumentStatistics(companyId: string): Observable<DocumentStatistics> {
    return this.getDocuments(companyId).pipe(
      map(documents => {
        const total = documents.length;
        const byType = documents.reduce((acc, doc) => {
          acc[doc.docType] = (acc[doc.docType] || 0) + 1;
          return acc;
        }, {} as Record<CompanyDocument['docType'], number>);

        const expired = documents.filter(doc => this.isDocumentExpired(doc)).length;
        const expiringSoon = documents.filter(doc => this.isDocumentExpiringSoon(doc, 30)).length;
        const valid = total - expired;

        return {
          total,
          byType,
          expired,
          expiringSoon,
          valid
        };
      })
    );
  }

  /**
   * Verifica se um documento está expirado
   */
  isDocumentExpired(document: CompanyDocument): boolean {
    const now = new Date();
    const expirationDate = new Date(document.expiresAt);
    return expirationDate < now;
  }

  /**
   * Verifica se um documento está próximo do vencimento
   */
  isDocumentExpiringSoon(document: CompanyDocument, daysThreshold: number = 30): boolean {
    const now = new Date();
    const expirationDate = new Date(document.expiresAt);
    const daysDiff = (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff > 0 && daysDiff <= daysThreshold;
  }

  /**
   * Obtém o status do documento
   */
  getDocumentStatus(document: CompanyDocument): 'valid' | 'expiring_soon' | 'expired' {
    if (this.isDocumentExpired(document)) {
      return 'expired';
    } else if (this.isDocumentExpiringSoon(document, 30)) {
      return 'expiring_soon';
    } else {
      return 'valid';
    }
  }

  /**
   * Obtém o label do tipo de documento em português
   */
  getDocumentTypeLabel(docType: CompanyDocument['docType']): string {
    const labels: { [key in CompanyDocument['docType']]: string } = {
      'CNPJ': 'CNPJ',
      'INSCRICAO_ESTADUAL': 'Inscrição Estadual',
      'INSCRICAO_MUNICIPAL': 'Inscrição Municipal',
      'ALVARA': 'Alvará',
      'CONTRATO_SOCIAL': 'Contrato Social',
      'CERTIFICADO_DIGITAL': 'Certificado Digital',
      'LICENCA_AMBIENTAL': 'Licença Ambiental',
      'CERTIDAO_FGTS': 'Certidão FGTS',
      'CERTIDAO_INSS': 'Certidão INSS',
      'CERTIDAO_TRABALHISTA': 'Certidão Trabalhista',
      'CERTIDAO_MUNICIPAL': 'Certidão Municipal',
      'OUTROS': 'Outros'
    };
    return labels[docType] || docType;
  }

  /**
   * Obtém o label do status do documento em português
   */
  getDocumentStatusLabel(status: 'valid' | 'expiring_soon' | 'expired'): string {
    const labels = {
      'valid': 'Válido',
      'expiring_soon': 'Expirando em breve',
      'expired': 'Expirado'
    };
    return labels[status] || status;
  }

  /**
   * Obtém a cor do status do documento
   */
  getDocumentStatusColor(status: 'valid' | 'expiring_soon' | 'expired'): string {
    const colors = {
      'valid': 'green',
      'expiring_soon': 'yellow',
      'expired': 'red'
    };
    return colors[status] || 'gray';
  }

  /**
   * Calcula dias até o vencimento
   */
  getDaysUntilExpiration(document: CompanyDocument): number {
    const now = new Date();
    const expirationDate = new Date(document.expiresAt);
    const daysDiff = (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return Math.ceil(daysDiff);
  }

  /**
   * Obtém documentos que precisam de atenção (expirados ou expirando em breve)
   */
  getDocumentsNeedingAttention(companyId: string, daysThreshold: number = 30): Observable<CompanyDocument[]> {
    return this.getDocuments(companyId).pipe(
      map(documents => documents.filter(doc => 
        this.isDocumentExpired(doc) || this.isDocumentExpiringSoon(doc, daysThreshold)
      ))
    );
  }
}
