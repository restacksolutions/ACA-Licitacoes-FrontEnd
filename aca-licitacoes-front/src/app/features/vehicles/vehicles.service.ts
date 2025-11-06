import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface CarBrand {
  id: string;
  name: string;
  models?: VehicleModel[];
}

export interface VehicleModel {
  id: string;
  brandId: string;
  name: string;
  specs: VehicleSpecs;
  brand?: CarBrand;
}

export type Powertrain = 'ice' | 'hev' | 'phev' | 'bev';
export type Category = 'hatch' | 'sedan' | 'suv' | 'pickup' | 'van' | 'wagon' | 'coupe' | 'caminhao';
export type Drivetrain = 'FWD' | 'RWD' | 'AWD' | '4x4';
export type Transmission = 'manual' | 'automatico' | 'cvt' | 'dct';

export interface VehicleSpecs {
  // Geral (sempre presente)
  category?: Category;
  powertrain?: Powertrain;
  trim?: string;
  year?: number;
  doors?: number;
  seatCount?: number;
  drivetrain?: Drivetrain;
  transmission?: Transmission;
  gears?: number;
  
  // Dimensões & Capacidades
  dimensions?: {
    length_mm?: number;
    width_mm?: number;
    height_mm?: number;
    wheelbase_mm?: number;
    groundClearance_mm?: number;
    curbWeight_kg?: number;
    bootVolume_l?: number;
    frunkVolume_l?: number; // EV
    towingCapacity_kg?: number;
    payload_kg?: number;
  };
  
  // Mecânica (Combustão) - ICE/HEV/PHEV
  engine?: {
    displacement_cc?: number;
    cylinders?: number;
    fuel?: 'gasolina' | 'flex' | 'diesel' | 'etanol' | 'gnv';
    aspiration?: 'na' | 'turbo' | 'supercharger';
    power_hp?: number;
    power_kW?: number;
    torque_Nm?: number;
    startStop?: boolean;
  };
  
  // Elétrico/Híbrido - HEV/PHEV/BEV
  ev?: {
    architectureV?: 400 | 800;
    batteryGross_kWh?: number;
    batteryUsable_kWh?: number;
    chemistry?: 'LFP' | 'NMC' | 'NCA' | 'LTO';
    thermalManagement?: 'liquid' | 'air' | 'passive';
    motorCount?: number;
    power_kW?: number;
    torque_Nm?: number;
    regenLevels?: number;
    onePedalDrive?: boolean;
  };
  
  // Carregamento - PHEV/BEV
  charge?: {
    portAC?: boolean;
    portDC?: boolean;
    onboardCharger_kW?: number;
    dcPeak_kW?: number;
    _10to80_time_min?: number;
    _0to100_time_h?: number;
    preconditioning?: boolean;
    bidirectional?: boolean;
    bidirectionalPower_kW?: number;
  };
  
  // Desempenho
  performance?: {
    _0to100_sec?: number;
    _0to60_sec?: number;
    topSpeed_kmh?: number;
    braking100to0_m?: number;
  };
  
  // Consumo/Autonomia
  economy?: {
    city_l_100km?: number; // ICE
    highway_l_100km?: number; // ICE
    mixed_l_100km?: number; // ICE
    rangeWLTP_km?: number; // EV/HEV
    rangeEPA_km?: number; // EV
    co2_g_km?: number;
    standard?: 'Inmetro' | 'WLTP' | 'EPA' | 'NEDC';
  };
  
  // Chassi & Rodas
  chassis?: {
    suspensionFront?: string;
    suspensionRear?: string;
    brakesFront?: string;
    brakesRear?: string;
    steering?: string;
    rimSize_inch?: number;
    tireSizeFront?: string; // "225/45 R18"
    tireSizeRear?: string;
    rimMaterial?: 'aco' | 'liga-leve' | 'carbon';
  };
  
