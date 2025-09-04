import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AgendaEvent } from '../../../../core/services/dashboard.service';

@Component({
  selector: 'app-agenda-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agenda-widget.component.html',
  styleUrls: ['./agenda-widget.component.css']
})
export class AgendaWidgetComponent {
  @Input() events: AgendaEvent[] = [];
  @Input() loading = false;
  @Output() eventClick = new EventEmitter<AgendaEvent>();
  @Output() viewCalendar = new EventEmitter<void>();

  constructor(private router: Router) {}

  onEventClick(event: AgendaEvent) {
    this.eventClick.emit(event);
    this.router.navigate(['/tenders', event.tender_id]);
  }

  onViewCalendar() {
    this.viewCalendar.emit();
    this.router.navigate(['/calendar']);
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
      case 'PENDING':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      case 'DONE':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'OVERDUE':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'DEADLINE':
        return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'MEETING':
        return 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z';
      case 'TASK':
        return 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4';
      default:
        return 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z';
    }
  }

  isToday(dateTime: string): boolean {
    const today = new Date();
    const eventDate = new Date(dateTime);
    return today.toDateString() === eventDate.toDateString();
  }

  isTomorrow(dateTime: string): boolean {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const eventDate = new Date(dateTime);
    return tomorrow.toDateString() === eventDate.toDateString();
  }
}
