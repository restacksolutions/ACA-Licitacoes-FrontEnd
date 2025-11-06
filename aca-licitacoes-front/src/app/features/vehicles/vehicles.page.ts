import { Component, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  VehiclesService,
  CarBrand,
  VehicleModel,
  CreateBrandDto,
  UpdateBrandDto,
  CreateVehicleModelDto,
  UpdateVehicleModelDto,
  VehicleSpecs
} from './vehicles.service';
import { VehicleModelFormComponent } from './vehicle-model-form.component';
import Swal from 'sweetalert2';

type Tab = 'brands' | 'models';

@Component({
  standalone: true,
  selector: 'app-vehicles-page',
  imports: [CommonModule, FormsModule, VehicleModelFormComponent],
  templateUrl: './vehicles.page.html',
  styleUrls: ['./vehicles.page.css']
})
export class VehiclesPage {
  private api = inject(VehiclesService);

  tab = signal<Tab>('models');

  // MARCAS
  brands = signal<CarBrand[]>([]);
  brandsLoading = signal(false);
  brandsSearch = signal('');
  showBrandModal = signal(false);
  editingBrand = signal<CarBrand | null>(null);
  brandForm = signal({ name: '' });
  brandFormLoading = signal(false);
  brandFormError = signal('');

  // MODELOS
  models = signal<VehicleModel[]>([]);
  modelsLoading = signal(false);
  modelsSearch = signal('');
  selectedBrandId = signal<string>('');
  availableBrands = signal<CarBrand[]>([]);
  currentPage = signal(1);
  pageSize = 20;
  showModelModal = signal(false);
  editingModel = signal<VehicleModel | null>(null);
  modelForm = signal<CreateVehicleModelDto>({
    brandId: '',
    name: '',
    specs: {}
  });
  modelFormLoading = signal(false);
  modelFormError = signal('');

  // CSV
  showCSVModal = signal(false);
  csvFile = signal<File | null>(null);
  csvLoading = signal(false);

  constructor() {
    // Carregar marcas disponíveis inicialmente
    this.loadBrands();
    this.loadModels();
  }

  // Método chamado quando muda de tab
  onTabChange(tab: Tab) {
    this.tab.set(tab);
    if (tab === 'brands') {
      this.loadBrands();
    } else if (tab === 'models') {
      // Garantir que temos marcas carregadas antes de carregar modelos
      if (this.availableBrands().length === 0) {
        this.loadBrands();
      }
      this.loadModels();
    }
  }

