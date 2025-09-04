import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VehicleService, Vehicle } from '../../../core/services';

@Component({
  selector: 'app-vehicles-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './vehicles-list.component.html',
  styleUrls: ['./vehicles-list.component.css']
})
export class VehiclesListComponent implements OnInit {
  vehicles: Vehicle[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(private vehicleService: VehicleService) {}

  ngOnInit() {
    this.loadVehicles();
  }

  loadVehicles() {
    this.isLoading = true;
    this.errorMessage = '';

    this.vehicleService.getVehicles().subscribe({
      next: (vehicles: Vehicle[]) => {
        this.vehicles = vehicles;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Erro ao carregar veículos';
        this.isLoading = false;
        console.error('Erro:', error);
      }
    });
  }
}
