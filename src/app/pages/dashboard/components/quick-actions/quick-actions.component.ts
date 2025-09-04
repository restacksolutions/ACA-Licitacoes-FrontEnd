import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quick-actions.component.html',
  styleUrls: ['./quick-actions.component.css']
})
export class QuickActionsComponent {
  @Output() actionClick = new EventEmitter<string>();

  constructor(private router: Router) {}

  onNewTender() {
    this.actionClick.emit('new_tender');
    this.router.navigate(['/tenders/new']);
  }

  onImportVehicles() {
    this.actionClick.emit('import_vehicles');
    this.router.navigate(['/vehicles'], { queryParams: { tab: 'import' } });
  }

  onGenerateDocument() {
    this.actionClick.emit('generate_document');
    // Navegar para a primeira licitação que precisa de documento
    this.router.navigate(['/tenders'], { queryParams: { filter: 'pending_docs' } });
  }

  onViewReports() {
    this.actionClick.emit('view_reports');
    this.router.navigate(['/reports']);
  }

  onViewCalendar() {
    this.actionClick.emit('view_calendar');
    this.router.navigate(['/calendar']);
  }

  onViewSettings() {
    this.actionClick.emit('view_settings');
    this.router.navigate(['/settings']);
  }
}
