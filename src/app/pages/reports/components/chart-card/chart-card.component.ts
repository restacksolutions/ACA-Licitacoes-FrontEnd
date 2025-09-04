import { Component, Input, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chart-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chart-card.component.html',
  styleUrls: ['./chart-card.component.css']
})
export class ChartCardComponent {
  @Input() title: string = '';
  @Input() subtitle?: string;
  @Input() loading = false;
  @Input() height = 'h-72';
  @Input() actions?: TemplateRef<any>;
}
