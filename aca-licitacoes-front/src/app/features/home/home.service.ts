import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CompanyFeatureService, CompanyDoc } from '../company/company.service';
import { LicitacoesService, Licitacao } from '../licitacoes/licitacoes.service';

export interface Company {
  id: string;
  name: string;
}

export interface DocsKpi {
  valid: number;
  expiring: number;
  expired: number;
}

export interface LicCounts {
  future: number;
  past: number;
}

export interface LicitacaoPreview {
  id: string;
  title: string;
  status: string;
  date: string;
  formattedDate: string;
}

@Injectable({ providedIn: 'root' })
export class HomeService {
  private http = inject(HttpClient);
  private companyService = inject(CompanyFeatureService);
  private licitacoesService = inject(LicitacoesService);
  private API = environment.apiBaseUrl;

  // Lista empresas para o seletor
  listCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.API}/companies`);
  }

  // Obtém KPIs de documentos
  getDocsKpi(): Observable<DocsKpi> {
    return this.companyService.listDocs('').pipe(
      map((docs: any[]) => {
        const today = this.startOfToday();
        const in30Days = new Date(today);
        in30Days.setDate(today.getDate() + 30);
        
        let valid = 0;
        let expiring = 0;
        let expired = 0;
        
        docs.forEach(doc => {
          if (!doc.expiresAt) {
            valid++;
            return;
          }
          
          const expiryDate = this.parseDate(doc.expiresAt);
          if (!expiryDate) {
            valid++;
            return;
          }
          
          if (expiryDate < today) {
            expired++;
          } else if (expiryDate <= in30Days) {
            expiring++;
          } else {
            valid++;
          }
        });
        
        return { valid, expiring, expired };
      })
    );
  }

  // Obtém documentos próximos ao vencimento
  getUpcomingDocs(days: number = 15): Observable<any[]> {
    return this.companyService.listDocs('').pipe(
      map((docs: any[]) => {
        const today = this.startOfToday();
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + days);
        
        return docs.filter(doc => {
          if (!doc.expiresAt) return false;
          const expiryDate = this.parseDate(doc.expiresAt);
          if (!expiryDate) return false;
          return expiryDate >= today && expiryDate <= futureDate;
        });
      })
    );
  }

  // Obtém preview das licitações
  getLicitacoesPreview(): Observable<LicitacaoPreview[]> {
    return this.licitacoesService.list().pipe(
      map((lics: any[]) => lics.map(lic => this.normalizeLicitacao(lic)))
    );
  }

  // Obtém as próximas 5 licitações
  getNextFive(): Observable<LicitacaoPreview[]> {
    return this.licitacoesService.list().pipe(
      map((lics: any[]) => {
        const today = this.startOfToday();
        
        return lics
          .map(lic => this.normalizeLicitacao(lic))
          .filter(lic => {
            if (!lic.date) return false;
            const licDate = this.parseDate(lic.date);
            return licDate && licDate >= today;
          })
          .sort((a, b) => {
            const dateA = this.parseDate(a.date);
            const dateB = this.parseDate(b.date);
            if (!dateA || !dateB) return 0;
            return dateA.getTime() - dateB.getTime();
          })
          .slice(0, 5);
      })
    );
  }

  // Conta licitações futuras vs passadas
  getLicCounts(): Observable<LicCounts> {
    return this.licitacoesService.list().pipe(
      map((lics: any[]) => {
        const today = this.startOfToday();
        let future = 0;
        let past = 0;
        
        lics.forEach(lic => {
          const normalized = this.normalizeLicitacao(lic);
          if (!normalized.date) {
            future++; // Assumir futura se não tem data
            return;
          }
          
          const licDate = this.parseDate(normalized.date);
          if (!licDate) {
            future++;
            return;
          }
          
          if (licDate >= today) {
            future++;
          } else {
            past++;
          }
        });
        
        return { future, past };
      })
    );
  }

  // Utilitário para início do dia
  private startOfToday(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  // Parse robusto de datas
  private parseDate(dateInput: any): Date | null {
    if (!dateInput) return null;
    
    // Se já é um Date
    if (dateInput instanceof Date) return dateInput;
    
    // Se é timestamp
    if (typeof dateInput === 'number') {
      return new Date(dateInput);
    }
    
    // Se é string
    if (typeof dateInput === 'string') {
      // Tentar ISO
      if (dateInput.includes('T') || dateInput.includes('Z')) {
        const isoDate = new Date(dateInput);
        if (!isNaN(isoDate.getTime())) return isoDate;
      }
      
      // Tentar dd/MM/yyyy
      const ddmmyyyy = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dateInput);
      if (ddmmyyyy) {
        const [, day, month, year] = ddmmyyyy;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
      
      // Tentar parse padrão
      const defaultDate = new Date(dateInput);
      if (!isNaN(defaultDate.getTime())) return defaultDate;
    }
    
    return null;
  }

  // Normaliza licitação para preview
  private normalizeLicitacao(lic: any): LicitacaoPreview {
    const title = lic.title || lic.name || lic.objeto || 'Sem título';
    const status = lic.status || 'draft';
    
    // Tentar obter data em ordem de prioridade
    const dateFields = ['openingDate', 'sessionDate', 'deadline', 'data'];
    let date: Date | null = null;
    
    for (const field of dateFields) {
      if (lic[field]) {
        date = this.parseDate(lic[field]);
        if (date) break;
      }
    }
    
    const dateStr = date ? date.toISOString() : '';
    const formattedDate = date ? this.formatDate(date) : '';
    
    return {
      id: lic.id,
      title,
      status,
      date: dateStr,
      formattedDate
    };
  }

  // Formata data para dd/MM
  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  }
}
