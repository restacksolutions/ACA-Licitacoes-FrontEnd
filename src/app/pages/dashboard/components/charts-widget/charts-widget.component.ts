import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FunnelData, WinRateTrend } from '../../../../core/services/dashboard.service';

@Component({
  selector: 'app-charts-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './charts-widget.component.html',
  styleUrls: ['./charts-widget.component.css']
})
export class ChartsWidgetComponent implements OnInit, OnDestroy {
  @Input() funnel: FunnelData = { participated: 0, sent: 0, won: 0 };
  @Input() winRateTrend: WinRateTrend[] = [];
  @Input() loading = false;
  @Output() chartClick = new EventEmitter<string>();

  funnelData: any[] = [];
  trendData: any[] = [];

  ngOnInit() {
    this.updateFunnelData();
    this.updateTrendData();
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  onFunnelClick(stage: string) {
    this.chartClick.emit(`funnel_${stage}`);
  }

  onTrendClick() {
    this.chartClick.emit('trend');
  }

  private updateFunnelData() {
    this.funnelData = [
      {
        stage: 'Participadas',
        value: this.funnel.participated,
        percentage: 100,
        color: '#3b82f6'
      },
      {
        stage: 'Enviadas',
        value: this.funnel.sent,
        percentage: this.funnel.participated > 0 ? (this.funnel.sent / this.funnel.participated) * 100 : 0,
        color: '#8b5cf6'
      },
      {
        stage: 'Ganhas',
        value: this.funnel.won,
        percentage: this.funnel.participated > 0 ? (this.funnel.won / this.funnel.participated) * 100 : 0,
        color: '#10b981'
      }
    ];
  }

  private updateTrendData() {
    this.trendData = this.winRateTrend.map(item => ({
      date: new Date(item.date).toLocaleDateString('pt-BR', { month: 'short' }),
      value: item.value * 100,
      rawValue: item.value
    }));
  }

  getFunnelWidth(percentage: number): string {
    return `${Math.max(percentage, 10)}%`;
  }

  getFunnelHeight(index: number): string {
    const heights = ['h-16', 'h-12', 'h-8'];
    return heights[index] || 'h-8';
  }

  getTrendColor(value: number): string {
    if (value >= 40) return '#10b981'; // green
    if (value >= 30) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  }

  getTrendGradient(): string {
    const colors = this.trendData.map((_, index) => {
      const value = this.trendData[index]?.value || 0;
      return this.getTrendColor(value);
    });
    
    if (colors.length === 0) return 'linear-gradient(90deg, #3b82f6, #8b5cf6)';
    
    return `linear-gradient(90deg, ${colors.join(', ')})`;
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  getMaxTrendValue(): number {
    return Math.max(...this.trendData.map(d => d.value), 50);
  }

  getTrendBarHeight(value: number): string {
    const max = this.getMaxTrendValue();
    const percentage = (value / max) * 100;
    return `${Math.max(percentage, 10)}%`;
  }
}
