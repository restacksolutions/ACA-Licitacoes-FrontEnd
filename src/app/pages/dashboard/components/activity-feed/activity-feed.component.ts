import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ActivityEvent } from '../../../../core/services/dashboard.service';

@Component({
  selector: 'app-activity-feed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-feed.component.html',
  styleUrls: ['./activity-feed.component.css']
})
export class ActivityFeedComponent {
  @Input() activities: ActivityEvent[] = [];
  @Input() loading = false;
  @Output() activityClick = new EventEmitter<ActivityEvent>();

  constructor(private router: Router) {}

  onActivityClick(activity: ActivityEvent) {
    this.activityClick.emit(activity);
    this.router.navigate(['/tenders', activity.tender_id]);
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'STATUS_CHANGE':
        return 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4';
      case 'DOCUMENT_GENERATED':
        return 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
      case 'RESULT_REGISTERED':
        return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'TASK_COMPLETED':
        return 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4';
      default:
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }

  getActivityColor(type: string): string {
    switch (type) {
      case 'STATUS_CHANGE':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      case 'DOCUMENT_GENERATED':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'RESULT_REGISTERED':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300';
      case 'TASK_COMPLETED':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  }

  formatDateTime(dateTime: string): string {
    const date = new Date(dateTime);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) {
      return 'Agora mesmo';
    } else if (diffMins < 60) {
      return `${diffMins} min atrás`;
    } else if (diffHours < 24) {
      return `${diffHours}h atrás`;
    } else if (diffDays < 7) {
      return `${diffDays} dias atrás`;
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  getActivityTypeLabel(type: string): string {
    switch (type) {
      case 'STATUS_CHANGE':
        return 'Status alterado';
      case 'DOCUMENT_GENERATED':
        return 'Documento gerado';
      case 'RESULT_REGISTERED':
        return 'Resultado registrado';
      case 'TASK_COMPLETED':
        return 'Tarefa concluída';
      default:
        return 'Atividade';
    }
  }
}
