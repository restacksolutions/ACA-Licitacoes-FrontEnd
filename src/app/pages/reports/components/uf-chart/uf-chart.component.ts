import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { ByUF } from '../../../../core/services/reports.service';

@Component({
  selector: 'app-uf-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './uf-chart.component.html',
  styleUrls: ['./uf-chart.component.css']
})
export class UfChartComponent implements OnInit, OnDestroy {
  @Input() data: ByUF[] = [];
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
        labels: this.data.map(d => d.uf),
        datasets: [{
          label: 'Licitações',
          data: this.data.map(d => d.count),
          backgroundColor: '#6B7280',
          borderColor: '#6B7280',
          borderWidth: 0,
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#6B7280',
            borderWidth: 1,
            callbacks: {
              label: (context) => {
                const value = context.parsed.x;
                return `Licitações: ${value}`;
              }
            }
          }
        },
        scales: {
          x: {
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
          },
          y: {
            grid: {
              display: false
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

    this.chart.data.labels = this.data.map(d => d.uf);
    this.chart.data.datasets[0].data = this.data.map(d => d.count);
    this.chart.update();
  }
}
