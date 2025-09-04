import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Task } from '../../../../core/services/dashboard.service';

@Component({
  selector: 'app-tasks-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tasks-widget.component.html',
  styleUrls: ['./tasks-widget.component.css']
})
export class TasksWidgetComponent {
  @Input() tasks: Task[] = [];
  @Input() loading = false;
  @Output() taskClick = new EventEmitter<Task>();
  @Output() completeTask = new EventEmitter<string>();
  @Output() rescheduleTask = new EventEmitter<Task>();

  constructor(private router: Router) {}

  onTaskClick(task: Task) {
    this.taskClick.emit(task);
    this.router.navigate(['/tenders', task.tender_id]);
  }

  onCompleteTask(taskId: string, event: Event) {
    event.stopPropagation();
    this.completeTask.emit(taskId);
  }

  onRescheduleTask(task: Task, event: Event) {
    event.stopPropagation();
    this.rescheduleTask.emit(task);
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

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'HIGH':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'LOW':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
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

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'Pendente';
      case 'DONE':
        return 'Concluída';
      case 'OVERDUE':
        return 'Atrasada';
      default:
        return status;
    }
  }

  isUrgent(dateTime: string): boolean {
    const now = new Date();
    const dueDate = new Date(dateTime);
    const diffHours = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours <= 24 && diffHours > 0;
  }

  isOverdue(dateTime: string): boolean {
    const now = new Date();
    const dueDate = new Date(dateTime);
    return dueDate.getTime() < now.getTime();
  }

  isToday(dateTime: string): boolean {
    const today = new Date();
    const taskDate = new Date(dateTime);
    return today.toDateString() === taskDate.toDateString();
  }
}
