import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { TenderApiService, TenderFormData, TenderUploadResponse, UploadProgress } from '../../../core/services/tender-api.service';

@Component({
  selector: 'app-new-tender',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './new-tender.component.html',
  styleUrls: ['./new-tender.component.css']
})
export class NewTenderComponent implements OnInit, OnDestroy {
  tenderForm: FormGroup;
  selectedFile: File | null = null;
  uploadProgress: UploadProgress = { loaded: 0, total: 0, percentage: 0 };
  isUploading = false;
  uploadResponse: TenderUploadResponse | null = null;
  error: string | null = null;
  
  private destroy$ = new Subject<void>();

  // Opções para os selects
  ufOptions = [
    { value: 'AC', label: 'Acre' },
    { value: 'AL', label: 'Alagoas' },
    { value: 'AP', label: 'Amapá' },
    { value: 'AM', label: 'Amazonas' },
    { value: 'BA', label: 'Bahia' },
    { value: 'CE', label: 'Ceará' },
    { value: 'DF', label: 'Distrito Federal' },
    { value: 'ES', label: 'Espírito Santo' },
    { value: 'GO', label: 'Goiás' },
    { value: 'MA', label: 'Maranhão' },
    { value: 'MT', label: 'Mato Grosso' },
    { value: 'MS', label: 'Mato Grosso do Sul' },
    { value: 'MG', label: 'Minas Gerais' },
    { value: 'PA', label: 'Pará' },
    { value: 'PB', label: 'Paraíba' },
    { value: 'PR', label: 'Paraná' },
    { value: 'PE', label: 'Pernambuco' },
    { value: 'PI', label: 'Piauí' },
    { value: 'RJ', label: 'Rio de Janeiro' },
    { value: 'RN', label: 'Rio Grande do Norte' },
    { value: 'RS', label: 'Rio Grande do Sul' },
    { value: 'RO', label: 'Rondônia' },
    { value: 'RR', label: 'Roraima' },
    { value: 'SC', label: 'Santa Catarina' },
    { value: 'SP', label: 'São Paulo' },
    { value: 'SE', label: 'Sergipe' },
    { value: 'TO', label: 'Tocantins' }
  ];

  modalityOptions = [
    { value: 'pregão-eletronico', label: 'Pregão Eletrônico' },
    { value: 'concorrencia', label: 'Concorrência' },
    { value: 'tomada-precos', label: 'Tomada de Preços' },
    { value: 'convite', label: 'Convite' },
    { value: 'concurso', label: 'Concurso' },
    { value: 'leilao', label: 'Leilão' },
    { value: 'pregao-presencial', label: 'Pregão Presencial' },
    { value: 'rdc', label: 'RDC (Regime Diferenciado de Contratações)' }
  ];

  constructor(
    private fb: FormBuilder,
    private tenderApiService: TenderApiService,
    private router: Router
  ) {
    this.tenderForm = this.createForm();
  }

  ngOnInit(): void {
    // Observa o progresso de upload
    this.tenderApiService.uploadProgress$
      .pipe(takeUntil(this.destroy$))
      .subscribe(progress => {
        this.uploadProgress = progress;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      organ: ['', [Validators.required, Validators.minLength(2)]],
      uf: ['', [Validators.required]],
      modality: ['', [Validators.required]],
      deadline: ['', [Validators.required]],
      estimatedValue: [null, [Validators.min(0)]],
      contactEmail: ['', [Validators.email]],
      contactPhone: [''],
      observations: ['']
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Valida se é PDF
      if (file.type !== 'application/pdf') {
        this.error = 'Por favor, selecione apenas arquivos PDF.';
        return;
      }

      // Valida tamanho (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.error = 'O arquivo deve ter no máximo 10MB.';
        return;
      }

      this.selectedFile = file;
      this.error = null;
    }
  }

  onRemoveFile(): void {
    this.selectedFile = null;
    this.error = null;
  }

  onSubmit(): void {
    if (this.tenderForm.valid && this.selectedFile) {
      this.isUploading = true;
      this.error = null;
      this.uploadResponse = null;

      const formData: TenderFormData = this.tenderForm.value;

      this.tenderApiService.uploadTenderPdf(this.selectedFile, formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.uploadResponse = response;
            this.isUploading = false;
            
            if (response.status === 'processing') {
              // Inicia o processamento
              this.startProcessing(response.id);
            }
          },
          error: (error) => {
            this.error = 'Erro ao enviar arquivo. Tente novamente.';
            this.isUploading = false;
            console.error('Upload error:', error);
          }
        });
    } else {
      this.markFormGroupTouched();
      if (!this.selectedFile) {
        this.error = 'Por favor, selecione um arquivo PDF.';
      }
    }
  }

  private startProcessing(tenderId: string): void {
    this.tenderApiService.processTenderPdf(tenderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.uploadResponse = response;
          if (response.status === 'completed') {
            // Redireciona para a página de sucesso ou detalhes
            this.router.navigate(['/tenders', tenderId, 'success']);
          }
        },
        error: (error) => {
          this.error = 'Erro no processamento do arquivo.';
          console.error('Processing error:', error);
        }
      });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.tenderForm.controls).forEach(key => {
      const control = this.tenderForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.tenderForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} é obrigatório.`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} deve ter pelo menos ${field.errors['minlength'].requiredLength} caracteres.`;
      }
      if (field.errors['email']) {
        return 'Email inválido.';
      }
      if (field.errors['min']) {
        return 'Valor deve ser maior que zero.';
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      title: 'Título',
      description: 'Descrição',
      organ: 'Órgão',
      uf: 'UF',
      modality: 'Modalidade',
      deadline: 'Prazo',
      estimatedValue: 'Valor Estimado',
      contactEmail: 'Email de Contato',
      contactPhone: 'Telefone de Contato',
      observations: 'Observações'
    };
    return labels[fieldName] || fieldName;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  onCancel(): void {
    this.router.navigate(['/tenders']);
  }
}

