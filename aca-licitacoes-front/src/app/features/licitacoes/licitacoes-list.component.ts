import { Component, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LicitacoesService, Licitacao, LicStatus } from './licitacoes.service';

import { LicitacaoModalComponent } from './licitacao-modal.component';


type UiStatus = LicStatus | 'all';
type ViewMode = 'table' | 'calendar';

interface CalendarDay {
  date: Date;
  inMonth: boolean;
  items: Licitacao[];
}

@Component({
  standalone: true,
  selector: 'app-licitacoes-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './licitacoes-list.component.html',
  styleUrls: ['./licitacoes-list.component.css'],
})
export class LicitacoesListComponent {

    showModal = signal(false);
  selectedId = signal<string>('');

  private api = inject(LicitacoesService);

  // dados e filtros
  items = signal<Licitacao[]>([]);
  loading = signal(false);
  error = signal('');
  search = signal('');
  status = signal<UiStatus>('all');

  // modo de visualização
  view = signal<ViewMode>('table');

  // calendário (mês atual)
  today = new Date();
  currentMonth = signal(new Date(this.today.getFullYear(), this.today.getMonth(), 1));

  constructor() {
    effect(() => {
      void this.fetch(this.search(), this.status());
    });
  }

  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.search.set(target.value);
  }
  
  onStatus(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.status.set(target.value as UiStatus);
  }
  setView(v: ViewMode) { this.view.set(v); }
  refresh() { void this.fetch(this.search(), this.status()); }

  prevMonth() {
    const d = this.currentMonth();
    this.currentMonth.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }
  nextMonth() {
    const d = this.currentMonth();
    this.currentMonth.set(new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  private fetch(search?: string, status?: UiStatus) {
    this.loading.set(true);
    this.error.set('');
    this.api.list(search, status === 'all' ? undefined : status).subscribe({
      next: data => { this.items.set(data); this.loading.set(false); },
      error: err => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Falha ao carregar licitações.');
      }
    });
  }

  // campo de data para posicionar no calendário
  private getEventDate(lic: Licitacao): Date {
    const iso = lic.sessionDate || lic.submissionDeadline || lic.createdAt;
    return iso ? new Date(iso) : new Date(lic.createdAt);
  }

  // matriz do mês (6 semanas x 7 dias)
  calendarMatrix = computed<CalendarDay[][]>(() => {
    const first = this.currentMonth();
    const year = first.getFullYear();
    const month = first.getMonth();

    // início no domingo (0) ou segunda? Aqui vamos começar em domingo (0)
    const start = new Date(year, month, 1);
    const startDay = start.getDay(); // 0..6
    const gridStart = new Date(year, month, 1 - startDay);

    const weeks: CalendarDay[][] = [];
    // mapeia itens por YYYY-MM-DD
    const map = new Map<string, Licitacao[]>();
    for (const it of this.items()) {
      const d = this.getEventDate(it);
      const key = d.toISOString().slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(it);
    }

    for (let w = 0; w < 6; w++) {
      const row: CalendarDay[] = [];
      for (let d = 0; d < 7; d++) {
        const cellDate = new Date(gridStart);
        cellDate.setDate(gridStart.getDate() + w * 7 + d);
        const key = cellDate.toISOString().slice(0, 10);
        row.push({
          date: cellDate,
          inMonth: cellDate.getMonth() === month,
          items: map.get(key) || [],
        });
      }
      weeks.push(row);
    }
    return weeks;
  });

  monthLabel = computed(() => {
    const d = this.currentMonth();
    const intl = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });
    return intl.format(d);
  });

  badgeClass(s: LicStatus) {
    switch (s) {
      case 'open': return 'bg-emerald-100 text-emerald-700';
      case 'closed': return 'bg-neutral-200 text-neutral-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'awarded': return 'bg-sky-100 text-sky-700';
      default: return 'bg-neutral-100 text-neutral-700'; // draft
    }
  }
}
