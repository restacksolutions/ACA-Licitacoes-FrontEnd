import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { EventInput, CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

interface TenderEvent extends EventInput {
  extendedProps: {
    tenderId: string;
    status: string;
    organ: string;
    uf: string;
    modality: string;
  };
}

@Component({
  selector: 'app-calender',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './calender.component.html',
  styles: ``
})
export class CalenderComponent implements OnInit {

  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  events: TenderEvent[] = [];
  calendarOptions!: CalendarOptions;

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadTenderEvents();
    this.initializeCalendar();
  }

  private loadTenderEvents() {
    // Mock data for tender events
    this.events = [
      {
        id: '1',
        title: 'Licitação de Veículos - SEDUC/PR',
        start: new Date().toISOString().split('T')[0],
        extendedProps: {
          tenderId: '1',
          status: 'ONGOING',
          organ: 'SEDUC',
          uf: 'PR',
          modality: 'Pregão Eletrônico'
        }
      },
      {
        id: '2',
        title: 'Aquisição de Equipamentos - SESA/SP',
        start: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        extendedProps: {
          tenderId: '2',
          status: 'SENT',
          organ: 'SESA',
          uf: 'SP',
          modality: 'Concorrência'
        }
      },
      {
        id: '3',
        title: 'Contratação de Serviços - SEFAZ/RJ',
        start: new Date(Date.now() + 172800000).toISOString().split('T')[0],
        end: new Date(Date.now() + 259200000).toISOString().split('T')[0],
        extendedProps: {
          tenderId: '3',
          status: 'PREPARING',
          organ: 'SEFAZ',
          uf: 'RJ',
          modality: 'Tomada de Preços'
        }
      }
    ];
  }

  private initializeCalendar() {
    this.calendarOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      selectable: false,
      events: this.events,
      eventClick: (info) => this.handleEventClick(info),
      eventContent: (arg) => this.renderEventContent(arg)
    };
  }

  handleEventClick(clickInfo: EventClickArg) {
    const event = clickInfo.event as any;
    const tenderId = event.extendedProps.tenderId;
    this.router.navigate(['/tenders', tenderId]);
  }

  renderEventContent(eventInfo: any) {
    const status = eventInfo.event.extendedProps.status;
    const colorClass = this.getStatusColorClass(status);
    
    return {
      html: `
        <div class="event-fc-color flex fc-event-main ${colorClass} p-1 rounded-sm">
          <div class="fc-daygrid-event-dot"></div>
          <div class="fc-event-time">${eventInfo.timeText || ''}</div>
          <div class="fc-event-title">${eventInfo.event.title}</div>
        </div>
      `
    };
  }

  private getStatusColorClass(status: string): string {
    switch (status) {
      case 'ONGOING':
        return 'fc-bg-primary';
      case 'SENT':
        return 'fc-bg-warning';
      case 'PREPARING':
        return 'fc-bg-success';
      case 'WON':
        return 'fc-bg-success';
      case 'LOST':
        return 'fc-bg-danger';
      default:
        return 'fc-bg-primary';
    }
  }
}
