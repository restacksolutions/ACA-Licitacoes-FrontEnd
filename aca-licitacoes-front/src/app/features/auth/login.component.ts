import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { AuthHeaderComponent } from '../../shared/components/auth-header/auth-header.component';


@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, AuthHeaderComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal('');
  submitted = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit() {
    this.submitted.set(true);
    this.error.set('');
    if (this.form.invalid) return;

    this.loading.set(true);
    this.auth.login(this.form.value as any).subscribe({
      next: () => { this.loading.set(false); this.router.navigateByUrl('/'); },
      error: (e) => {
        this.loading.set(false);
        this.error.set(
          e?.error?.message || (e?.status === 401 ? 'Credenciais inválidas.' : 'Falha no login.')
        );
      }
    });
  }
}
