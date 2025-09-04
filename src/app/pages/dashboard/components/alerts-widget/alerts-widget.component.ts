import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Alert } from '../../../../core/services/dashboard.service';

@Component({
  selector: 'app-alerts-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alerts-widget.component.html',
  styleUrls: ['./alerts-widget.component.css']
})
export class AlertsWidgetComponent {
  @Input() alerts: Alert[] = [];
  @Input() loading = false;
  @Output() alertClick = new EventEmitter<Alert>();
  @Output() dismissAlert = new EventEmitter<string>();

  constructor(private router: Router) {}

  onAlertClick(alert: Alert) {
    this.alertClick.emit(alert);
    this.router.navigate(['/tenders', alert.tender_id]);
  }

  onDismissAlert(alertId: string, event: Event) {
    event.stopPropagation();
    this.dismissAlert.emit(alertId);
  }

  getAlertIcon(type: string): string {
    switch (type) {
      case 'RETIFICACAO':
        return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z';
      case 'DEADLINE':
        return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'ERROR':
        return 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'SUCCESS':
        return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      default:
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }

  getAlertColor(type: string): string {
    switch (type) {
      case 'RETIFICACAO':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300';
      case 'DEADLINE':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      case 'ERROR':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      case 'SUCCESS':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      default:
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'HIGH':
        return 'border-l-red-500';
      case 'MEDIUM':
        return 'border-l-yellow-500';
      case 'LOW':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-500';
    }
  }

  formatDateTime(dateTime: string): string {
    const date = new Date(dateTime);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getActionText(type: string): string {
    switch (type) {
      case 'RETIFICACAO':
        return 'Revisar';
      case 'DEADLINE':
        return 'Abrir licitação';
      case 'ERROR':
        return 'Reprocessar';
      case 'SUCCESS':
        return 'Ver detalhes';
      default:
        return 'Abrir';
    }
  }
}
