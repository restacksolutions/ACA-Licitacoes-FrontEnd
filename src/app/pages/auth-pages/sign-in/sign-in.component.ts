import { Component } from '@angular/core';
import { AuthPageLayoutComponent } from '../../../shared/layout/auth-page-layout/auth-page-layout.component';
// import { SigninFormComponent } from '../../../shared/components/auth/signin-form/signin-form.component'; // Temporarily disabled

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    AuthPageLayoutComponent,
    // SigninFormComponent, // Temporarily disabled
  ],
  templateUrl: './sign-in.component.html',
  styles: ``
})
export class SignInComponent {

}
