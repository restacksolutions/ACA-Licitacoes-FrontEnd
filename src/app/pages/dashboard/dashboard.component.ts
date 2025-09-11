import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { DashboardService, DashboardData, DashboardKPIs, AgendaEvent, RecentTender } from '../dashboard/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  dashboardData: DashboardData | null = null;
  loading = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  // Auto-refresh settings
  private refreshInterval: any;
  private readonly REFRESH_INTERVAL_MS = 120000; // 2 minutes

  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadDashboardData();
    this.startAutoRefresh();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopAutoRefresh();
  }

  loadDashboardData() {
    this.loading = true;
    this.error = null;

    this.dashboardService.getDashboardData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.dashboardData = data;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Erro ao carregar dados do dashboard';
          this.loading = false;
          console.error('Dashboard error:', error);
        }
      });
  }

  // KPI Cards methods
  onKpiClick(kpiType: string) {
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
    }
  }

  formatWinRate(rate: number): string {
    return (rate * 100).toFixed(1) + '%';
  }

  // Agenda Widget methods
  onEventClick(event: AgendaEvent) {
    this.router.navigate(['/tenders', event.tender_id]);
  }

  onViewCalendar() {
    this.router.navigate(['/calendar']);
  }

  formatDateTime(dateTime: string): { date: string; time: string } {
    const date = new Date(dateTime);
    const dateStr = date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
    const timeStr = date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return { date: dateStr, time: timeStr };
  }

  isToday(dateTime: string): boolean {
    const today = new Date();
    const eventDate = new Date(dateTime);
    return today.toDateString() === eventDate.toDateString();
  }

  isTomorrow(dateTime: string): boolean {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const eventDate = new Date(dateTime);
    return tomorrow.toDateString() === eventDate.toDateString();
  }

  // Recent Tenders methods
  onTenderClick(tender: RecentTender) {
    this.router.navigate(['/tenders', tender.id]);
  }

  onViewAll() {
    this.router.navigate(['/tenders']);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'DRAFT':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
      case 'PREPARING':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      case 'SENT':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'ONGOING':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300';
      case 'WON':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'LOST':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      case 'COMPLETED':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'DRAFT':
        return 'Rascunho';
      case 'PREPARING':
        return 'Preparando';
      case 'SENT':
        return 'Enviado';
      case 'ONGOING':
        return 'Em Andamento';
      case 'WON':
        return 'Vencido';
      case 'LOST':
        return 'Perdido';
      case 'COMPLETED':
        return 'Concluído';
      default:
        return status;
    }
  }

  onRefresh() {
    this.loadDashboardData();
  }

  private startAutoRefresh() {
    this.refreshInterval = setInterval(() => {
      this.loadDashboardData();
    }, this.REFRESH_INTERVAL_MS);
  }

  private stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  get hasData(): boolean {
    return this.dashboardData !== null && !this.loading;
  }

  get hasError(): boolean {
    return this.error !== null;
  }
}
