import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

export interface Tender {
  id: string;
  title: string;
  orgao: string;
  uf: string;
  modalidade: string;
  objeto: string;
  status: string;
  deadlines_json: any;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface TenderCreate {
  title: string;
  orgao: string;
  uf: string;
  modalidade: string;
  objeto: string;
}

@Injectable({
  providedIn: 'root'
})
export class TenderService {
  // Dados fictícios de licitações
  private mockTenders: Tender[] = [
    {
      id: '1',
      title: 'Aquisição de Veículos para Prefeitura',
      orgao: 'Prefeitura Municipal de São Paulo',
      uf: 'SP',
      modalidade: 'Pregão Eletrônico',
      objeto: 'Aquisição de 50 veículos utilitários para uso administrativo',
      status: 'IN_REVIEW',
      deadlines_json: {
        abertura: '2024-02-15T14:00:00Z',
        entrega_propostas: '2024-02-10T23:59:59Z',
        sessao_publica: '2024-02-15T14:00:00Z'
      },
      version: 1,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      title: 'Contratação de Serviços de Limpeza',
      orgao: 'Governo do Estado do Rio de Janeiro',
      uf: 'RJ',
      modalidade: 'Concorrência',
      objeto: 'Contratação de empresa para serviços de limpeza e conservação',
      status: 'PREPARING',
      deadlines_json: {
        abertura: '2024-03-01T09:00:00Z',
        entrega_propostas: '2024-02-25T17:00:00Z',
        sessao_publica: '2024-03-01T09:00:00Z'
      },
      version: 1,
      created_at: '2024-01-20T14:30:00Z',
      updated_at: '2024-01-20T14:30:00Z'
    },
    {
      id: '3',
      title: 'Fornecimento de Equipamentos de Informática',
      orgao: 'Ministério da Educação',
      uf: 'DF',
      modalidade: 'Pregão Eletrônico',
      objeto: 'Fornecimento de computadores e equipamentos de rede',
      status: 'DOCS_READY',
      deadlines_json: {
        abertura: '2024-02-28T10:00:00Z',
        entrega_propostas: '2024-02-20T18:00:00Z',
        sessao_publica: '2024-02-28T10:00:00Z'
      },
      version: 2,
      created_at: '2024-01-10T08:15:00Z',
      updated_at: '2024-01-25T16:45:00Z'
    },
    {
      id: '4',
      title: 'Construção de Escola Municipal',
      orgao: 'Prefeitura Municipal de Belo Horizonte',
      uf: 'MG',
      modalidade: 'Concorrência',
      objeto: 'Construção de escola municipal com 12 salas de aula',
      status: 'ONGOING',
      deadlines_json: {
        abertura: '2024-01-30T14:00:00Z',
        entrega_propostas: '2024-01-25T17:00:00Z',
        sessao_publica: '2024-01-30T14:00:00Z'
      },
      version: 1,
      created_at: '2024-01-05T11:20:00Z',
      updated_at: '2024-01-30T14:00:00Z'
    },
    {
      id: '5',
      title: 'Aquisição de Medicamentos',
      orgao: 'Secretaria de Saúde do Estado de São Paulo',
      uf: 'SP',
      modalidade: 'Pregão Eletrônico',
      objeto: 'Aquisição de medicamentos para rede pública de saúde',
      status: 'WON',
      deadlines_json: {
        abertura: '2024-01-15T09:00:00Z',
        entrega_propostas: '2024-01-10T17:00:00Z',
        sessao_publica: '2024-01-15T09:00:00Z'
      },
      version: 1,
      created_at: '2023-12-20T13:45:00Z',
      updated_at: '2024-01-15T09:00:00Z'
    }
  ];

  constructor() { }

  getTenders(): Observable<Tender[]> {
    // Simular delay da API
    return of(this.mockTenders).pipe(delay(500));
  }

  getTender(id: string): Observable<Tender> {
    const tender = this.mockTenders.find(t => t.id === id);
    if (tender) {
      return of(tender).pipe(delay(300));
    }
    throw new Error('Licitação não encontrada');
  }

  createTender(tender: TenderCreate): Observable<Tender> {
    const newTender: Tender = {
      id: (this.mockTenders.length + 1).toString(),
      ...tender,
      status: 'DRAFT',
      deadlines_json: {},
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    this.mockTenders.push(newTender);
    return of(newTender).pipe(delay(800));
  }

  updateTender(id: string, tender: Partial<TenderCreate>): Observable<Tender> {
    const index = this.mockTenders.findIndex(t => t.id === id);
    if (index !== -1) {
      this.mockTenders[index] = {
        ...this.mockTenders[index],
        ...tender,
        updated_at: new Date().toISOString()
      };
      return of(this.mockTenders[index]).pipe(delay(600));
    }
    throw new Error('Licitação não encontrada');
  }

  deleteTender(id: string): Observable<void> {
    const index = this.mockTenders.findIndex(t => t.id === id);
    if (index !== -1) {
      this.mockTenders.splice(index, 1);
      return of(void 0).pipe(delay(400));
    }
    throw new Error('Licitação não encontrada');
  }

  uploadTender(file: File): Observable<any> {
    // Simular upload
    return of({
      message: 'Arquivo enviado com sucesso',
      tender_id: (this.mockTenders.length + 1).toString()
    }).pipe(delay(2000));
  }
}