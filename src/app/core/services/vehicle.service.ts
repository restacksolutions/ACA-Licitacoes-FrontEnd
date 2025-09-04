import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

export interface Vehicle {
  id: string;
  name: string;
  version: string;
  specs_json: any;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VehicleCreate {
  name: string;
  version: string;
  specs_json: any;
}

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  // Dados fictícios de veículos
  private mockVehicles: Vehicle[] = [
    {
      id: '1',
      name: 'Hilux SW4',
      version: '2024',
      specs_json: {
        motor: '2.8L Turbo Diesel',
        potencia: '204 cv',
        torque: '51 kgf.m',
        transmissao: 'Automática 6 velocidades',
        tracao: '4x4',
        combustivel: 'Diesel',
        capacidade_carga: '1000 kg',
        capacidade_passageiros: '7',
        consumo_urbano: '8.5 km/l',
        consumo_rodoviario: '11.2 km/l'
      },
      active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Ranger',
      version: '2024',
      specs_json: {
        motor: '3.0L Turbo Diesel',
        potencia: '250 cv',
        torque: '60 kgf.m',
        transmissao: 'Automática 10 velocidades',
        tracao: '4x4',
        combustivel: 'Diesel',
        capacidade_carga: '1200 kg',
        capacidade_passageiros: '5',
        consumo_urbano: '7.8 km/l',
        consumo_rodoviario: '10.5 km/l'
      },
      active: true,
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z'
    },
    {
      id: '3',
      name: 'Amarok',
      version: '2024',
      specs_json: {
        motor: '2.0L Turbo Diesel',
        potencia: '190 cv',
        torque: '45 kgf.m',
        transmissao: 'Automática 8 velocidades',
        tracao: '4x4',
        combustivel: 'Diesel',
        capacidade_carga: '1000 kg',
        capacidade_passageiros: '5',
        consumo_urbano: '9.2 km/l',
        consumo_rodoviario: '12.1 km/l'
      },
      active: true,
      created_at: '2024-01-03T00:00:00Z',
      updated_at: '2024-01-03T00:00:00Z'
    },
    {
      id: '4',
      name: 'S10',
      version: '2024',
      specs_json: {
        motor: '2.8L Turbo Diesel',
        potencia: '200 cv',
        torque: '50 kgf.m',
        transmissao: 'Automática 6 velocidades',
        tracao: '4x4',
        combustivel: 'Diesel',
        capacidade_carga: '1100 kg',
        capacidade_passageiros: '5',
        consumo_urbano: '8.8 km/l',
        consumo_rodoviario: '11.8 km/l'
      },
      active: true,
      created_at: '2024-01-04T00:00:00Z',
      updated_at: '2024-01-04T00:00:00Z'
    },
    {
      id: '5',
      name: 'L200 Triton',
      version: '2024',
      specs_json: {
        motor: '2.4L Turbo Diesel',
        potencia: '184 cv',
        torque: '43 kgf.m',
        transmissao: 'Automática 6 velocidades',
        tracao: '4x4',
        combustivel: 'Diesel',
        capacidade_carga: '950 kg',
        capacidade_passageiros: '5',
        consumo_urbano: '9.0 km/l',
        consumo_rodoviario: '11.5 km/l'
      },
      active: true,
      created_at: '2024-01-05T00:00:00Z',
      updated_at: '2024-01-05T00:00:00Z'
    },
    {
      id: '6',
      name: 'Frontier',
      version: '2024',
      specs_json: {
        motor: '2.3L Turbo Diesel',
        potencia: '190 cv',
        torque: '45 kgf.m',
        transmissao: 'Automática 7 velocidades',
        tracao: '4x4',
        combustivel: 'Diesel',
        capacidade_carga: '1000 kg',
        capacidade_passageiros: '5',
        consumo_urbano: '8.9 km/l',
        consumo_rodoviario: '11.9 km/l'
      },
      active: true,
      created_at: '2024-01-06T00:00:00Z',
      updated_at: '2024-01-06T00:00:00Z'
    }
  ];

  constructor() { }

  getVehicles(): Observable<Vehicle[]> {
    // Simular delay da API
    return of(this.mockVehicles).pipe(delay(500));
  }

  getVehicle(id: string): Observable<Vehicle> {
    const vehicle = this.mockVehicles.find(v => v.id === id);
    if (vehicle) {
      return of(vehicle).pipe(delay(300));
    }
    throw new Error('Veículo não encontrado');
  }

  createVehicle(vehicle: VehicleCreate): Observable<Vehicle> {
    const newVehicle: Vehicle = {
      id: (this.mockVehicles.length + 1).toString(),
      ...vehicle,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    this.mockVehicles.push(newVehicle);
    return of(newVehicle).pipe(delay(800));
  }

  updateVehicle(id: string, vehicle: Partial<VehicleCreate>): Observable<Vehicle> {
    const index = this.mockVehicles.findIndex(v => v.id === id);
    if (index !== -1) {
      this.mockVehicles[index] = {
        ...this.mockVehicles[index],
        ...vehicle,
        updated_at: new Date().toISOString()
      };
      return of(this.mockVehicles[index]).pipe(delay(600));
    }
    throw new Error('Veículo não encontrado');
  }

  deleteVehicle(id: string): Observable<void> {
    const index = this.mockVehicles.findIndex(v => v.id === id);
    if (index !== -1) {
      this.mockVehicles.splice(index, 1);
      return of(void 0).pipe(delay(400));
    }
    throw new Error('Veículo não encontrado');
  }

  importVehicles(file: File): Observable<any> {
    // Simular importação
    return of({
      message: 'Arquivo importado com sucesso',
      vehicles_imported: 10
    }).pipe(delay(2000));
  }
}