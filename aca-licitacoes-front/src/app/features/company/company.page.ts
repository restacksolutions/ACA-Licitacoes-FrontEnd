import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CompanyFeatureService, Company, Employee, CompanyDoc } from './company.service';

const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const parse = (s?: string | null) => (s ? new Date(s) : null);

type Tab = 'info' | 'func' | 'docs';

@Component({
  standalone: true,
  selector: 'app-company-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './company.page.html',
})
export class CompanyPage {
  private api = inject(CompanyFeatureService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);

  tab = signal<Tab>('info');
  companyId = this.route.snapshot.paramMap.get('companyId')!;

  // ------- INFO -------
  infoForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    cnpj: [''],
    phone: [''],
    address: [''],
    active: [true],
  });
  savedInfo = signal(false);

  // ------- FUNCIONÁRIOS -------
  employees = signal<Employee[]>([]);
  editingEmpId: string | null = null;
  empForm = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: [''],
    active: [true],
  });

  // ------- DOCUMENTOS -------
  docs = signal<CompanyDoc[]>([]);
  validos = computed(() => this.docs().filter(d => {
    const exp = parse(d.expiresAt); if (!exp) return false;
    return exp >= addDays(new Date(), 30);
  }));
  aviso = computed(() => this.docs().filter(d => {
    const exp = parse(d.expiresAt); if (!exp) return false;
    const t = new Date();
    return exp >= t && exp < addDays(t, 30);
  }));
  expirados = computed(() => this.docs().filter(d => {
    const exp = parse(d.expiresAt); if (!exp) return !!d.required;
    return exp < new Date();
  }));

  constructor() {
    // carregar dados iniciais
    this.api.getCompany(this.companyId).subscribe((companies: Company[]) => {
      // Tentar encontrar a empresa pelo ID, ou usar a primeira se não encontrar
      const company = companies.find(c => c.id === this.companyId) || companies[0];
      if (company) {
        // Formatar CNPJ se existir
        const companyData = { ...company };
        if (companyData.cnpj) {
          companyData.cnpj = this.formatCNPJValue(companyData.cnpj);
        }
        this.infoForm.patchValue(companyData);
      }
    });
    this.reloadEmployees();
    this.reloadDocs();
  }

  // Formatar CNPJ para exibição (quando carregado do servidor)
  formatCNPJValue(cnpj: string): string {
    const digits = cnpj.replace(/\D/g, '');
    if (digits.length === 14) {
      return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    }
    return cnpj;
  }

  // Máscara de CNPJ durante digitação
  formatCNPJ(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Remove tudo que não é dígito
    
    if (value.length <= 14) {
      // Aplica a máscara: 00.000.000/0000-00
      if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d)/, '$1.$2');
      }
      if (value.length > 5) {
        value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      }
      if (value.length > 8) {
        value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
      }
      if (value.length > 12) {
        value = value.replace(/(\d{4})(\d)/, '$1-$2');
      }
    }
    
    input.value = value;
    this.infoForm.get('cnpj')?.setValue(value);
  }

  // INFO
  saveInfo() {
    const formValue = this.infoForm.value;
    const value: Partial<Company> = {};
    
    // Converter null para undefined e remover campos vazios
    if (formValue.name && formValue.name !== '') value.name = formValue.name;
    if (formValue.cnpj && formValue.cnpj !== '') {
      // Remove a máscara do CNPJ antes de enviar
      value.cnpj = formValue.cnpj.replace(/\D/g, '');
    }
    if (formValue.phone && formValue.phone !== '') value.phone = formValue.phone;
    if (formValue.address && formValue.address !== '') value.address = formValue.address;
    if (formValue.active !== null && formValue.active !== undefined) value.active = formValue.active;

    this.api.updateCompany(this.companyId, value).subscribe(() => {
      this.savedInfo.set(true);
      setTimeout(() => this.savedInfo.set(false), 1500);
    });
  }

  // FUNCIONÁRIOS
  reloadEmployees() { this.api.listEmployees(this.companyId).subscribe(r => this.employees.set(r)); }
  editEmp(e: Employee) {
    this.editingEmpId = e.id;
    this.empForm.patchValue({ fullName: e.fullName, email: e.email, role: e.role ?? '', active: e.active });
  }
  saveEmp() {
    const formValue = this.empForm.value;
    const dto: Partial<Employee> = {};
    
    // Converter null para undefined e remover campos vazios
    if (formValue.fullName && formValue.fullName !== '') dto.fullName = formValue.fullName;
    if (formValue.email && formValue.email !== '') dto.email = formValue.email;
    if (formValue.role && formValue.role !== '') dto.role = formValue.role;
    if (formValue.active !== null && formValue.active !== undefined) dto.active = formValue.active;

    const req = this.editingEmpId
      ? this.api.updateEmployee(this.companyId, this.editingEmpId, dto)
      : this.api.createEmployee(this.companyId, dto);
    req.subscribe(() => { this.editingEmpId = null; this.empForm.reset({ active: true }); this.reloadEmployees(); });
  }
  removeEmp(e: Employee) { this.api.deleteEmployee(this.companyId, e.id).subscribe(() => this.reloadEmployees()); }

  // DOCUMENTOS
  reloadDocs() { this.api.listDocs(this.companyId).subscribe(d => this.docs.set(d)); }
  onFile(d: CompanyDoc, ev: Event) {
    const file = (ev.target as HTMLInputElement).files?.[0]; if (!file) return;
    this.api.uploadDocFile(this.companyId, d.id, file).subscribe(() => this.reloadDocs());
    (ev.target as HTMLInputElement).value = '';
  }
  download(d: CompanyDoc) {
    this.api.downloadDocFile(this.companyId, d.id).subscribe(blob => {
      const url = URL.createObjectURL(blob); const a = document.createElement('a');
      a.href = url; a.download = d.fileName || `${d.name}.pdf`; a.click(); URL.revokeObjectURL(url);
    });
  }
}
