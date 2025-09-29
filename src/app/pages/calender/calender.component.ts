import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { EventInput, CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { LicitacoesService, Licitacao, LicitacaoStatus, LicitacaoListResponse } from '../licitacoes/licitacoes-list/licitacoes.service';
import { ApiService } from '../../core/services/api.service';
import { switchMap } from 'rxjs/operators';

interface TenderEvent extends EventInput {
  extendedProps: {
    tenderId: string;
    status: LicitacaoStatus;
    organ: string;
    modality: string;
    saleValue?: string;
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
  loading = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private licitacoesService: LicitacoesService,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.initializeCalendar();
    this.loadTenderEvents();
  }

  private loadTenderEvents() {
    this.loading = true;
    this.error = null;

    this.apiService.getCompanies().pipe(
      switchMap((companies: any[]) => {
        if (companies.length === 0) {
          throw new Error('Nenhuma empresa encontrada');
        }
        
        const companyData = companies[0];
        const company = companyData.company || companyData;
        const companyId = company.id;
        
        if (!companyId) {
          throw new Error('ID da empresa não encontrado');
        }

        return this.licitacoesService.getLicitacoes(companyId, { pageSize: 100 });
      })
    ).subscribe({
      next: (response: LicitacaoListResponse) => {
        this.events = this.convertLicitacoesToEvents(response.licitacoes);
        this.loading = false;
        
        // Aguardar um pouco para garantir que o calendário esteja carregado
        setTimeout(() => {
          this.updateCalendarEvents();
        }, 100);
      },
      error: (error: any) => {
        this.error = error.message || 'Erro ao carregar licitações';
        this.loading = false;
        // Fallback para dados mock em caso de erro
        this.loadMockEvents();
      }
    });
  }

  private convertLicitacoesToEvents(licitacoes: Licitacao[]): TenderEvent[] {
    console.log('🔍 [Calendário] Convertendo licitações para eventos:', licitacoes);
    
    const events = licitacoes.map(licitacao => {
      // Priorizar submissionDeadline (data de finalização), depois sessionAt, senão data atual
      let eventDate = new Date();
      let eventTitle = licitacao.title;
      
      if (licitacao.submissionDeadline) {
        eventDate = new Date(licitacao.submissionDeadline);
        eventTitle = `📅 ${licitacao.title}`; // Ícone para indicar prazo
        console.log('📅 [Calendário] Usando submissionDeadline:', licitacao.submissionDeadline, 'Data:', eventDate);
      } else if (licitacao.sessionAt) {
        eventDate = new Date(licitacao.sessionAt);
        eventTitle = `🏛️ ${licitacao.title}`; // Ícone para indicar sessão
        console.log('🏛️ [Calendário] Usando sessionAt:', licitacao.sessionAt, 'Data:', eventDate);
      }

      // Adicionar informações adicionais no título
      const organInfo = licitacao.orgao ? ` - ${licitacao.orgao}` : '';
      const modalityInfo = licitacao.modalidade ? ` (${licitacao.modalidade})` : '';
      const fullTitle = `${eventTitle}${organInfo}${modalityInfo}`;

      const event = {
        id: licitacao.id,
        title: fullTitle,
        start: eventDate.toISOString(),
        allDay: true, // Eventos de dia inteiro
        extendedProps: {
          tenderId: licitacao.id,
          status: licitacao.status,
          organ: licitacao.orgao || 'N/A',
          modality: licitacao.modalidade || 'N/A',
          saleValue: licitacao.saleValue,
          submissionDeadline: licitacao.submissionDeadline,
          sessionAt: licitacao.sessionAt
        }
      };

      console.log('✅ [Calendário] Evento criado:', event);
      return event;
    });

    console.log('📊 [Calendário] Total de eventos criados:', events.length);
    return events;
  }

  private loadMockEvents() {
    // Fallback para dados mock em caso de erro
    this.events = [
      {
        id: 'mock-1',
        title: 'Licitação de Veículos - SEDUC/PR',
        start: new Date().toISOString().split('T')[0],
        extendedProps: {
          tenderId: 'mock-1',
          status: 'open' as LicitacaoStatus,
          organ: 'SEDUC',
          modality: 'Pregão Eletrônico'
        }
      },
      {
        id: 'mock-2',
        title: 'Aquisição de Equipamentos - SESA/SP',
        start: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        extendedProps: {
          tenderId: 'mock-2',
          status: 'closed' as LicitacaoStatus,
          organ: 'SESA',
          modality: 'Concorrência'
        }
      }
    ];
  }

  private initializeCalendar() {
    this.calendarOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      selectable: false,
      events: [], // Inicializar vazio
      eventClick: (info) => this.handleEventClick(info),
      eventContent: (arg) => this.renderEventContent(arg),
      height: 'auto',
      aspectRatio: 1.8,
      dayMaxEvents: 3,
      moreLinkClick: 'popover',
      eventDisplay: 'block',
      eventTextColor: 'white',
      eventBackgroundColor: '#3b82f6'
    };
  }

  handleEventClick(clickInfo: EventClickArg) {
    const event = clickInfo.event as any;
    const tenderId = event.extendedProps.tenderId;
    
    console.log('🔍 [Calendário] Clicou na licitação:', {
      id: tenderId,
      title: event.title,
      status: event.extendedProps.status,
      organ: event.extendedProps.organ,
      modality: event.extendedProps.modality
    });
    
    // Navegar para a página de detalhes da licitação
    this.router.navigate(['/licitacoes', tenderId]);
  }

  renderEventContent(eventInfo: any) {
    const status = eventInfo.event.extendedProps.status;
    const colorClass = this.getStatusColorClass(status);
    const statusLabel = this.getStatusLabel(status);
    
    return {
      html: `
        <div class="event-fc-color flex fc-event-main ${colorClass} p-2 rounded-sm cursor-pointer hover:opacity-80 transition-opacity">
          <div class="fc-daygrid-event-dot mr-2"></div>
          <div class="flex-1 min-w-0">
            <div class="fc-event-title text-sm font-medium truncate">${eventInfo.event.title}</div>
            <div class="fc-event-status text-xs opacity-75 mt-1">${statusLabel}</div>
          </div>
        </div>
      `
    };
  }

  private getStatusColorClass(status: LicitacaoStatus): string {
    switch (status) {
      case 'draft':
        return 'fc-bg-gray-500';
      case 'open':
        return 'fc-bg-blue-500';
      case 'closed':
        return 'fc-bg-gray-600';
      case 'cancelled':
        return 'fc-bg-red-500';
      case 'awarded':
        return 'fc-bg-green-500';
      default:
        return 'fc-bg-blue-500';
    }
  }

  private getStatusLabel(status: LicitacaoStatus): string {
    switch (status) {
      case 'draft':
        return 'Rascunho';
      case 'open':
        return 'Aberta';
      case 'closed':
        return 'Fechada';
      case 'cancelled':
        return 'Cancelada';
      case 'awarded':
        return 'Homologada';
      default:
        return 'Desconhecido';
    }
  }

  private updateCalendarEvents() {
    console.log('🔄 [Calendário] Atualizando eventos do calendário...');
    console.log('📋 [Calendário] Eventos para adicionar:', this.events);
    
    if (this.calendarComponent) {
      const calendarApi = this.calendarComponent.getApi();
      calendarApi.removeAllEvents();
      
      // Adicionar cada evento individualmente
      this.events.forEach(event => {
        calendarApi.addEvent(event);
        console.log('➕ [Calendário] Evento adicionado:', event.title);
      });
      
      console.log('✅ [Calendário] Eventos atualizados no calendário');
    } else {
      console.warn('⚠️ [Calendário] CalendarComponent não encontrado');
    }
  }
}
