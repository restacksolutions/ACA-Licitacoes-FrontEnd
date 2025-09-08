import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TenderApiService, TenderUploadResponse } from '../../../core/services/tender-api.service';

@Component({
  selector: 'app-tender-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tender-success.component.html',
  styleUrls: ['./tender-success.component.css']
})
export class TenderSuccessComponent implements OnInit {
  tenderId: string | null = null;
  tenderData: TenderUploadResponse | null = null;
  extractedData: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tenderApiService: TenderApiService
  ) {}

  ngOnInit(): void {
    this.tenderId = this.route.snapshot.paramMap.get('id');
    
    if (this.tenderId) {
      // Simula dados extraídos (em produção, viria da API)
      this.extractedData = {
        title: 'Licitação de Veículos SUV',
        organ: 'SEDUC',
        uf: 'PR',
        modality: 'Pregão Eletrônico',
        deadline: '2024-12-31',
        estimatedValue: 150000,
        requirements: [
          'Veículo SUV 4x4',
          'Ano modelo 2020 ou superior',
          'Documentação em dia',
          'Seguro obrigatório',
          'Garantia de 12 meses'
        ],
        documents: [
          'Proposta técnica',
          'Proposta comercial',
          'Documentação da empresa',
          'Certidões negativas',
          'Comprovação de capacidade técnica'
        ],
        deadlines: [
          { description: 'Envio de propostas', date: '2024-12-20', time: '14:00' },
          { description: 'Sessão pública de abertura', date: '2024-12-21', time: '10:00' },
          { description: 'Análise de propostas', date: '2024-12-25', time: '09:00' },
          { description: 'Resultado final', date: '2024-12-31', time: '16:00' }
        ]
      };

      this.tenderData = {
        id: this.tenderId,
        status: 'completed',
        message: 'Processamento concluído com sucesso!',
        extractedData: this.extractedData,
        processingTime: 25
      };
    }
  }

  onViewTender(): void {
    this.router.navigate(['/tenders', this.tenderId]);
  }

  onNewTender(): void {
    this.router.navigate(['/tenders/new']);
  }

  onBackToTenders(): void {
    this.router.navigate(['/tenders']);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }
}

