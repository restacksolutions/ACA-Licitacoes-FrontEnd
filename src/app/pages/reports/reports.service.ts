import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

export interface ReportsFilters {
  period?: '30d' | '90d' | 'year' | 'custom';
  customStart?: string;
  customEnd?: string;
  uf?: string[];
  orgao?: string[];
  modalidade?: string[];
  status?: string[];
}

export interface ReportsKPIs {
  participated: number;
  sent: number;
  won: number;
  win_rate: number;
}

export interface WinRateData {
  month: string;
  value: number;
}

export interface StatusByMonth {
  month: string;
  participated: number;
  sent: number;
  won: number;
  lost: number;
}

export interface TopOrgao {
  orgao: string;
  count: number;
}

export interface ByUF {
  uf: string;
  count: number;
}

export interface LossReason {
  reason: string;
  count: number;
}

export interface ReportsTableItem {
  date: string;
  title: string;
  orgao: string;
  uf: string;
  modalidade: string;
  status: string;
  amount: number | null;
}

export interface ReportsData {
  kpis: ReportsKPIs;
  winRateSeries: WinRateData[];
  statusByMonth: StatusByMonth[];
  lossReasons: LossReason[];
  table: ReportsTableItem[];
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  
  constructor() { }

  getReportsData(filters: ReportsFilters = {}): Observable<ReportsData> {
    // Simular delay da API
    return of(this.generateMockData(filters)).pipe(delay(800));
  }

  private generateMockData(filters: ReportsFilters): ReportsData {
    return {
      kpis: {
        participated: 25,
        sent: 19,
        won: 7,
        win_rate: 0.28
      },
      winRateSeries: [
        { month: 'abr', value: 0.22 },
        { month: 'mai', value: 0.30 },
        { month: 'jun', value: 0.27 },
        { month: 'jul', value: 0.33 },
        { month: 'ago', value: 0.28 }
      ],
      statusByMonth: [
        { month: 'abr', participated: 6, sent: 5, won: 2, lost: 3 },
        { month: 'mai', participated: 5, sent: 4, won: 1, lost: 2 },
        { month: 'jun', participated: 4, sent: 3, won: 1, lost: 2 },
        { month: 'jul', participated: 6, sent: 5, won: 2, lost: 2 },
        { month: 'ago', participated: 4, sent: 2, won: 1, lost: 1 }
      ],
      lossReasons: [
        { reason: 'Preço', count: 9 },
        { reason: 'Especificação', count: 5 },
        { reason: 'Documentação', count: 3 },
        { reason: 'Prazo', count: 2 },
        { reason: 'Outros', count: 1 }
      ],
      table: [
        { date: '2024-08-02', title: 'Aquisição de Veículos SUV', orgao: 'SEDUC', uf: 'PR', modalidade: 'Pregão Eletrônico', status: 'WON', amount: 125000 },
        { date: '2024-08-06', title: 'Frota de Veículos Leves', orgao: 'SESA', uf: 'SP', modalidade: 'Concorrência', status: 'LOST', amount: null },
        { date: '2024-08-10', title: 'Equipamentos de Informática', orgao: 'SEFAZ', uf: 'SC', modalidade: 'Pregão Eletrônico', status: 'WON', amount: 85000 },
        { date: '2024-08-15', title: 'Serviços de Limpeza', orgao: 'SEINF', uf: 'GO', modalidade: 'Tomada de Preços', status: 'LOST', amount: null },
        { date: '2024-08-20', title: 'Construção de Escola', orgao: 'SEDUC-SP', uf: 'SP', modalidade: 'Concorrência', status: 'WON', amount: 250000 },
        { date: '2024-08-25', title: 'Medicamentos Hospitalares', orgao: 'SESA-RJ', uf: 'RJ', modalidade: 'Pregão Eletrônico', status: 'LOST', amount: null },
        { date: '2024-08-28', title: 'Manutenção Predial', orgao: 'SEFAZ-MG', uf: 'MG', modalidade: 'Tomada de Preços', status: 'WON', amount: 45000 },
        { date: '2024-09-01', title: 'Equipamentos de Laboratório', orgao: 'SEINF-GO', uf: 'GO', modalidade: 'Pregão Eletrônico', status: 'LOST', amount: null },
        { date: '2024-09-05', title: 'Veículos para Fiscalização', orgao: 'SEDUC-SC', uf: 'SC', modalidade: 'Concorrência', status: 'WON', amount: 180000 },
        { date: '2024-09-08', title: 'Serviços de Segurança', orgao: 'SESA-RS', uf: 'RS', modalidade: 'Pregão Eletrônico', status: 'LOST', amount: null }
      ]
    };
  }

  exportToCSV(data: ReportsTableItem[]): void {
    // Mock CSV export
    const csvContent = this.generateCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'relatorios_licitacoes.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToPDF(data: ReportsTableItem[]): void {
    // Mock PDF export
    console.log('Exportando para PDF:', data);
    alert('Funcionalidade de exportação PDF será implementada em breve!');
  }

  private generateCSV(data: ReportsTableItem[]): string {
    const headers = ['Data', 'Título', 'Órgão', 'UF', 'Modalidade', 'Status', 'Valor'];
    const csvRows = [headers.join(',')];
    
    data.forEach(item => {
      const row = [
        item.date,
        `"${item.title}"`,
        item.orgao,
        item.uf,
        item.modalidade,
        item.status,
        item.amount ? item.amount.toString() : ''
      ];
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  }
}
