# 🔗 Integração com API - ACA Licitações

Este documento descreve como usar as integrações da API implementadas no sistema ACA Licitações.

## 📋 Serviços Implementados

### 1. 🔐 ApiService (`src/app/core/services/api.service.ts`)
Serviço base que centraliza todas as chamadas para a API do backend.

**Características:**
- Gerenciamento automático de tokens JWT
- Tratamento de erros padronizado
- Headers de autenticação automáticos
- Métodos para todos os endpoints da API

**Exemplo de uso:**
```typescript
import { ApiService } from './core/services/api.service';

constructor(private apiService: ApiService) {}

// Login
this.apiService.login({ email: 'user@example.com', password: 'password' })
  .subscribe(response => {
    console.log('Login realizado:', response);
  });

// Obter empresas
this.apiService.getCompanies()
  .subscribe(companies => {
    console.log('Empresas:', companies);
  });
```

### 2. 👤 UserService (`src/app/core/services/user.service.ts`)
Serviço específico para operações de usuários.

**Métodos principais:**
- `getCurrentUserProfile()` - Perfil completo do usuário
- `getUserCompanies()` - Empresas do usuário
- `inviteMember()` - Convidar membro para empresa
- `updateMemberRole()` - Atualizar role do membro

**Exemplo de uso:**
```typescript
import { UserService } from './core/services/user.service';

constructor(private userService: UserService) {}

// Obter perfil do usuário
this.userService.getCurrentUserProfile()
  .subscribe(profile => {
    console.log('Perfil:', profile);
  });

// Convidar membro
this.userService.inviteMember('company-id', 'user@example.com', 'member')
  .subscribe(member => {
    console.log('Membro convidado:', member);
  });
```

### 3. 🏢 CompanyService (Atualizado)
Serviço de empresas atualizado para usar a API do backend.

**Métodos principais:**
- `getCompanyInfo()` - Informações da empresa
- `updateCompanyInfo()` - Atualizar empresa
- `getCompanyMembers()` - Membros da empresa
- `addMember()` - Adicionar membro
- `getCompanyDocuments()` - Documentos da empresa
- `uploadDocument()` - Upload de documento

**Exemplo de uso:**
```typescript
import { CompanyService } from './pages/company/company.service';

constructor(private companyService: CompanyService) {}

// Obter informações da empresa
this.companyService.getCompanyInfo()
  .subscribe(company => {
    console.log('Empresa:', company);
  });

// Adicionar membro
this.companyService.addMember('user@example.com', 'admin')
  .subscribe(member => {
    console.log('Membro adicionado:', member);
  });
```

### 4. 📄 BidsService (`src/app/core/services/bids.service.ts`)
Serviço específico para operações de licitações.

**Métodos principais:**
- `getBids()` - Listar licitações
- `createBid()` - Criar licitação
- `updateBid()` - Atualizar licitação
- `deleteBid()` - Remover licitação
- `getBidsByStatus()` - Filtrar por status
- `getBidsNearDeadline()` - Próximas do prazo
- `getBidsStatistics()` - Estatísticas

**Exemplo de uso:**
```typescript
import { BidsService } from './core/services/bids.service';

constructor(private bidsService: BidsService) {}

// Obter licitações
this.bidsService.getBids('company-id')
  .subscribe(bids => {
    console.log('Licitações:', bids);
  });

// Criar licitação
const newBid = {
  title: 'Nova Licitação',
  orgao: 'Prefeitura Municipal',
  modalidade: 'Pregão Eletrônico',
  editalUrl: 'https://example.com/edital.pdf',
  sessionAt: '2025-10-15T14:00:00.000Z',
  submissionDeadline: '2025-10-10T18:00:00.000Z',
  status: 'draft',
  saleValue: '150000.50',
  notes: 'Observações importantes'
};

this.bidsService.createBid('company-id', newBid)
  .subscribe(bid => {
    console.log('Licitação criada:', bid);
  });
```

### 5. 📁 DocumentsService (`src/app/core/services/documents.service.ts`)
Serviço específico para operações de documentos.

**Métodos principais:**
- `getDocuments()` - Listar documentos
- `createDocument()` - Criar documento
- `uploadDocument()` - Upload de arquivo
- `getExpiredDocuments()` - Documentos expirados
- `getExpiringSoonDocuments()` - Próximos do vencimento
- `getDocumentStatistics()` - Estatísticas

