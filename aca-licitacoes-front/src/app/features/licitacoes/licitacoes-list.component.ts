import { Component, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LicitacoesService, Licitacao, LicStatus, CreateLicitacaoDto, UpdateLicitacaoDto } from './licitacoes.service';

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
  imports: [CommonModule, FormsModule, LicitacaoModalComponent],
  templateUrl: './licitacoes-list.component.html',
  styleUrls: ['./licitacoes-list.component.css'],
})
export class LicitacoesListComponent {

  showModal = signal(false);
  selectedId = signal<string>('');
  showCreateModal = signal(false);
  showEditModal = signal(false);
  editingLicitacao = signal<Licitacao | null>(null);

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

  // formulário de criação/edição
  formData = signal<CreateLicitacaoDto>({
    title: '',
    status: 'draft',
    editalUrl: '',
    sessionDate: '',
    submissionDeadline: ''
  });
  formLoading = signal(false);
  formError = signal('');

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

  statusLabel(s: LicStatus) {
    switch (s) {
      case 'draft': return 'Rascunho';
      case 'open': return 'Aberta';
      case 'closed': return 'Encerrada';
      case 'cancelled': return 'Cancelada';
      case 'awarded': return 'Adjudicada';
      default: return s;
    }
  }

  badgeClass(s: LicStatus) {
    switch (s) {
      case 'open': return 'bg-emerald-100 text-emerald-700';
      case 'closed': return 'bg-neutral-200 text-neutral-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'awarded': return 'bg-sky-100 text-sky-700';
      default: return 'bg-neutral-100 text-neutral-700'; // draft
    }
  }

  // Ações do modal
  openModal(id: string) {
    this.selectedId.set(id);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.selectedId.set('');
  }

  // Ações de criação
  openCreateModal() {
    this.formData.set({
      title: '',
      status: 'draft',
      editalUrl: '',
      sessionDate: '',
      submissionDeadline: ''
    });
    this.formError.set('');
    this.showCreateModal.set(true);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
    this.formError.set('');
  }

  // Ações de edição
  openEditModal(licitacao: Licitacao) {
    this.editingLicitacao.set(licitacao);
    this.formData.set({
      title: licitacao.title,
      status: licitacao.status,
      editalUrl: licitacao.editalUrl || '',
      sessionDate: licitacao.sessionDate ? new Date(licitacao.sessionDate).toISOString().slice(0, 16) : '',
      submissionDeadline: licitacao.submissionDeadline ? new Date(licitacao.submissionDeadline).toISOString().slice(0, 16) : ''
    });
    this.formError.set('');
    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.editingLicitacao.set(null);
    this.formError.set('');
  }

  // Salvar licitação
  saveLicitacao() {
    if (!this.formData().title.trim()) {
      this.formError.set('Título é obrigatório');
      return;
    }

    this.formLoading.set(true);
    this.formError.set('');

    const data = { ...this.formData() };
    if (data.sessionDate) {
      data.sessionDate = new Date(data.sessionDate).toISOString();
    }
    if (data.submissionDeadline) {
      data.submissionDeadline = new Date(data.submissionDeadline).toISOString();
    }

    const operation = this.editingLicitacao() 
      ? this.api.update(this.editingLicitacao()!.id, data as UpdateLicitacaoDto)
      : this.api.create(data);

    operation.subscribe({
      next: () => {
        this.formLoading.set(false);
        this.closeCreateModal();
        this.closeEditModal();
        this.refresh();
      },
      error: (err) => {
        this.formLoading.set(false);
        this.formError.set(err?.error?.message || 'Erro ao salvar licitação');
      }
    });
  }

  // Excluir licitação
  deleteLicitacao(licitacao: Licitacao) {
    if (!confirm(`Tem certeza que deseja excluir a licitação "${licitacao.title}"?`)) {
      return;
    }

    this.loading.set(true);
    this.api.remove(licitacao.id).subscribe({
      next: () => {
        this.loading.set(false);
        this.refresh();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Erro ao excluir licitação');
      }
    });
  }
}
