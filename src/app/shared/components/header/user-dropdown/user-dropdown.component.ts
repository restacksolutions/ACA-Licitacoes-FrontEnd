import { Component } from '@angular/core';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DropdownItemTwoComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component-two';
import { AuthService, User } from '../../../core/services';

@Component({
  selector: 'app-user-dropdown',
  standalone: true,
  templateUrl: './user-dropdown.component.html',
  imports:[CommonModule,RouterModule,DropdownComponent,DropdownItemTwoComponent]
})
export class UserDropdownComponent {
  isOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  get currentUser(): User | null {
    return this.authService.getCurrentUser();
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.closeDropdown();
  }
}