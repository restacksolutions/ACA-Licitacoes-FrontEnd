import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  type: 'DOCX' | 'PDF';
  category: string;
}

export interface DocumentGenerateRequest {
  template_id: string;
  tender_id: string;
  data: any;
}

export interface Document {
  id: string;
  tender_id: string;
  template_code: string;
  file_id: string;
  kind: string;
  signed_url: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  // Templates fictícios de documentos
  private mockTemplates: DocumentTemplate[] = [
    {
      id: '1',
      name: 'Proposta Técnica',
      description: 'Modelo padrão para proposta técnica',
      type: 'DOCX',
      category: 'Proposta'
    },
    {
      id: '2',
      name: 'Proposta Comercial',
      description: 'Modelo padrão para proposta comercial',
      type: 'DOCX',
      category: 'Proposta'
    },
    {
      id: '3',
      name: 'Declaração de Conformidade',
      description: 'Declaração de conformidade com as especificações',
      type: 'PDF',
      category: 'Declaração'
    },
    {
      id: '4',
      name: 'Certificado de Qualidade',
      description: 'Certificado de qualidade dos produtos',
      type: 'PDF',
      category: 'Certificado'
    },
    {
      id: '5',
      name: 'Manual Técnico',
      description: 'Manual técnico do produto/serviço',
      type: 'PDF',
      category: 'Manual'
    }
  ];

  constructor() { }

  getTemplates(): Observable<DocumentTemplate[]> {
    return of(this.mockTemplates).pipe(delay(300));
  }

  generateDocument(request: DocumentGenerateRequest): Observable<Document> {
    // Simular geração de documento
    const document: Document = {
      id: Math.random().toString(36).substr(2, 9),
      tender_id: request.tender_id,
      template_code: request.template_id,
      file_id: Math.random().toString(36).substr(2, 9),
      kind: 'proposta',
      signed_url: `https://example.com/documents/${Math.random().toString(36).substr(2, 9)}.pdf`,
      created_at: new Date().toISOString()
    };

    return of(document).pipe(delay(2000));
  }

  getDocuments(tenderId: string): Observable<Document[]> {
    // Simular documentos existentes
    const mockDocuments: Document[] = [
      {
        id: '1',
        tender_id: tenderId,
        template_code: 'proposta_tecnica',
        file_id: 'file_1',
        kind: 'proposta',
        signed_url: 'https://example.com/documents/proposta_tecnica.pdf',
        created_at: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        tender_id: tenderId,
        template_code: 'proposta_comercial',
        file_id: 'file_2',
        kind: 'proposta',
        signed_url: 'https://example.com/documents/proposta_comercial.pdf',
        created_at: '2024-01-16T14:30:00Z'
      }
    ];

    return of(mockDocuments).pipe(delay(500));
  }
}