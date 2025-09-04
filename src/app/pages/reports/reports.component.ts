import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ReportsService, ReportsData, ReportsFilters } from '../../core/services/reports.service';

// Import essential reports components only
import { KpiStripComponent } from './components/kpi-strip/kpi-strip.component';
import { ChartCardComponent } from './components/chart-card/chart-card.component';
import { WinRateChartComponent } from './components/win-rate-chart/win-rate-chart.component';
import { StatusChartComponent } from './components/status-chart/status-chart.component';
import { LossReasonsChartComponent } from './components/loss-reasons-chart/loss-reasons-chart.component';
import { ReportsTableComponent } from './components/reports-table/reports-table.component';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    KpiStripComponent,
    ChartCardComponent,
    WinRateChartComponent,
    StatusChartComponent,
    LossReasonsChartComponent,
    ReportsTableComponent
  ],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit, OnDestroy {
  reportsData: ReportsData | null = null;
  loading = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(private reportsService: ReportsService) {}

  ngOnInit() {
    this.loadReportsData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
}