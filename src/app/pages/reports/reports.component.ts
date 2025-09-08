import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { ReportsService, ReportsData, ReportsFilters, ReportsKPIs, WinRateData, StatusByMonth, LossReason, ReportsTableItem } from '../../core/services/reports.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit, OnDestroy {
  reportsData: ReportsData | null = null;
  loading = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  // Chart references
  @ViewChild('winRateChart', { static: true }) winRateChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusChart', { static: true }) statusChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lossReasonsChart', { static: true }) lossReasonsChart!: ElementRef<HTMLCanvasElement>;

  // Charts instances
  private winRateChartInstance: Chart | null = null;
  private statusChartInstance: Chart | null = null;
  private lossReasonsChartInstance: Chart | null = null;

  // Table properties
  currentPage = 1;
  itemsPerPage = 10;
  pageSizeOptions = [10, 25, 50];
  searchTerm = '';

  // Expose Math for template
  Math = Math;

  constructor(private reportsService: ReportsService) {}

  ngOnInit() {
    Chart.register(...registerables);
    this.loadReportsData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Destroy charts
    if (this.winRateChartInstance) {
      this.winRateChartInstance.destroy();
    }
    if (this.statusChartInstance) {
      this.statusChartInstance.destroy();
    }
    if (this.lossReasonsChartInstance) {
      this.lossReasonsChartInstance.destroy();
    }
  }

  loadReportsData() {
    this.loading = true;
    this.error = null;

    this.reportsService.getReportsData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.reportsData = data;
          this.loading = false;
          
          // Create charts after data is loaded
          setTimeout(() => {
            this.createCharts();
          }, 100);
        },
        error: (error) => {
          this.error = 'Erro ao carregar dados dos relatórios';
          this.loading = false;
          console.error('Reports error:', error);
        }
      });
  }

  onExportCSV() {
    if (this.reportsData) {
      this.reportsService.exportToCSV(this.reportsData.table);
    }
  }

  onExportPDF() {
    if (this.reportsData) {
      this.reportsService.exportToPDF(this.reportsData.table);
    }
  }

  get hasData(): boolean {
    return this.reportsData !== null && !this.loading;
  }

  get hasError(): boolean {
    return this.error !== null;
  }

  // KPI Strip methods
  formatWinRate(rate: number): string {
    return (rate * 100).toFixed(1) + '%';
  }

  // Chart creation methods
  private createCharts() {
    if (this.reportsData) {
      this.createWinRateChart();
      this.createStatusChart();
      this.createLossReasonsChart();
    }
  }

  private createWinRateChart() {
    if (!this.winRateChart || !this.reportsData) return;

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: this.reportsData.winRateSeries.map(d => d.month),
        datasets: [{
          label: 'Taxa de Vitória',
          data: this.reportsData.winRateSeries.map(d => d.value * 100),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          tension: 0.35,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: { size: 12 },
              color: '#374151',
              usePointStyle: true,
              pointStyle: 'line'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#10b981',
            borderWidth: 1,
            callbacks: {
              label: (context) => {
                const value = context.parsed.y;
                return `Taxa de Vitória: ${value.toFixed(1)}%`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: '#6B7280',
              font: { size: 11 }
            }
          },
          y: {
            beginAtZero: true,
            max: 100,
            grid: { color: '#E5E7EB' },
            ticks: {
              color: '#6B7280',
              font: { size: 11 },
              callback: (value) => `${value}%`
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    };

    this.winRateChartInstance = new Chart(this.winRateChart.nativeElement, config);
  }

  private createStatusChart() {
    if (!this.statusChart || !this.reportsData) return;

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: this.reportsData.statusByMonth.map(d => d.month),
        datasets: [
          {
            label: 'Participadas',
            data: this.reportsData.statusByMonth.map(d => d.participated),
            backgroundColor: '#6b7280',
            borderColor: '#6b7280',
            borderWidth: 0,
            borderRadius: 6,
            borderSkipped: false
          },
          {
            label: 'Enviadas',
            data: this.reportsData.statusByMonth.map(d => d.sent),
            backgroundColor: '#3b82f6',
            borderColor: '#3b82f6',
            borderWidth: 0,
            borderRadius: 6,
            borderSkipped: false
          },
          {
            label: 'Ganhas',
            data: this.reportsData.statusByMonth.map(d => d.won),
            backgroundColor: '#10b981',
            borderColor: '#10b981',
            borderWidth: 0,
            borderRadius: 6,
            borderSkipped: false
          },
          {
            label: 'Perdidas',
            data: this.reportsData.statusByMonth.map(d => d.lost),
            backgroundColor: '#ef4444',
            borderColor: '#ef4444',
            borderWidth: 0,
            borderRadius: 6,
            borderSkipped: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: { size: 12 },
              color: '#374151',
              usePointStyle: true,
              pointStyle: 'rect'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#10b981',
            borderWidth: 1,
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const value = context.parsed.y;
                const total = this.getTotalForMonth(context.dataIndex);
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        },
        scales: {
          x: {
            stacked: true,
            grid: { display: false },
            ticks: {
              color: '#6B7280',
              font: { size: 11 }
            }
          },
          y: {
            stacked: true,
            beginAtZero: true,
            grid: { color: '#E5E7EB' },
            ticks: {
              color: '#6B7280',
              font: { size: 11 }
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    };

    this.statusChartInstance = new Chart(this.statusChart.nativeElement, config);
  }

  private createLossReasonsChart() {
    if (!this.lossReasonsChart || !this.reportsData) return;

    const colors = [
      '#ef4444', // Vermelho
      '#f59e0b', // Amarelo
      '#3b82f6', // Azul
      '#8b5cf6', // Roxo
      '#6b7280'  // Cinza
    ];

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: this.reportsData.lossReasons.map(d => d.reason),
        datasets: [{
          data: this.reportsData.lossReasons.map(d => d.count),
          backgroundColor: colors.slice(0, this.reportsData.lossReasons.length),
          borderColor: '#ffffff',
          borderWidth: 2,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'right',
            labels: {
              font: { size: 12 },
              color: '#374151',
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 20
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#10b981',
            borderWidth: 1,
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed;
                const total = this.reportsData!.lossReasons.reduce((sum, item) => sum + item.count, 0);
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        },
        interaction: {
          intersect: false
        }
      }
    };

    this.lossReasonsChartInstance = new Chart(this.lossReasonsChart.nativeElement, config);
  }

  private getTotalForMonth(monthIndex: number): number {
    if (!this.reportsData || monthIndex < 0 || monthIndex >= this.reportsData.statusByMonth.length) {
      return 0;
    }
    const month = this.reportsData.statusByMonth[monthIndex];
    return month.participated + month.sent + month.won + month.lost;
  }

  // Table methods
  get filteredData(): ReportsTableItem[] {
    if (!this.reportsData || !this.searchTerm) {
      return this.reportsData?.table || [];
    }
    
    const term = this.searchTerm.toLowerCase();
    return this.reportsData.table.filter(item => 
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