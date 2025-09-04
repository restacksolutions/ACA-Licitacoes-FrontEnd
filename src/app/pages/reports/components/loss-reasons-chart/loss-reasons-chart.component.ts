import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { LossReason } from '../../../../core/services/reports.service';

@Component({
  selector: 'app-loss-reasons-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loss-reasons-chart.component.html',
  styleUrls: ['./loss-reasons-chart.component.css']
})
export class LossReasonsChartComponent implements OnInit, OnDestroy {
  @Input() data: LossReason[] = [];
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
        labels: this.data.map(d => d.reason),
        datasets: [{
          data: this.data.map(d => d.count),
          backgroundColor: colors.slice(0, this.data.length),
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
              font: {
                size: 12
              },
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
                const total = this.data.reduce((sum, item) => sum + item.count, 0);
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

    this.chart = new Chart(this.chartCanvas.nativeElement, config);
  }

  private updateChart() {
    if (!this.chart) return;

    this.chart.data.labels = this.data.map(d => d.reason);
    this.chart.data.datasets[0].data = this.data.map(d => d.count);
    this.chart.update();
  }
}
