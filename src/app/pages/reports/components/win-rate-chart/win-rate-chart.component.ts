import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { WinRateData } from '../../../../core/services/reports.service';

@Component({
  selector: 'app-win-rate-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './win-rate-chart.component.html',
  styleUrls: ['./win-rate-chart.component.css']
})
export class WinRateChartComponent implements OnInit, OnDestroy {
  @Input() data: WinRateData[] = [];
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
      type: 'line',
      data: {
        labels: this.data.map(d => d.month),
        datasets: [{
          label: 'Taxa de Vitória',
          data: this.data.map(d => d.value * 100),
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
              font: {
                size: 12
              },
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
            beginAtZero: true,
            max: 100,
            grid: {
              color: '#E5E7EB'
            },
            ticks: {
              color: '#6B7280',
              font: {
                size: 11
              },
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

    this.chart = new Chart(this.chartCanvas.nativeElement, config);
  }

  private updateChart() {
    if (!this.chart) return;

    this.chart.data.labels = this.data.map(d => d.month);
    this.chart.data.datasets[0].data = this.data.map(d => d.value * 100);
    this.chart.update();
  }
}
