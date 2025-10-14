import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { AuthHeaderComponent } from '../../shared/components/auth-header/auth-header.component';

// ————— Helpers: validações —————
function cnpjDigits(v: string) { return (v || '').replace(/\D/g, ''); }

function cnpjValidator(ctrl: AbstractControl): ValidationErrors | null {
  const d = cnpjDigits(ctrl.value || '');
  if (!d) return { required: true };
  return d.length === 14 ? null : { cnpjInvalid: true };
}

// força de senha: min 8, 1 maiúscula, 1 minúscula, 1 número, 1 especial
function passwordStrength(ctrl: AbstractControl): ValidationErrors | null {
  const v = (ctrl.value || '') as string;
  if (!v) return { required: true };
  const ok = /[A-Z]/.test(v) && /[a-z]/.test(v) && /\d/.test(v) && /[^A-Za-z0-9]/.test(v) && v.length >= 8;
  return ok ? null : { weak: true };
}

function match(other: () => AbstractControl | null) {
  return (ctrl: AbstractControl): ValidationErrors | null => {
    const target = other();
    return !target || ctrl.value === target.value ? null : { mismatch: true };
  };
}

// ————— Máscara CNPJ —————
function formatCnpjMasked(value: string) {
  const d = cnpjDigits(value).slice(0, 14);
  const parts = [];
  if (d.length > 0) parts.push(d.substring(0, 2));
  if (d.length >= 3) parts[0] += '.' + d.substring(2, 5);
  if (d.length >= 6) parts[0] += '.' + d.substring(5, 8);
  if (d.length >= 9) parts[0] += '/' + d.substring(8, 12);
  if (d.length >= 13) parts[0] += '-' + d.substring(12, 14);
  return parts[0] || d;
}

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, AuthHeaderComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal('');
  success = signal('');

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [passwordStrength]],
    confirm: ['', []],
    companyName: ['', [Validators.required, Validators.minLength(2)]],
    cnpj: ['', [cnpjValidator]],
  });

  constructor() {
    this.form.controls.confirm.addValidators(match(() => this.form.controls.password));
  }

  // aplica máscara “on input” mantendo o form válido
  onCnpjInput(e: Event) {
    const el = e.target as HTMLInputElement;
    const masked = formatCnpjMasked(el.value);
    el.value = masked;
    this.form.controls.cnpj.setValue(masked, { emitEvent: false });
  }

  submit() {
    this.error.set('');
    this.success.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;
    const body = {
      email: v.email!.trim(),
      password: v.password!,
      fullName: v.fullName!.trim(),
      companyName: v.companyName!.trim(),
      cnpj: cnpjDigits(v.cnpj!), // back espera só dígitos
    };

    this.loading.set(true);
    this.auth.register(body).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set('Cadastro concluído! Faça login para continuar.');
        setTimeout(() => this.router.navigateByUrl('/login'), 800);
      },
      error: (e) => {
        this.loading.set(false);
        this.error.set(e?.error?.message || 'Falha no cadastro.');
      }
    });
  }
}
