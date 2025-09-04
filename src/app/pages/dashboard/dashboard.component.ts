import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { DashboardService, DashboardData } from '../../core/services/dashboard.service';

// Import essential dashboard components only
import { KpiCardsComponent } from './components/kpi-cards/kpi-cards.component';
import { AgendaWidgetComponent } from './components/agenda-widget/agenda-widget.component';
import { RecentTendersComponent } from './components/recent-tenders/recent-tenders.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    KpiCardsComponent,
    AgendaWidgetComponent,
    RecentTendersComponent
  ],
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

  onKpiClick(kpiType: string) {
    console.log('KPI clicked:', kpiType);
    // Navigation is handled in the KPI component
  }

  onEventClick(event: any) {
    console.log('Event clicked:', event);
    // Navigation is handled in the Agenda component
  }

  onViewCalendar() {
    console.log('View calendar clicked');
    // Navigation is handled in the Agenda component
  }

  onTenderClick(tender: any) {
    console.log('Tender clicked:', tender);
    // Navigation is handled in the RecentTenders component
  }

  onViewAll() {
    console.log('View all tenders clicked');
    // Navigation is handled in the RecentTenders component
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
