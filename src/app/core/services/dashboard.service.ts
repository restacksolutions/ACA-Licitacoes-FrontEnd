import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

export interface DashboardFilters {
  from?: string;
  to?: string;
  uf?: string[];
  status?: string[];
  orgao?: string[];
  modalidade?: string[];
  q?: string;
}

export interface DashboardKPIs {
  active_tenders: number;
  due_48h: number;
  win_rate: number;
}

export interface AgendaEvent {
  id: string;
  title: string;
  start: string;
  tender_id: string;
  tender_title: string;
  status: 'PENDING' | 'DONE' | 'OVERDUE';
  type: 'DEADLINE' | 'MEETING' | 'TASK';
}

export interface RecentTender {
  id: string;
  title: string;
  orgao: string;
  uf: string;
  modalidade: string;
  next_due: string;
  status: string;
}

export interface Alert {
  id: string;
  type: 'RETIFICACAO' | 'DEADLINE' | 'ERROR' | 'SUCCESS';
  message: string;
  tender_id: string;
  tender_title: string;
  created_at: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface Task {
  id: string;
  title: string;
  due_at: string;
  tender_id: string;
  tender_title: string;
  status: 'PENDING' | 'DONE' | 'OVERDUE';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface FunnelData {
  participated: number;
  sent: number;
  won: number;
}

export interface WinRateTrend {
  date: string;
  value: number;
}

export interface ActivityEvent {
  id: string;
  type: 'STATUS_CHANGE' | 'DOCUMENT_GENERATED' | 'RESULT_REGISTERED' | 'TASK_COMPLETED';
  message: string;
  tender_id: string;
  tender_title: string;
  created_at: string;
  user: string;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  agenda: AgendaEvent[];
  recent_tenders: RecentTender[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  
  constructor() { }

  getDashboardData(): Observable<DashboardData> {
    // Simular delay da API
    return of(this.generateMockData()).pipe(delay(500));
  }

  private generateMockData(): DashboardData {
    return {
      kpis: {
        active_tenders: 14,
        due_48h: 5,
        win_rate: 0.38
      },
      agenda: [
        {
          id: 'e1',
          title: 'Entrega de proposta técnica',
          start: '2024-09-06T14:00:00-03:00',
          tender_id: 't1',
          tender_title: 'SEDUC/PR',
          status: 'PENDING',
          type: 'DEADLINE'
        },
        {
          id: 'e2',
          title: 'Sessão pública de abertura',
          start: '2024-09-07T10:00:00-03:00',
          tender_id: 't2',
          tender_title: 'SEFAZ/SP',
          status: 'PENDING',
          type: 'MEETING'
        },
        {
          id: 'e3',
          title: 'Impugnação de edital',
          start: '2024-09-08T11:00:00-03:00',
          tender_id: 't3',
          tender_title: 'SESA/SC',
          status: 'PENDING',
          type: 'TASK'
        },
        {
          id: 'e4',
          title: 'Envio de documentação',
          start: '2024-09-08T16:00:00-03:00',
          tender_id: 't4',
          tender_title: 'SEDUC/PR',
          status: 'PENDING',
          type: 'DEADLINE'
        },
        {
          id: 'e5',
          title: 'Recurso administrativo',
          start: '2024-09-09T09:00:00-03:00',
          tender_id: 't5',
          tender_title: 'SEINF/GO',
          status: 'PENDING',
          type: 'TASK'
        }
      ],
      recent_tenders: [
        {
          id: 't1',
          title: 'Aquisição de Veículos para Prefeitura',
          orgao: 'Prefeitura Municipal de São Paulo',
          uf: 'SP',
          modalidade: 'Pregão Eletrônico',
          next_due: '2024-09-06T14:00:00-03:00',
          status: 'PREPARING'
        },
        {
          id: 't2',
          title: 'Contratação de Serviços de Limpeza',
          orgao: 'Governo do Estado do Rio de Janeiro',
          uf: 'RJ',
          modalidade: 'Concorrência',
          next_due: '2024-09-07T10:00:00-03:00',
          status: 'SENT'
        },
        {
          id: 't3',
          title: 'Fornecimento de Equipamentos de Informática',
          orgao: 'Ministério da Educação',
          uf: 'DF',
          modalidade: 'Pregão Eletrônico',
          next_due: '2024-09-08T16:00:00-03:00',
          status: 'ONGOING'
        },
        {
          id: 't4',
          title: 'Construção de Escola Municipal',
          orgao: 'Prefeitura Municipal de Belo Horizonte',
          uf: 'MG',
          modalidade: 'Concorrência',
          next_due: '2024-09-09T09:00:00-03:00',
          status: 'PREPARING'
        },
        {
          id: 't5',
          title: 'Aquisição de Medicamentos',
          orgao: 'Secretaria de Saúde do Estado de São Paulo',
          uf: 'SP',
          modalidade: 'Pregão Eletrônico',
          next_due: '2024-09-10T11:00:00-03:00',
          status: 'WON'
        },
        {
          id: 't6',
          title: 'Serviços de Manutenção Predial',
          orgao: 'Tribunal de Justiça do Estado',
          uf: 'RS',
          modalidade: 'Tomada de Preços',
          next_due: '2024-09-11T15:00:00-03:00',
          status: 'LOST'
        }
      ]
    };
  }

  updateFilters(): Observable<DashboardData> {
    return this.getDashboardData();
  }
}