**Exemplo de uso:**
```typescript
import { DocumentsService } from './core/services/documents.service';

constructor(private documentsService: DocumentsService) {}

// Obter documentos
this.documentsService.getDocuments('company-id')
  .subscribe(documents => {
    console.log('Documentos:', documents);
  });

// Criar documento
const newDocument = {
  docType: 'CNPJ',
  docNumber: '12.345.678/0001-90',
  issuer: 'Receita Federal',
  issueDate: '2020-01-15',
  expiresAt: '2030-01-15',
  notes: 'CNPJ principal'
};

this.documentsService.createDocument('company-id', newDocument)
  .subscribe(document => {
    console.log('Documento criado:', document);
  });
```

## 🔧 Configuração

### 1. Variáveis de Ambiente
As configurações da API estão em `src/environments/environment.ts`:

```typescript
export const environment = {
  // ... outras configurações
  apiBaseUrl: 'http://localhost:3000/v1',
  apiTimeout: 30000
};
```

### 2. Interceptors
O interceptor de autenticação está configurado em `src/app/app.config.ts`:

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    // ... outros providers
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
```

### 3. Autenticação
O `AuthService` foi atualizado para usar a API do backend:

```typescript
// Login
this.authService.login('user@example.com', 'password')
  .subscribe(success => {
    if (success) {
      console.log('Login realizado com sucesso');
    }
  });

// Cadastro
this.authService.signUpAndOnboard({
  fullName: 'João Silva',
  email: 'joao@example.com',
  password: 'password123',
  companyName: 'Empresa ABC',
  companyCnpj: '12.345.678/0001-90',
  companyPhone: '(11) 99999-9999',
  companyAddress: 'Rua das Flores, 123'
}).then(success => {
  if (success) {
    console.log('Cadastro realizado com sucesso');
  }
});
```

## 🚀 Como Usar

### 1. Injeção de Dependência
```typescript
import { Component } from '@angular/core';
import { ApiService, UserService, BidsService, DocumentsService } from './core/services';

@Component({
  selector: 'app-example',
  template: '...'
})
export class ExampleComponent {
  constructor(
    private apiService: ApiService,
    private userService: UserService,
    private bidsService: BidsService,
    private documentsService: DocumentsService
  ) {}
}
```

### 2. Tratamento de Erros
Todos os serviços incluem tratamento de erros padronizado:

```typescript
this.apiService.getCompanies()
  .subscribe({
    next: (companies) => {
      console.log('Sucesso:', companies);
    },
    error: (error) => {
      console.error('Erro:', error.message);
      // Tratar erro (ex: mostrar mensagem para o usuário)
    }
  });
```

### 3. Loading States
Para melhor UX, implemente loading states:

```typescript
export class ExampleComponent {
  loading = false;

  loadData() {
    this.loading = true;
    this.apiService.getCompanies()
      .subscribe({
        next: (data) => {
          this.loading = false;
          // Processar dados
        },
        error: (error) => {
          this.loading = false;
          // Tratar erro
        }
      });
  }
}
```

## 📚 Endpoints Disponíveis

### Autenticação
- `POST /auth/login` - Login
- `POST /auth/register` - Cadastro
- `GET /auth/me` - Perfil do usuário

### Usuários
- `GET /users/me` - Perfil completo com empresas

### Empresas
- `GET /companies` - Listar empresas
- `POST /companies` - Criar empresa
- `GET /companies/:id` - Obter empresa
- `PATCH /companies/:id` - Atualizar empresa

### Membros
- `GET /companies/:id/members` - Listar membros
- `POST /companies/:id/members` - Convidar membro
- `PATCH /companies/:id/members/:memberId` - Atualizar membro
- `DELETE /companies/:id/members/:memberId` - Remover membro

### Licitações
- `GET /companies/:id/bids` - Listar licitações
- `POST /companies/:id/bids` - Criar licitação
- `GET /companies/:id/bids/:bidId` - Obter licitação
- `PATCH /companies/:id/bids/:bidId` - Atualizar licitação
- `DELETE /companies/:id/bids/:bidId` - Remover licitação

### Documentos
- `GET /companies/:id/documents` - Listar documentos
- `POST /companies/:id/documents` - Criar documento
- `POST /companies/:id/documents/:docId/upload` - Upload de arquivo

## ⚠️ Observações Importantes

1. **Autenticação**: Todos os endpoints (exceto login/register) requerem token JWT
2. **Multi-tenancy**: Todas as operações são isoladas por empresa
3. **Tratamento de Erros**: Use os métodos de tratamento de erro dos serviços
4. **Loading States**: Implemente indicadores de carregamento para melhor UX
5. **Validação**: A API valida todos os dados de entrada automaticamente

## 🔄 Próximos Passos

1. Testar todas as integrações com o backend
2. Implementar refresh token automático
3. Adicionar cache para melhor performance
4. Implementar retry automático para falhas de rede
5. Adicionar logs detalhados para debugging

---

*Documentação gerada automaticamente - Última atualização: 2025-09-22*