  // Segurança & ADAS
  safety?: {
    airbags?: number;
    airbagsFront?: number;
    airbagsSide?: number;
    airbagsCurtain?: boolean;
    isofix?: boolean;
    abs?: boolean;
    esc?: boolean;
    acc?: boolean; // Adaptive Cruise Control
    lka?: boolean; // Lane Keeping Assist
    bsm?: boolean; // Blind Spot Monitor
    aeb?: boolean; // Autonomous Emergency Braking
    trafficSignRecognition?: boolean;
    parkingAssist?: boolean;
    camera360?: boolean;
  };
  
  // Conforto & Infotainment
  comfort?: {
    acType?: 'manual' | 'digital' | 'dual-zone' | 'tri-zone';
    seatsMaterial?: 'tecido' | 'couro' | 'alcantara' | 'sintetico';
    seatsElectric?: boolean;
    seatsHeated?: boolean;
    seatsVentilated?: boolean;
    panoramicRoof?: boolean;
    sunroof?: boolean;
    displaySize_inch?: number;
    clusterType?: string;
    carplay?: 'wired' | 'wireless' | false;
    androidAuto?: 'wired' | 'wireless' | false;
    speakers?: number;
    ota?: boolean;
    remoteApp?: boolean;
  };
  
  // Garantia & Manutenção
  warranty?: {
    vehicle_years?: number;
    vehicle_km?: number;
    battery_years?: number; // EV
    battery_km?: number; // EV
    serviceInterval_km?: number;
    serviceInterval_months?: number;
  };
  
  // Mercado
  market?: {
    currency?: 'BRL' | 'USD' | 'EUR';
    price?: number;
    availability?: 'active' | 'discontinued' | 'preorder';
  };
  
  // Outros (legacy)
  releaseYear?: number;
  endYear?: number;
  priceRange?: string;
  targetMarket?: string;
  notes?: string;
  tags?: string[];
}

export interface CreateBrandDto {
  name: string;
}

export interface UpdateBrandDto {
  name?: string;
}

export interface CreateVehicleModelDto {
  brandId: string;
  name: string;
  specs?: VehicleSpecs;
}

export interface UpdateVehicleModelDto {
  name?: string;
  specs?: VehicleSpecs;
}

@Injectable({ providedIn: 'root' })
export class VehiclesService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/vehicles`;

  // MARCAS
  listBrands(search?: string) {
    let params = new HttpParams();
    if (search?.trim()) params = params.set('search', search.trim());
    return this.http.get<CarBrand[]>(`${this.base}/brands`, { params });
  }

  getBrandById(id: string) {
    return this.http.get<CarBrand>(`${this.base}/brands/${id}`);
  }

  createBrand(data: CreateBrandDto) {
    return this.http.post<CarBrand>(`${this.base}/brands`, data);
  }

  updateBrand(id: string, data: UpdateBrandDto) {
    return this.http.patch<CarBrand>(`${this.base}/brands/${id}`, data);
  }

  deleteBrand(id: string) {
    return this.http.delete<{ message: string }>(`${this.base}/brands/${id}`);
  }

  // MODELOS
  listModels(params?: {
    brandId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    let httpParams = new HttpParams();
    if (params?.brandId) httpParams = httpParams.set('brandId', params.brandId);
    if (params?.search?.trim()) httpParams = httpParams.set('search', params.search.trim());
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    
    return this.http.get<VehicleModel[]>(`${this.base}/models`, { params: httpParams });
  }

  getModelById(id: string) {
    return this.http.get<VehicleModel>(`${this.base}/models/${id}`);
  }

  createModel(data: CreateVehicleModelDto) {
    return this.http.post<VehicleModel>(`${this.base}/models`, data);
  }

  updateModel(id: string, data: UpdateVehicleModelDto) {
    return this.http.patch<VehicleModel>(`${this.base}/models/${id}`, data);
  }

  deleteModel(id: string) {
    return this.http.delete<{ message: string }>(`${this.base}/models/${id}`);
  }

  // CSV
  uploadCSV(file: File) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ success: number; errors: Array<{ row: number; message: string }> }>(
      `${this.base}/models/import`,
      form
    );
  }
}

