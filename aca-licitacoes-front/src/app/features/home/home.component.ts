import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HomeService, Company, DocsKpi, LicCounts, LicitacaoPreview } from './home.service';
import { CompanyService } from '../../core/services/company.service';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  private homeService = inject(HomeService);
  private companyService = inject(CompanyService);
  private router = inject(Router);

  // Signals para dados
  companies = signal<Company[]>([]);
  companyId = signal<string>('');
  docsKpi = signal<DocsKpi>({ valid: 0, expiring: 0, expired: 0 });
  proximosVencimentos = signal<any[]>([]);
  licCounts = signal<LicCounts>({ future: 0, past: 0 });
  nextFive = signal<LicitacaoPreview[]>([]);
  atividades = signal<any[]>([]);

  // Computed para empresa ativa
  activeCompany = computed(() => {
    const id = this.companyId();
    return this.companies().find(c => c.id === id);
  });

  constructor() {
    this.loadCompanies();
    this.loadData();
  }

  // Carrega lista de empresas
  loadCompanies() {
    this.homeService.listCompanies().subscribe({
      next: (companies) => {
        this.companies.set(companies);
        const currentId = this.companyService.get();
        if (currentId && companies.some(c => c.id === currentId)) {
          this.companyId.set(currentId);
        } else if (companies.length > 0) {
          this.setCompany(companies[0].id);
        }
      },
      error: (error) => console.error('Erro ao carregar empresas:', error)
    });
  }

  // Define empresa ativa
  setCompany(id: string) {
    this.companyService.set(id);
    this.companyId.set(id);
    this.loadData();
  }

  // Carrega todos os dados da home
  loadData() {
    this.loadDocsKpi();
    this.loadUpcomingDocs();
    this.loadLicCounts();
    this.loadNextFive();
  }

  // Carrega KPIs de documentos
  loadDocsKpi() {
    this.homeService.getDocsKpi().subscribe({
      next: (kpi) => this.docsKpi.set(kpi),
      error: (error) => console.error('Erro ao carregar KPIs:', error)
    });
  }

  // Carrega documentos próximos ao vencimento
  loadUpcomingDocs() {
    this.homeService.getUpcomingDocs(15).subscribe({
      next: (docs) => this.proximosVencimentos.set(docs),
      error: (error) => console.error('Erro ao carregar próximos vencimentos:', error)
    });
  }

  // Carrega contagens de licitações
  loadLicCounts() {
    this.homeService.getLicCounts().subscribe({
      next: (counts) => this.licCounts.set(counts),
      error: (error) => console.error('Erro ao carregar contagens:', error)
    });
  }

  // Carrega próximas 5 licitações
  loadNextFive() {
    this.homeService.getNextFive().subscribe({
      next: (lics) => this.nextFive.set(lics),
      error: (error) => console.error('Erro ao carregar próximas licitações:', error)
    });
  }

  // Navega para URL
  go(url: string) {
    this.router.navigateByUrl(url);
  }
}
