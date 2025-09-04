import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DashboardKPIs } from '../../../../core/services/dashboard.service';

@Component({
  selector: 'app-kpi-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kpi-cards.component.html',
  styleUrls: ['./kpi-cards.component.css']
})
export class KpiCardsComponent {
  @Input() kpis: DashboardKPIs = {
    active_tenders: 0,
    due_48h: 0,
    win_rate: 0
  };
  @Input() loading = false;
  @Output() kpiClick = new EventEmitter<string>();

  constructor(private router: Router) {}

  onKpiClick(kpiType: string) {
    this.kpiClick.emit(kpiType);
    
    // Navegar para a tela correspondente com filtros
    switch (kpiType) {
      case 'active_tenders':
        this.router.navigate(['/tenders'], { 
          queryParams: { status: 'PREPARING,SENT,ONGOING' } 
        });
        break;
      case 'due_48h':
        this.router.navigate(['/calendar'], { 
          queryParams: { filter: 'due_48h' } 
        });
        break;
      case 'win_rate':
        this.router.navigate(['/reports'], { 
          queryParams: { view: 'win_rate' } 
        });
        break;
      case 'pending_docs':
        this.router.navigate(['/tenders'], { 
          queryParams: { filter: 'pending_docs' } 
        });
        break;
    }
  }

  formatWinRate(rate: number): string {
    return (rate * 100).toFixed(1) + '%';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  formatDays(value: number): string {
    return value.toFixed(1) + ' dias';
  }
}
