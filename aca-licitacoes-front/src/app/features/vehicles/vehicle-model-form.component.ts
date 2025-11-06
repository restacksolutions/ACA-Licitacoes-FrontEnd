import { Component, Input, Output, EventEmitter, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CarBrand, VehicleModel, VehicleSpecs, Powertrain, Category } from './vehicles.service';

@Component({
  standalone: true,
  selector: 'app-vehicle-model-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vehicle-model-form.component.html',
  styleUrls: ['./vehicle-model-form.component.css']
})
export class VehicleModelFormComponent implements OnInit {
  @Input() model?: VehicleModel | null;
  @Input() brands: CarBrand[] = [];
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);

  form!: FormGroup;
  expandedSections = signal<Set<string>>(new Set(['general']));

  categories: Category[] = ['hatch', 'sedan', 'suv', 'pickup', 'van', 'wagon', 'coupe', 'caminhao'];
  powertrains: Powertrain[] = ['ice', 'hev', 'phev', 'bev'];
  drivetrains = ['FWD', 'RWD', 'AWD', '4x4'];
  transmissions = ['manual', 'automatico', 'cvt', 'dct'];

  ngOnInit() {
    this.buildForm();
    if (this.model) {
      this.patchForm(this.model);
    }
  }

  buildForm() {
    this.form = this.fb.group({
      brandId: ['', Validators.required],
      name: ['', [Validators.required, Validators.maxLength(100)]],
      year: [new Date().getFullYear(), [Validators.required, Validators.min(1980), Validators.max(2100)]],
      category: ['', Validators.required],
      powertrain: ['ice', Validators.required],
      trim: [''],
      doors: [4, [Validators.min(2), Validators.max(6)]],
      seatCount: [5, [Validators.min(1), Validators.max(9)]],
      drivetrain: ['FWD'],
      transmission: ['manual'],
      gears: [5],

      dimensions: this.fb.group({
        length_mm: [null],
        width_mm: [null],
        height_mm: [null],
        wheelbase_mm: [null],
        groundClearance_mm: [null],
        curbWeight_kg: [null],
        bootVolume_l: [null],
        frunkVolume_l: [null],
        towingCapacity_kg: [null],
        payload_kg: [null],
      }),

      engine: this.fb.group({
        displacement_cc: [null],
        cylinders: [null],
        fuel: ['flex'],
        aspiration: ['na'],
        power_hp: [null],
        power_kW: [null],
        torque_Nm: [null],
        startStop: [false],
      }),

      ev: this.fb.group({
        architectureV: [null],
        batteryGross_kWh: [null],
        batteryUsable_kWh: [null],
        chemistry: [null],
        thermalManagement: [null],
        motorCount: [null],
        power_kW: [null],
        torque_Nm: [null],
        regenLevels: [null],
        onePedalDrive: [false],
      }),

      charge: this.fb.group({
        portAC: [false],
        portDC: [false],
        onboardCharger_kW: [null],
        dcPeak_kW: [null],
        _10to80_time_min: [null],
        _0to100_time_h: [null],
        preconditioning: [false],
        bidirectional: [false],
        bidirectionalPower_kW: [null],
      }),

      performance: this.fb.group({
        _0to100_sec: [null],
        _0to60_sec: [null],
        topSpeed_kmh: [null],
        braking100to0_m: [null],
      }),

      economy: this.fb.group({
        city_l_100km: [null],
        highway_l_100km: [null],
        mixed_l_100km: [null],
        rangeWLTP_km: [null],
        rangeEPA_km: [null],
        co2_g_km: [null],
        standard: ['Inmetro'],
      }),

      chassis: this.fb.group({
        suspensionFront: [''],
        suspensionRear: [''],
        brakesFront: [''],
        brakesRear: [''],
        steering: [''],
        rimSize_inch: [null],
        tireSizeFront: [''],
        tireSizeRear: [''],
        rimMaterial: [''],
      }),

      safety: this.fb.group({
        airbags: [null],
        airbagsFront: [null],
        airbagsSide: [null],
        airbagsCurtain: [false],
        isofix: [false],
        abs: [false],
        esc: [false],
        acc: [false],
        lka: [false],
        bsm: [false],
        aeb: [false],
        trafficSignRecognition: [false],
        parkingAssist: [false],
        camera360: [false],
      }),

      comfort: this.fb.group({
        acType: ['manual'],
        seatsMaterial: [''],
        seatsElectric: [false],
        seatsHeated: [false],
        seatsVentilated: [false],
        panoramicRoof: [false],
        sunroof: [false],
        displaySize_inch: [null],
        clusterType: [''],
        carplay: [false],
        androidAuto: [false],
        speakers: [null],
        ota: [false],
        remoteApp: [false],
      }),

      warranty: this.fb.group({
        vehicle_years: [null],
        vehicle_km: [null],
        battery_years: [null],
        battery_km: [null],
        serviceInterval_km: [null],
        serviceInterval_months: [null],
      }),

      market: this.fb.group({
        currency: ['BRL'],
        price: [null, Validators.required],
        availability: ['active'],
      }),

      notes: [''],
      tags: ['']
    });
  }

  patchForm(model: VehicleModel) {
    const specs = model.specs || {};
    this.form.patchValue({
      brandId: model.brandId,
      name: model.name,
      year: specs.year || new Date().getFullYear(),
      category: specs.category || '',
      powertrain: specs.powertrain || 'ice',
      trim: specs.trim || '',
      doors: specs.doors || 4,
      seatCount: specs.seatCount || 5,
      drivetrain: specs.drivetrain || 'FWD',
      transmission: specs.transmission || 'manual',
      gears: specs.gears || 5,
      dimensions: specs.dimensions || {},
      engine: specs.engine || {},
      ev: specs.ev || {},
      charge: specs.charge || {},
      performance: specs.performance || {},
      economy: specs.economy || {},
      chassis: specs.chassis || {},
      safety: specs.safety || {},
      comfort: specs.comfort || {},
      warranty: specs.warranty || {},
      market: specs.market || {},
      notes: specs.notes || '',
      tags: (specs.tags || []).join('; ')
    });
  }

  toggleSection(section: string) {
    const expanded = new Set(this.expandedSections());
    if (expanded.has(section)) {
      expanded.delete(section);
    } else {
      expanded.add(section);
    }
    this.expandedSections.set(expanded);
  }

  isSectionExpanded(section: string): boolean {
    return this.expandedSections().has(section);
  }

  // Helpers para visibilidade condicional por powertrain
  isEVLike(): boolean {
    const pt = this.form.value.powertrain;
    return pt === 'bev' || pt === 'phev' || pt === 'hev';
  }

  showEngine(): boolean {
    const pt = this.form.value.powertrain;
    return pt === 'ice' || pt === 'hev' || pt === 'phev';
  }

  showCharge(): boolean {
    const pt = this.form.value.powertrain;
    return pt === 'bev' || pt === 'phev';
  }

  // Helpers para visibilidade condicional por categoria
  getCategory(): Category | '' {
    const cat = this.form?.get('category')?.value;
    return cat || '';
  }

  // Categorias de passeio (carros leves)
  isPassengerCar(): boolean {
    const cat = this.getCategory();
    return cat === 'hatch' || cat === 'sedan' || cat === 'coupe' || cat === 'wagon';
  }

  // Categorias utilitárias
  isUtilityVehicle(): boolean {
    const cat = this.getCategory();
    return cat === 'suv' || cat === 'pickup' || cat === 'van';
  }

  // Caminhões
  isTruck(): boolean {
    return this.getCategory() === 'caminhao';
  }

  // Mostrar seções específicas por categoria
  showDimensions(): boolean {
    return true; // Sempre mostrar dimensões
  }

  showMechanics(): boolean {
    return this.showEngine(); // Depende do powertrain
  }

  showEVSection(): boolean {
    return this.isEVLike(); // Depende do powertrain
  }

  showCharging(): boolean {
    return this.showCharge(); // Depende do powertrain
  }

  showPerformance(): boolean {
    // Performance é relevante para todos, exceto caminhões pesados
    return !this.isTruck();
  }

  showEconomy(): boolean {
    return true; // Sempre relevante
  }

  showChassis(): boolean {
    return true; // Sempre relevante
  }

  showSafety(): boolean {
    return true; // Sempre relevante
  }

  showComfort(): boolean {
    // Conforto mais relevante para carros de passeio e SUVs
    return this.isPassengerCar() || this.getCategory() === 'suv';
  }

  showWarranty(): boolean {
    return true; // Sempre relevante
  }

  showMarket(): boolean {
    return true; // Sempre relevante
  }

  // Campos específicos dentro das seções
  showTowingCapacity(): boolean {
    // Reboque relevante para SUVs, pickups, vans e caminhões
    return this.isUtilityVehicle() || this.isTruck();
  }

  showPayload(): boolean {
    // Carga útil para pickups, vans e caminhões
    return this.getCategory() === 'pickup' || this.getCategory() === 'van' || this.isTruck();
  }

  showFrunk(): boolean {
    // Frunk apenas para EVs
    return this.isEVLike() && (this.isPassengerCar() || this.getCategory() === 'suv');
  }

  showGroundClearance(): boolean {
    // Altura do solo mais relevante para SUVs, pickups e caminhões
    return this.isUtilityVehicle() || this.isTruck();
  }

  showBootVolume(): boolean {
    // Porta-malas relevante exceto para caminhões
    return !this.isTruck();
  }

  showOffRoadFeatures(): boolean {
    // Recursos off-road para SUVs e pickups
    return this.getCategory() === 'suv' || this.getCategory() === 'pickup';
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;
    const { brandId, name, ...specsData } = formValue;

    // Construir specs
    const specs: VehicleSpecs = {
      category: specsData.category,
      powertrain: specsData.powertrain,
      year: specsData.year,
      trim: specsData.trim || undefined,
      doors: specsData.doors,
      seatCount: specsData.seatCount,
      drivetrain: specsData.drivetrain,
      transmission: specsData.transmission,
      gears: specsData.gears,
      dimensions: this.cleanObject(specsData.dimensions),
      engine: this.showEngine() ? this.cleanObject(specsData.engine) : undefined,
      ev: this.isEVLike() ? this.cleanObject(specsData.ev) : undefined,
      charge: this.showCharge() ? this.cleanObject(specsData.charge) : undefined,
      performance: this.cleanObject(specsData.performance),
      economy: this.cleanObject(specsData.economy),
      chassis: this.cleanObject(specsData.chassis),
      safety: this.cleanObject(specsData.safety),
      comfort: this.cleanObject(specsData.comfort),
      warranty: this.cleanObject(specsData.warranty),
      market: this.cleanObject(specsData.market),
      notes: specsData.notes || undefined,
      tags: specsData.tags ? specsData.tags.split(';').map((t: string) => t.trim()).filter(Boolean) : undefined,
    };

    this.save.emit({ brandId, name, specs });
  }

  onCancel() {
    this.cancel.emit();
  }

  private cleanObject(obj: any): any {
    if (!obj) return undefined;
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== '' && value !== false) {
        cleaned[key] = value;
      }
    }
    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  }
}

