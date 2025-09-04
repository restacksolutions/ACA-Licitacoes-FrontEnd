import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportsFilters } from '../../../../core/services/reports.service';

@Component({
  selector: 'app-reports-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports-filters.component.html',
  styleUrls: ['./reports-filters.component.css']
})
export class ReportsFiltersComponent {
  @Input() filters: ReportsFilters = {};
  @Output() filtersChange = new EventEmitter<ReportsFilters>();
  @Output() applyFilters = new EventEmitter<void>();
  @Output() clearFilters = new EventEmitter<void>();

  // Opções para os filtros
  periodOptions = [
    { label: 'Últimos 30d', value: '30d' },
    { label: 'Últimos 90d', value: '90d' },
    { label: 'Ano atual', value: 'year' },
    { label: 'Personalizado', value: 'custom' }
  ];

  ufOptions = [
    { label: 'PR', value: 'PR' },
    { label: 'SP', value: 'SP' },
    { label: 'SC', value: 'SC' },
    { label: 'GO', value: 'GO' },
    { label: 'RJ', value: 'RJ' },
    { label: 'MG', value: 'MG' },
    { label: 'RS', value: 'RS' },
    { label: 'DF', value: 'DF' },
    { label: 'BA', value: 'BA' }
  ];

  modalidadeOptions = [
    { label: 'Pregão Eletrônico', value: 'PREGÃO_ELETRÔNICO' },
    { label: 'Concorrência', value: 'CONCORRÊNCIA' },
    { label: 'Tomada de Preços', value: 'TOMADA_DE_PREÇOS' },
    { label: 'Convite', value: 'CONVITE' },
    { label: 'RDC', value: 'RDC' }
  ];

  statusOptions = [
    { label: 'Participada', value: 'PARTICIPATED' },
    { label: 'Enviada', value: 'SENT' },
    { label: 'Ganha', value: 'WON' },
    { label: 'Perdida', value: 'LOST' }
  ];

  selectedPeriod = '90d';
  customDateRange = {
    start: '',
    end: ''
  };

  onPeriodChange(period: string) {
    this.selectedPeriod = period;
    this.filters.period = period as any;
    this.emitFiltersChange();
  }

  onCustomDateChange() {
    if (this.selectedPeriod === 'custom') {
      this.filters.customStart = this.customDateRange.start;
      this.filters.customEnd = this.customDateRange.end;
      this.emitFiltersChange();
    }
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

  onModalidadeChange(modalidade: string) {
    this.filters.modalidade = modalidade ? [modalidade] : [];
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

  onOrgaoChange(orgao: string) {
    this.filters.orgao = orgao ? [orgao] : [];
    this.emitFiltersChange();
  }

  onApplyFilters() {
    this.applyFilters.emit();
  }

  onClearFilters() {
    this.filters = {};
    this.selectedPeriod = '90d';
    this.customDateRange = { start: '', end: '' };
    this.clearFilters.emit();
  }

  private emitFiltersChange() {
    this.filtersChange.emit(this.filters);
  }

  isUfSelected(uf: string): boolean {
    return this.filters.uf?.includes(uf) || false;
  }

  isStatusSelected(status: string): boolean {
    return this.filters.status?.includes(status) || false;
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.filters.uf?.length) count += this.filters.uf.length;
    if (this.filters.status?.length) count += this.filters.status.length;
    if (this.filters.modalidade?.length) count += 1;
    if (this.filters.orgao?.length) count += 1;
    if (this.selectedPeriod !== '90d') count += 1;
    return count;
  }

  getPeriodLabel(period: string): string {
    const option = this.periodOptions.find(p => p.value === period);
    return option?.label || period;
  }

  getStatusLabel(status: string): string {
    const option = this.statusOptions.find(s => s.value === status);
    return option?.label || status;
  }

  getModalidadeLabel(modalidade: string): string {
    const option = this.modalidadeOptions.find(m => m.value === modalidade);
    return option?.label || modalidade;
  }
}
