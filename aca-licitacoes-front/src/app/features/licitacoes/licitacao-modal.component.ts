import { Component, effect, inject, input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LicitacoesService, Licitacao } from './licitacoes.service';

interface LicDoc {
  id?: string;
  name: string;
  docType?: string;
  required?: boolean;
  submitted?: boolean;
  signed?: boolean;
  issueDate?: string;
  expiresAt?: string;
  notes?: string;
}

type Tab = 'geral' | 'documentos';

@Component({
  standalone: true,
  selector: 'app-licitacao-modal',
  imports: [CommonModule],
  templateUrl: './licitacao-modal.component.html',
  styleUrls: ['./licitacao-modal.component.css'],
})
export class LicitacaoModalComponent {
  private api = inject(LicitacoesService);

  // Inputs
  licId = input<string>('');
  open = input<boolean>(false);

  // Outputs
  @Output() closed = new EventEmitter<void>();

  // State
  tab = signal<Tab>('geral');
  loading = signal(false);
  error = signal('');
  lic = signal<Licitacao | null>(null);
  docs = signal<LicDoc[]>([]);

  constructor() {
    // sempre que open() ou licId() mudarem para um estado válido, carregue
    effect(() => {
      if (this.open() && this.licId()) {
        this.load(this.licId()!);
      }
    });
  }

  setTab(t: Tab) { this.tab.set(t); }

  private load(id: string) {
    this.loading.set(true);
    this.error.set('');
    this.lic.set(null);
    this.docs.set([]);

    // carrega licitação + documentos em paralelo
    this.api.getById(id).subscribe({
      next: (d) => { this.lic.set(d); this.loading.set(false); },
      error: (e) => {
        this.loading.set(false);
        this.error.set(e?.error?.message || 'Falha ao carregar a licitação.');
      },
    });

    this.api.listDocuments(id).subscribe({
      next: (arr) => this.docs.set(arr as LicDoc[]),
      error: () => this.docs.set([]), // documentos são complementares – não bloqueia
    });
  }

  badgeClass(s?: Licitacao['status']) {
    switch (s) {
      case 'open': return 'bg-emerald-100 text-emerald-700';
      case 'closed': return 'bg-neutral-200 text-neutral-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'awarded': return 'bg-sky-100 text-sky-700';
      default: return 'bg-neutral-100 text-neutral-700'; // draft/undefined
    }
  }

  close() { this.closed.emit(); }
}
