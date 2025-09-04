import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsKPIs } from '../../../../core/services/reports.service';

@Component({
  selector: 'app-kpi-strip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kpi-strip.component.html',
  styleUrls: ['./kpi-strip.component.css']
})
export class KpiStripComponent {
  @Input() kpis: ReportsKPIs = {
    participated: 0,
    sent: 0,
    won: 0,
    win_rate: 0
  };
  @Input() loading = false;

  formatWinRate(rate: number): string {
    return (rate * 100).toFixed(1) + '%';
  }
}
