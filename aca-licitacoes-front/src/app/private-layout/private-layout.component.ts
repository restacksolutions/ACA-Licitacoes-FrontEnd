import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopbarComponent } from '../shared/components/topbar/topbar.component';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-private-layout',
  imports: [CommonModule, RouterOutlet, TopbarComponent],
  templateUrl: './private-layout.component.html',
  styleUrls: [],
})
export class PrivateLayoutComponent {}
