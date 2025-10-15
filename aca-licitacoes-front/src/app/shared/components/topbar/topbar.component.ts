import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyService } from '../../../core/services/company.service';
import { AuthService } from '../../../features/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-topbar',
  imports: [CommonModule],
  templateUrl: './topbar.component.html',
  styleUrls: [],
})
export class TopbarComponent {
  private company = inject(CompanyService);
  private auth = inject(AuthService);
  private router = inject(Router);

  companyId = signal(this.company.get());

  saveCompany(v: string) {
    const id = (v || '').trim();
    this.company.set(id);
    this.companyId.set(this.company.get()); // reflete o valor persistido
  }

  onEnterKey(event: Event) {
    const target = event.target as HTMLInputElement;
    this.saveCompany(target.value);
  }

  onSaveClick(event: Event) {
    const target = event.target as HTMLElement;
    const input = target.previousElementSibling as HTMLInputElement;
    if (input) {
      this.saveCompany(input.value);
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}

