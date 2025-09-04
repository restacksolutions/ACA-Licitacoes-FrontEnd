import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { StatusByMonth } from '../../../../core/services/reports.service';

@Component({
  selector: 'app-status-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-chart.component.html',
  styleUrls: ['./status-chart.component.css']
})
export class StatusChartComponent implements OnInit, OnDestroy {
  @Input() data: StatusByMonth[] = [];
  @Input() loading = false;
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;

  ngOnInit() {
    Chart.register(...registerables);
    this.createChart();
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  ngOnChanges() {
    if (this.chart && this.data.length > 0) {
      this.updateChart();
    }
  }

  private createChart() {
    if (!this.chartCanvas) return;

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: this.data.map(d => d.month),
        datasets: [
          {
            label: 'Participadas',
            data: this.data.map(d => d.participated),
            backgroundColor: '#6b7280',
            borderColor: '#6b7280',
            borderWidth: 0,
            borderRadius: 6,
            borderSkipped: false
          },
          {
            label: 'Enviadas',
            data: this.data.map(d => d.sent),
            backgroundColor: '#3b82f6',
            borderColor: '#3b82f6',
            borderWidth: 0,
            borderRadius: 6,
            borderSkipped: false
          },
          {
            label: 'Ganhas',
            data: this.data.map(d => d.won),
            backgroundColor: '#10b981',
            borderColor: '#10b981',
            borderWidth: 0,
            borderRadius: 6,
            borderSkipped: false
          },
          {
            label: 'Perdidas',
            data: this.data.map(d => d.lost),
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
              font: {
                size: 12
              },
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
            grid: {
              display: false
            },
            ticks: {
              color: '#6B7280',
              font: {
                size: 11
              }
            }
          },
          y: {
            stacked: true,
            beginAtZero: true,
            grid: {
              color: '#E5E7EB'
            },
            ticks: {
              color: '#6B7280',
              font: {
                size: 11
              }
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    };

    this.chart = new Chart(this.chartCanvas.nativeElement, config);
  }

  private updateChart() {
    if (!this.chart) return;

    this.chart.data.labels = this.data.map(d => d.month);
    this.chart.data.datasets[0].data = this.data.map(d => d.participated);
    this.chart.data.datasets[1].data = this.data.map(d => d.sent);
    this.chart.data.datasets[2].data = this.data.map(d => d.won);
    this.chart.data.datasets[3].data = this.data.map(d => d.lost);
    this.chart.update();
  }

  private getTotalForMonth(monthIndex: number): number {
    if (monthIndex >= 0 && monthIndex < this.data.length) {
      const month = this.data[monthIndex];
      return month.participated + month.sent + month.won + month.lost;
    }
    return 0;
  }
}
