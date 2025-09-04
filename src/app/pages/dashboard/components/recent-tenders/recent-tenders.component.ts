import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RecentTender } from '../../../../core/services/dashboard.service';

@Component({
  selector: 'app-recent-tenders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recent-tenders.component.html',
  styleUrls: ['./recent-tenders.component.css']
})
export class RecentTendersComponent {
  @Input() tenders: RecentTender[] = [];
  @Input() loading = false;
  @Output() tenderClick = new EventEmitter<RecentTender>();
  @Output() viewAll = new EventEmitter<void>();

  constructor(private router: Router) {}

  onTenderClick(tender: RecentTender) {
    this.tenderClick.emit(tender);
    this.router.navigate(['/tenders', tender.id]);
  }

  onViewAll() {
    this.viewAll.emit();
    this.router.navigate(['/tenders']);
  }

  formatDateTime(dateTime: string): { date: string; time: string } {
    const date = new Date(dateTime);
    const dateStr = date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
    const timeStr = date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return { date: dateStr, time: timeStr };
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'DRAFT':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
      case 'PREPARING':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      case 'SENT':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'ONGOING':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300';
      case 'WON':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'LOST':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      case 'COMPLETED':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'DRAFT':
        return 'Rascunho';
      case 'PREPARING':
        return 'Preparando';
      case 'SENT':
        return 'Enviado';
      case 'ONGOING':
        return 'Em Andamento';
      case 'WON':
        return 'Vencido';
      case 'LOST':
        return 'Perdido';
      case 'COMPLETED':
        return 'Concluído';
      default:
        return status;
    }
  }

  isUrgent(dateTime: string): boolean {
    const now = new Date();
    const dueDate = new Date(dateTime);
    const diffHours = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours <= 48 && diffHours > 0;
  }

  isOverdue(dateTime: string): boolean {
    const now = new Date();
    const dueDate = new Date(dateTime);
    return dueDate.getTime() < now.getTime();
  }
}
