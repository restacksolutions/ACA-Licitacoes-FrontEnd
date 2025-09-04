import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportsTableItem } from '../../../../core/services/reports.service';

@Component({
  selector: 'app-reports-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports-table.component.html',
  styleUrls: ['./reports-table.component.css']
})
export class ReportsTableComponent {
  @Input() data: ReportsTableItem[] = [];
  @Input() loading = false;
  @Output() exportCSV = new EventEmitter<void>();
  @Output() exportPDF = new EventEmitter<void>();

  // Paginação
  currentPage = 1;
  itemsPerPage = 10;
  pageSizeOptions = [10, 25, 50];

  // Busca
  searchTerm = '';

  // Expor Math para o template
  Math = Math;

  get filteredData(): ReportsTableItem[] {
    if (!this.searchTerm) {
      return this.data;
    }
    
    const term = this.searchTerm.toLowerCase();
    return this.data.filter(item => 
      item.title.toLowerCase().includes(term) ||
      item.orgao.toLowerCase().includes(term) ||
      item.uf.toLowerCase().includes(term) ||
      item.modalidade.toLowerCase().includes(term) ||
      item.status.toLowerCase().includes(term)
    );
  }

  get paginatedData(): ReportsTableItem[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredData.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.itemsPerPage);
  }

  get totalItems(): number {
    return this.filteredData.length;
  }

  onPageSizeChange(size: number) {
    this.itemsPerPage = size;
    this.currentPage = 1;
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  onSearchChange(term: string) {
    this.searchTerm = term;
    this.currentPage = 1;
  }

  onExportCSV() {
    this.exportCSV.emit();
  }

  onExportPDF() {
    this.exportPDF.emit();
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  formatCurrency(amount: number | null): string {
    if (!amount) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'WON':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'LOST':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      case 'SENT':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      case 'ONGOING':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'WON':
        return 'Ganha';
      case 'LOST':
        return 'Perdida';
      case 'SENT':
        return 'Enviada';
      case 'ONGOING':
        return 'Em Andamento';
      default:
        return status;
    }
  }

  getPages(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}