  // MARCAS
  loadBrands() {
    this.brandsLoading.set(true);
    this.api.listBrands(this.brandsSearch()).subscribe({
      next: (data) => {
        this.brands.set(data);
        this.availableBrands.set(data);
        this.brandsLoading.set(false);
      },
      error: (err) => {
        this.brandsLoading.set(false);
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: err?.error?.message || 'Erro ao carregar marcas'
        });
      }
    });
  }

  openBrandModal(brand?: CarBrand) {
    if (brand) {
      this.editingBrand.set(brand);
      this.brandForm.set({ name: brand.name });
    } else {
      this.editingBrand.set(null);
      this.brandForm.set({ name: '' });
    }
    this.brandFormError.set('');
    this.showBrandModal.set(true);
  }

  closeBrandModal() {
    this.showBrandModal.set(false);
    this.editingBrand.set(null);
    this.brandForm.set({ name: '' });
    this.brandFormError.set('');
  }

  saveBrand() {
    if (!this.brandForm().name.trim()) {
      this.brandFormError.set('Nome é obrigatório');
      return;
    }

    this.brandFormLoading.set(true);
    this.brandFormError.set('');

    const data: CreateBrandDto | UpdateBrandDto = { name: this.brandForm().name.trim() };
    const operation = this.editingBrand()
      ? this.api.updateBrand(this.editingBrand()!.id, data)
      : this.api.createBrand(data as CreateBrandDto);

    operation.subscribe({
      next: () => {
        this.brandFormLoading.set(false);
        this.closeBrandModal();
        this.loadBrands();
        Swal.fire({
          icon: 'success',
          title: 'Sucesso!',
          text: this.editingBrand() ? 'Marca atualizada com sucesso' : 'Marca criada com sucesso',
          timer: 1500,
          showConfirmButton: false
        });
      },
      error: (err) => {
        this.brandFormLoading.set(false);
        this.brandFormError.set(err?.error?.message || 'Erro ao salvar marca');
      }
    });
  }

  deleteBrand(brand: CarBrand) {
    Swal.fire({
      title: 'Tem certeza?',
      text: `Deseja realmente excluir a marca "${brand.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.api.deleteBrand(brand.id).subscribe({
          next: () => {
            this.loadBrands();
            Swal.fire({
              icon: 'success',
              title: 'Excluído!',
              text: 'Marca excluída com sucesso.',
              timer: 1500,
              showConfirmButton: false
            });
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Erro!',
              text: err?.error?.message || 'Erro ao excluir marca'
            });
          }
        });
      }
    });
  }

  // MODELOS
  loadModels() {
    this.modelsLoading.set(true);
    this.api.listModels({
      brandId: this.selectedBrandId() || undefined,
      search: this.modelsSearch() || undefined,
      page: this.currentPage(),
      limit: this.pageSize
    }).subscribe({
      next: (data) => {
        this.models.set(data);
        this.modelsLoading.set(false);
      },
      error: (err) => {
        this.modelsLoading.set(false);
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: err?.error?.message || 'Erro ao carregar modelos'
        });
      }
    });
  }

  openModelModal(model?: VehicleModel) {
    this.editingModel.set(model || null);
    this.modelFormError.set('');
    this.showModelModal.set(true);
  }

  closeModelModal() {
    this.showModelModal.set(false);
    this.editingModel.set(null);
    this.modelFormError.set('');
  }

  onModelFormSave(data: any) {
    this.modelFormLoading.set(true);
    this.modelFormError.set('');

    const operation = this.editingModel()
      ? this.api.updateModel(this.editingModel()!.id, data)
      : this.api.createModel(data);

    operation.subscribe({
      next: () => {
        this.modelFormLoading.set(false);
        this.closeModelModal();
        this.loadModels();
        Swal.fire({
          icon: 'success',
          title: 'Sucesso!',
          text: this.editingModel() ? 'Modelo atualizado com sucesso' : 'Modelo criado com sucesso',
          timer: 1500,
          showConfirmButton: false
        });
      },
      error: (err) => {
        this.modelFormLoading.set(false);
        this.modelFormError.set(err?.error?.message || 'Erro ao salvar modelo');
      }
    });
  }

  onModelFormCancel() {
    this.closeModelModal();
  }

  deleteModel(model: VehicleModel) {
    Swal.fire({
      title: 'Tem certeza?',
      text: `Deseja realmente excluir o modelo "${model.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.api.deleteModel(model.id).subscribe({
          next: () => {
            this.loadModels();
            Swal.fire({
              icon: 'success',
              title: 'Excluído!',
              text: 'Modelo excluído com sucesso.',
              timer: 1500,
              showConfirmButton: false
            });
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Erro!',
              text: err?.error?.message || 'Erro ao excluir modelo'
            });
          }
        });
      }
    });
  }

  // CSV
  openCSVModal() {
    this.csvFile.set(null);
    this.showCSVModal.set(true);
  }

  closeCSVModal() {
    this.showCSVModal.set(false);
    this.csvFile.set(null);
  }

  onCSVFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.csvFile.set(file);
    }
  }

  downloadCSVTemplate() {
    const headers = [
      'marca',
      'nome_modelo',
      'categoria',
      'tipo_veiculo',
      'segmento',
      'comprimento_mm',
      'largura_mm',
      'altura_mm',
      'distancia_eixos_mm',
      'altura_solo_mm',
      'volume_porta_malas_l',
      'capacidade_tanque_l',
      'cilindrada_cm3',
      'cilindros',
      'potencia_cv',
      'potencia_rpm',
      'torque_nm',
      'torque_rpm',
      'tipo_combustivel',
      'aspiração',
      'transmissao',
      'marchas',
      'tipo_tracao',
      'velocidade_max_kmh',
      'aceleracao_0_100_seg',
      'consumo_cidade_km_l',
      'consumo_estrada_km_l',
      'consumo_combinado_km_l',
      'emissao_co2_g_km',
      'padrao_emissao',
      'peso_ordem_marcha_kg',
      'peso_bruto_kg',
      'capacidade_carga_kg',
      'capacidade_reboque_kg',
      'suspensao_dianteira',
      'suspensao_traseira',
      'freios_dianteiros',
      'freios_traseiros',
      'abs',
      'ebd',
      'esp',
      'numero_airbags',
      'airbags_frontais',
      'airbags_laterais',
      'airbags_cortina',
      'isofix',
      'classificacao_ncap',
      'ano_ncap',
      'controle_tracao',
      'assistente_rampa',
      'sensores_estacionamento',
      'camera_re',
      'monitor_ponto_cego',
      'numero_assentos',
      'material_assentos',
      'ar_condicionado',
      'teto_solar',
      'teto_panoramico',
      'entrada_sem_chave',
      'partida_botao',
      'piloto_automatico',
      'piloto_automatico_adaptativo',
      'assistente_estacionamento',
      'tamanho_tela_polegadas',
      'tipo_tela',
      'android_auto',
      'apple_carplay',
      'bluetooth',
      'portas_usb',
      'carregamento_sem_fio',
      'sistema_som',
      'alto_falantes',
      'farois',
      'tipo_farois',
      'luzes_diurnas',
      'farois_neblina',
      'farois_adaptativos',
      'assistente_luz_alta',
      'dimensao_pneu_dianteiro',
      'dimensao_pneu_traseiro',
      'tamanho_aro_polegadas',
      'material_aro',
      'estepe',
      'tempo_garantia_anos',
      'quilometragem_garantia_km',
      'ano_lancamento',
      'ano_descontinuacao',
      'faixa_preco',
      'mercado_alvo',
      'observacoes',
      'tags'
    ];

    const csvContent = headers.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_veiculos.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  uploadCSV() {
    const file = this.csvFile();
    if (!file) {
      Swal.fire({
        icon: 'warning',
        title: 'Atenção',
        text: 'Selecione um arquivo CSV'
      });
      return;
    }

    this.csvLoading.set(true);
    this.api.uploadCSV(file).subscribe({
      next: (result) => {
        this.csvLoading.set(false);
        this.closeCSVModal();
        this.loadModels();
        
        const message = result.errors.length > 0
          ? `${result.success} modelo(s) importado(s) com sucesso. ${result.errors.length} erro(s).`
          : `${result.success} modelo(s) importado(s) com sucesso!`;
        
        Swal.fire({
          icon: result.errors.length > 0 ? 'warning' : 'success',
          title: result.errors.length > 0 ? 'Importação parcial' : 'Sucesso!',
          text: message,
          html: result.errors.length > 0
            ? `<p>${message}</p><ul class="text-left mt-2"><li>${result.errors.map(e => `Linha ${e.row}: ${e.message}`).join('</li><li>')}</li></ul>`
            : message
        });
      },
      error: (err) => {
        this.csvLoading.set(false);
        Swal.fire({
          icon: 'error',
          title: 'Erro!',
          text: err?.error?.message || 'Erro ao importar CSV'
        });
      }
    });
  }
}

