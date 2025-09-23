import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface Bid {
  id: string;
  title: string;
  orgao: string;
  modalidade: string;
  editalUrl: string;
  sessionAt: string;
  submissionDeadline: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'cancelled';
  saleValue: string;
  notes?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBidRequest {
  title: string;
  orgao: string;
  modalidade: string;
  editalUrl: string;
  sessionAt: string;
  submissionDeadline: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'cancelled';
  saleValue: string;
  notes?: string;
}

export interface UpdateBidRequest {
  title?: string;
  orgao?: string;
  modalidade?: string;
  editalUrl?: string;
  sessionAt?: string;
  submissionDeadline?: string;
  status?: 'draft' | 'submitted' | 'approved' | 'rejected' | 'cancelled';
  saleValue?: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BidsService {
  constructor(private apiService: ApiService) {}

  /**
   * Obtém todas as licitações de uma empresa
   */
  getBids(companyId: string): Observable<Bid[]> {
    return this.apiService.getBids(companyId);
  }

  /**
   * Obtém uma licitação específica
   */
  getBid(companyId: string, bidId: string): Observable<Bid> {
    return this.apiService.getBid(companyId, bidId);
  }

  /**
   * Cria uma nova licitação
   */
  createBid(companyId: string, bidData: CreateBidRequest): Observable<Bid> {
    return this.apiService.createBid(companyId, bidData);
  }

  /**
   * Atualiza uma licitação existente
   */
  updateBid(companyId: string, bidId: string, bidData: UpdateBidRequest): Observable<Bid> {
    return this.apiService.updateBid(companyId, bidId, bidData);
  }

  /**
   * Remove uma licitação
   */
  deleteBid(companyId: string, bidId: string): Observable<any> {
    return this.apiService.deleteBid(companyId, bidId);
  }

  /**
   * Obtém licitações por status
   */
  getBidsByStatus(companyId: string, status: Bid['status']): Observable<Bid[]> {
    return this.getBids(companyId).pipe(
      map(bids => bids.filter(bid => bid.status === status))
    );
  }

  /**
   * Obtém licitações próximas do prazo de submissão
   */
  getBidsNearDeadline(companyId: string, daysThreshold: number = 7): Observable<Bid[]> {
    return this.getBids(companyId).pipe(
      map(bids => {
        const now = new Date();
        const thresholdDate = new Date(now.getTime() + (daysThreshold * 24 * 60 * 60 * 1000));
        
        return bids.filter(bid => {
          const deadline = new Date(bid.submissionDeadline);
          return deadline <= thresholdDate && deadline >= now;
        });
      })
    );
  }

  /**
   * Obtém licitações por valor
   */
  getBidsByValueRange(companyId: string, minValue: number, maxValue: number): Observable<Bid[]> {
    return this.getBids(companyId).pipe(
      map(bids => bids.filter(bid => {
        const value = parseFloat(bid.saleValue);
        return value >= minValue && value <= maxValue;
      }))
    );
  }

  /**
   * Obtém licitações por órgão
   */
  getBidsByOrgao(companyId: string, orgao: string): Observable<Bid[]> {
    return this.getBids(companyId).pipe(
      map(bids => bids.filter(bid => 
        bid.orgao.toLowerCase().includes(orgao.toLowerCase())
      ))
    );
  }

  /**
   * Obtém estatísticas das licitações
   */
  getBidsStatistics(companyId: string): Observable<{
    total: number;
    byStatus: { [key in Bid['status']]: number };
    totalValue: number;
    averageValue: number;
    upcomingDeadlines: number;
  }> {
    return this.getBids(companyId).pipe(
      map(bids => {
        const total = bids.length;
        const byStatus = bids.reduce((acc, bid) => {
          acc[bid.status] = (acc[bid.status] || 0) + 1;
          return acc;
        }, {} as { [key in Bid['status']]: number });
        
        const totalValue = bids.reduce((sum, bid) => sum + parseFloat(bid.saleValue), 0);
        const averageValue = total > 0 ? totalValue / total : 0;
        
        const now = new Date();
        const upcomingDeadlines = bids.filter(bid => {
          const deadline = new Date(bid.submissionDeadline);
          const daysDiff = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
          return daysDiff > 0 && daysDiff <= 30;
        }).length;

        return {
          total,
          byStatus,
          totalValue,
          averageValue,
          upcomingDeadlines
        };
      })
    );
  }

  /**
   * Verifica se uma licitação está próxima do prazo
   */
  isBidNearDeadline(bid: Bid, daysThreshold: number = 7): boolean {
    const now = new Date();
    const deadline = new Date(bid.submissionDeadline);
    const daysDiff = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff > 0 && daysDiff <= daysThreshold;
  }

  /**
   * Verifica se uma licitação está expirada
   */
  isBidExpired(bid: Bid): boolean {
    const now = new Date();
    const deadline = new Date(bid.submissionDeadline);
    return deadline < now;
  }

  /**
   * Obtém o status em português
   */
  getStatusLabel(status: Bid['status']): string {
    const labels: { [key in Bid['status']]: string } = {
      draft: 'Rascunho',
      submitted: 'Enviada',
      approved: 'Aprovada',
      rejected: 'Rejeitada',
      cancelled: 'Cancelada'
    };
    return labels[status] || status;
  }

  /**
   * Obtém a modalidade em português
   */
  getModalidadeLabel(modalidade: string): string {
    const labels: { [key: string]: string } = {
      'pregão_eletrônico': 'Pregão Eletrônico',
      'tomada_de_preços': 'Tomada de Preços',
      'concorrência': 'Concorrência',
      'convite': 'Convite',
      'concurso': 'Concurso',
      'leilão': 'Leilão',
      'rdc': 'RDC - Regime Diferenciado de Contratação',
      'inexigibilidade': 'Inexigibilidade',
      'dispensável': 'Dispensável'
    };
    return labels[modalidade] || modalidade;
  }
}
