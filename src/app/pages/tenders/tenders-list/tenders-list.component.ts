import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TenderService, Tender } from '../tender.service';
import { AuthService } from '../../auth-pages/auth.service';

@Component({
  selector: 'app-tenders-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './tenders-list.component.html',
  styleUrls: ['./tenders-list.component.css']
})
export class TendersListComponent implements OnInit {
  tenders: Tender[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private tenderService: TenderService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadTenders();
  }

  loadTenders() {
    this.isLoading = true;
    this.errorMessage = '';

    this.tenderService.getTenders().subscribe({
      next: (tenders: Tender[]) => {
        this.tenders = tenders;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Erro ao carregar licitações';
        this.isLoading = false;
        console.error('Erro:', error);
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'DRAFT': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      'IN_REVIEW': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-300',
      'PREPARING': 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-300',
      'DOCS_READY': 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-300',
      'SENT': 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-300',
      'ONGOING': 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-300',
      'WON': 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-300',
      'LOST': 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-300'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }

  getStatusText(status: string): string {
    const statusTexts: { [key: string]: string } = {
      'DRAFT': 'Rascunho',
      'IN_REVIEW': 'Em Revisão',
      'PREPARING': 'Preparando',
      'DOCS_READY': 'Documentos Prontos',
      'SENT': 'Enviado',
      'ONGOING': 'Em Andamento',
      'WON': 'Ganho',
      'LOST': 'Perdido'
    };
    return statusTexts[status] || status;
  }
}
