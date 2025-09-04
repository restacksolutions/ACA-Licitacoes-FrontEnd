import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardFilters } from '../../../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-filters.component.html',
  styleUrls: ['./dashboard-filters.component.css']
})
export class DashboardFiltersComponent {
  @Input() filters: DashboardFilters = {};
  @Output() filtersChange = new EventEmitter<DashboardFilters>();
  @Output() applyFilters = new EventEmitter<void>();
  @Output() clearFilters = new EventEmitter<void>();

  // Opções para os filtros
  periodOptions = [
    { label: 'Hoje', value: 'today' },
    { label: '7 dias', value: '7d' },
    { label: '30 dias', value: '30d' },
    { label: '90 dias', value: '90d' },
    { label: 'Personalizado', value: 'custom' }
  ];

  statusOptions = [
    { label: 'Rascunho', value: 'DRAFT' },
    { label: 'Preparando', value: 'PREPARING' },
    { label: 'Enviado', value: 'SENT' },
    { label: 'Em Andamento', value: 'ONGOING' },
    { label: 'Concluído', value: 'COMPLETED' },
    { label: 'Vencido', value: 'WON' },
    { label: 'Perdido', value: 'LOST' }
  ];

  ufOptions = [
    { label: 'SP', value: 'SP' },
    { label: 'RJ', value: 'RJ' },
    { label: 'MG', value: 'MG' },
    { label: 'PR', value: 'PR' },
    { label: 'RS', value: 'RS' },
    { label: 'DF', value: 'DF' },
    { label: 'BA', value: 'BA' },
    { label: 'SC', value: 'SC' }
  ];

  modalidadeOptions = [
    { label: 'Pregão Eletrônico', value: 'PREGÃO_ELETRÔNICO' },
    { label: 'Concorrência', value: 'CONCORRÊNCIA' },
    { label: 'Tomada de Preços', value: 'TOMADA_DE_PREÇOS' },
    { label: 'Convite', value: 'CONVITE' },
    { label: 'RDC', value: 'RDC' }
  ];

  selectedPeriod = '30d';
  customDateRange = {
    from: '',
    to: ''
  };

  onPeriodChange(period: string) {
    this.selectedPeriod = period;
    if (period === 'custom') {
      // Lógica para abrir seletor de datas personalizado
      return;
    }
    
    // Calcular datas baseado no período selecionado
    const dates = this.calculateDateRange(period);
    this.filters.from = dates.from;
    this.filters.to = dates.to;
    this.emitFiltersChange();
  }

  onStatusToggle(status: string) {
    if (!this.filters.status) {
      this.filters.status = [];
    }
    
    const index = this.filters.status.indexOf(status);
    if (index > -1) {
      this.filters.status.splice(index, 1);
    } else {
      this.filters.status.push(status);
    }
    this.emitFiltersChange();
  }

  onUfToggle(uf: string) {
    if (!this.filters.uf) {
      this.filters.uf = [];
    }
    
    const index = this.filters.uf.indexOf(uf);
    if (index > -1) {
      this.filters.uf.splice(index, 1);
    } else {
      this.filters.uf.push(uf);
    }
    this.emitFiltersChange();
  }

  onModalidadeToggle(modalidade: string) {
    if (!this.filters.modalidade) {
      this.filters.modalidade = [];
    }
    
    const index = this.filters.modalidade.indexOf(modalidade);
    if (index > -1) {
      this.filters.modalidade.splice(index, 1);
    } else {
      this.filters.modalidade.push(modalidade);
    }
    this.emitFiltersChange();
  }

  onSearchChange(search: string) {
    this.filters.q = search;
    this.emitFiltersChange();
  }

  onApplyFilters() {
    this.applyFilters.emit();
  }

  onClearFilters() {
    this.filters = {};
    this.selectedPeriod = '30d';
    this.customDateRange = { from: '', to: '' };
    this.clearFilters.emit();
  }

  private emitFiltersChange() {
    this.filtersChange.emit(this.filters);
  }

  private calculateDateRange(period: string): { from: string; to: string } {
    const today = new Date();
    const to = today.toISOString().split('T')[0];
    
    let from: string;
    switch (period) {
      case 'today':
        from = to;
        break;
      case '7d':
        from = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case '30d':
        from = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case '90d':
        from = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      default:
        from = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }
    
    return { from, to };
  }

  isStatusSelected(status: string): boolean {
    return this.filters.status?.includes(status) || false;
  }

  isUfSelected(uf: string): boolean {
    return this.filters.uf?.includes(uf) || false;
  }

  isModalidadeSelected(modalidade: string): boolean {
    return this.filters.modalidade?.includes(modalidade) || false;
  }
}
