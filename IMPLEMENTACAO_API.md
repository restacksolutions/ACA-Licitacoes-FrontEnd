# 📚 Documentação de Implementação da API - ACA Licitações

Este documento contém todas as informações necessárias para implementar a integração com a API do sistema ACA Licitações no frontend.

## 🔗 Informações Gerais

- **URL Base**: `http://localhost:3000/v1`
- **Documentação Swagger**: `http://localhost:3000/docs`
- **Autenticação**: JWT Bearer Token
- **Content-Type**: `application/json` (exceto uploads de arquivos)

## 🔐 Autenticação

### Headers Obrigatórios
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Fluxo de Autenticação
1. **Registro/Login** → Recebe `access_token` e `refresh_token`
2. **Todas as requisições** → Incluir `Authorization: Bearer <access_token>`
3. **Token expirado** → Usar `refresh_token` para renovar

---

## 📋 Endpoints Disponíveis

### 1. 🔐 Autenticação (`/auth`)

#### POST `/auth/register`
**Descrição**: Registrar novo usuário e empresa
**Autenticação**: ❌ Não requerida

**Request Body:**
```json
{
  "fullName": "João Silva",
  "email": "joao@example.com",
  "password": "Senha123",
  "companyName": "Empresa do João",
  "companyCnpj": "00.000.000/0001-00",
  "companyPhone": "(11) 99999-9999",
  "companyAddress": "Rua das Flores, 123"
}
```

**Response (201):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "access_expires_at": "2025-09-23T21:28:56.693Z",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_expires_at": "2025-09-30T21:28:56.693Z",
  "user": {
    "id": "uuid",
    "fullName": "João Silva",
    "email": "joao@example.com",
    "createdAt": "2025-09-22T20:30:00.000Z"
  },
  "company": {
    "id": "uuid",
    "name": "Empresa do João",
    "cnpj": "00.000.000/0001-00",
    "active": true,
    "createdAt": "2025-09-22T20:30:00.000Z"
  },
  "membership": {
    "id": "uuid",
    "role": "owner"
  }
}
```

#### POST `/auth/login`
**Descrição**: Login com email e senha
**Autenticação**: ❌ Não requerida

**Request Body:**
```json
{
  "email": "joao@example.com",
  "password": "Senha123"
}
```

**Response (200):** Mesmo formato do register

#### GET `/auth/me`
**Descrição**: Obter perfil do usuário autenticado
**Autenticação**: ✅ Requerida

**Response (200):**
```json
{
  "id": "uuid",
  "fullName": "João Silva",
  "email": "joao@example.com",
  "createdAt": "2025-09-22T20:30:00.000Z"
}
```

---

### 2. 👤 Usuários (`/users`)

#### GET `/users/me`
**Descrição**: Obter perfil completo do usuário com empresas e membros
**Autenticação**: ✅ Requerida

**Response (200):**
```json
{
  "id": "uuid",
  "fullName": "João Silva",
  "email": "joao@example.com",
  "createdAt": "2025-09-22T20:30:00.000Z",
  "memberships": [
    {
      "membershipId": "uuid",
      "role": "owner",
      "joinedAt": "2025-09-22T20:30:00.000Z",
      "company": {
        "id": "uuid",
        "name": "Empresa ABC Ltda",
        "cnpj": "12.345.678/0001-90",
        "phone": "(11) 99999-9999",
        "address": "Rua das Flores, 123",
        "logoPath": "logos/empresa-abc.png",
        "letterheadPath": "letterheads/empresa-abc.png",
        "active": true,
        "createdAt": "2025-09-22T20:30:00.000Z",
        "createdBy": "uuid",
        "creator": {
          "id": "uuid",
          "fullName": "João Silva",
          "email": "joao@example.com"
        }
      }
    }
  ]
}
```

---

### 3. 🏢 Empresas (`/companies`)

#### GET `/companies`
**Descrição**: Listar empresas do usuário
**Autenticação**: ✅ Requerida

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "Empresa ABC Ltda",
    "cnpj": "12.345.678/0001-90",
    "phone": "(11) 99999-9999",
    "address": "Rua das Flores, 123",
    "logoPath": "logos/empresa-abc.png",
    "letterheadPath": "letterheads/empresa-abc.png",
    "active": true,
    "createdAt": "2025-09-22T20:30:00.000Z",
    "createdBy": "uuid"
  }
]
```

#### POST `/companies`
**Descrição**: Criar nova empresa
**Autenticação**: ✅ Requerida

**Request Body:**
```json
{
  "name": "Nova Empresa Ltda",
  "cnpj": "12.345.678/0001-90",
  "phone": "(11) 99999-9999",
  "address": "Rua das Flores, 123",
  "logoPath": "https://storage.com/logo.png",
  "letterheadPath": "https://storage.com/letterhead.pdf",
  "active": true
}
```

#### GET `/companies/:companyId`
**Descrição**: Obter detalhes de uma empresa específica
**Autenticação**: ✅ Requerida + CompanyGuard

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Empresa ABC Ltda",
  "cnpj": "12.345.678/0001-90",
  "phone": "(11) 99999-9999",
  "address": "Rua das Flores, 123",
  "logoPath": "logos/empresa-abc.png",
  "letterheadPath": "letterheads/empresa-abc.png",
  "active": true,
  "createdAt": "2025-09-22T20:30:00.000Z",
  "createdBy": "uuid",
  "creator": {
    "id": "uuid",
    "fullName": "João Silva",
    "email": "joao@example.com"
  }
}
```

#### PATCH `/companies/:companyId`
**Descrição**: Atualizar empresa
**Autenticação**: ✅ Requerida + CompanyGuard + RolesGuard (owner/admin)

**Request Body:**
```json
{
  "name": "Empresa Atualizada Ltda",
  "phone": "(11) 88888-8888",
  "address": "Nova Rua, 456"
}
```

---

### 4. 👥 Membros (`/companies/:companyId/members`)

#### GET `/companies/:companyId/members`
**Descrição**: Listar membros da empresa
**Autenticação**: ✅ Requerida + CompanyGuard

**Response (200):**
```json
[
  {
    "id": "uuid",
    "role": "owner",
    "userId": "uuid",
    "userFullName": "João Silva",
    "userEmail": "joao@example.com",
    "createdAt": "2025-09-22T20:30:00.000Z"
  }
]
```

#### POST `/companies/:companyId/members`
**Descrição**: Convidar novo membro
**Autenticação**: ✅ Requerida + CompanyGuard + RolesGuard (owner/admin)

**Request Body:**
```json
{
  "email": "novo@example.com",
  "role": "member"
}
```

#### PATCH `/companies/:companyId/members/:memberId`
**Descrição**: Atualizar role do membro
**Autenticação**: ✅ Requerida + CompanyGuard + RolesGuard (owner/admin)

**Request Body:**
```json
{
  "role": "admin"
}
```

#### DELETE `/companies/:companyId/members/:memberId`
**Descrição**: Remover membro
**Autenticação**: ✅ Requerida + CompanyGuard + RolesGuard (owner/admin)

---

### 5. 📄 Licitações (`/companies/:companyId/bids`)

#### GET `/companies/:companyId/bids`
**Descrição**: Listar licitações da empresa
**Autenticação**: ✅ Requerida + CompanyGuard

**Response (200):**
```json
[
  {
    "id": "uuid",
    "title": "Licitação para Fornecimento de Equipamentos",
    "orgao": "Prefeitura Municipal de São Paulo",
    "modalidade": "Pregão Eletrônico",
    "editalUrl": "https://example.com/edital.pdf",
    "sessionAt": "2025-10-15T14:00:00.000Z",
    "submissionDeadline": "2025-10-10T18:00:00.000Z",
    "status": "draft",
    "saleValue": "150000.50",
    "notes": "Observações importantes",
    "companyId": "uuid",
    "createdAt": "2025-09-22T20:30:00.000Z",
    "updatedAt": "2025-09-22T20:30:00.000Z"
  }
]
```

#### POST `/companies/:companyId/bids`
**Descrição**: Criar nova licitação
**Autenticação**: ✅ Requerida + CompanyGuard + RolesGuard (owner/admin)

**Request Body:**
```json
{
  "title": "Licitação para Fornecimento de Equipamentos",
  "orgao": "Prefeitura Municipal de São Paulo",
  "modalidade": "Pregão Eletrônico",
  "editalUrl": "https://example.com/edital.pdf",
  "sessionAt": "2025-10-15T14:00:00.000Z",
  "submissionDeadline": "2025-10-10T18:00:00.000Z",
  "status": "draft",
  "saleValue": "150000.50",
  "notes": "Observações importantes"
}
```

#### GET `/companies/:companyId/bids/:bidId`
**Descrição**: Obter detalhes de uma licitação
**Autenticação**: ✅ Requerida + CompanyGuard

#### PATCH `/companies/:companyId/bids/:bidId`
**Descrição**: Atualizar licitação
**Autenticação**: ✅ Requerida + CompanyGuard + RolesGuard (owner/admin)

#### DELETE `/companies/:companyId/bids/:bidId`
**Descrição**: Remover licitação
**Autenticação**: ✅ Requerida + CompanyGuard + RolesGuard (owner/admin)

---

### 6. 📁 Documentos da Empresa (`/companies/:companyId/documents`)

#### GET `/companies/:companyId/documents`
**Descrição**: Listar documentos da empresa
**Autenticação**: ✅ Requerida + CompanyGuard

**Response (200):**
```json
[
  {
    "id": "uuid",
    "docType": "CNPJ",
    "docNumber": "12.345.678/0001-90",
    "issuer": "Receita Federal",
    "issueDate": "2020-01-15",
    "expiresAt": "2030-01-15",
    "filePath": "https://storage.com/document.pdf",
    "notes": "Documento em bom estado",
    "version": 1,
    "createdAt": "2025-09-22T20:30:00.000Z",
    "updatedAt": "2025-09-22T20:30:00.000Z"
  }
]
```

#### POST `/companies/:companyId/documents`
**Descrição**: Criar novo documento
**Autenticação**: ✅ Requerida + CompanyGuard

**Request Body:**
```json
{
  "docType": "CNPJ",
  "docNumber": "12.345.678/0001-90",
  "issuer": "Receita Federal",
  "issueDate": "2020-01-15",
  "expiresAt": "2030-01-15",
  "notes": "Documento em bom estado"
}
```

#### POST `/companies/:companyId/documents/:docId/upload`
**Descrição**: Upload de arquivo para documento
**Autenticação**: ✅ Requerida + CompanyGuard
**Content-Type**: `multipart/form-data`

**Request Body (FormData):**
```
file: [arquivo]
```

---

### 7. 🏥 Health Check (`/health`)

#### GET `/health`
**Descrição**: Verificar status da API
**Autenticação**: ❌ Não requerida

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2025-09-22T20:30:00.000Z",
  "uptime": 3600,
  "environment": "development"
}
```

#### GET `/health/database`
**Descrição**: Verificar conexão com banco de dados
**Autenticação**: ❌ Não requerida

#### GET `/health/prisma`
**Descrição**: Informações do Prisma e contadores
**Autenticação**: ❌ Não requerida

---

## 🔒 Sistema de Permissões

### Roles Disponíveis
- **owner**: Acesso total à empresa
- **admin**: Acesso administrativo (pode gerenciar membros e licitações)
- **member**: Acesso básico (apenas visualização)

### Guards
- **JwtAuthGuard**: Verifica token JWT
- **CompanyGuard**: Verifica se usuário é membro da empresa
- **RolesGuard**: Verifica permissões baseadas em role

---

## 📝 Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Dados inválidos |
| 401 | Não autorizado |
| 403 | Acesso negado |
| 404 | Recurso não encontrado |
| 409 | Conflito (email/CNPJ já existe) |
| 500 | Erro interno do servidor |

---

## 🚀 Exemplos de Implementação

### JavaScript/TypeScript (Fetch API)

```javascript
// Configuração base
const API_BASE = 'http://localhost:3000/v1';

// Função para fazer requisições autenticadas
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('access_token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    },
    ...options
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

// Exemplo: Login
async function login(email, password) {
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  
  // Salvar tokens
  localStorage.setItem('access_token', response.access_token);
  localStorage.setItem('refresh_token', response.refresh_token);
  
  return response;
}

// Exemplo: Listar empresas
async function getCompanies() {
  return apiRequest('/companies');
}

// Exemplo: Criar licitação
async function createBid(companyId, bidData) {
  return apiRequest(`/companies/${companyId}/bids`, {
    method: 'POST',
    body: JSON.stringify(bidData)
  });
}
```

### Axios (JavaScript/TypeScript)

```javascript
import axios from 'axios';

// Configuração do Axios
const api = axios.create({
  baseURL: 'http://localhost:3000/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado, tentar renovar
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await api.post('/auth/refresh', {
            refresh_token: refreshToken
          });
          localStorage.setItem('access_token', response.data.access_token);
          // Tentar novamente a requisição original
          return api.request(error.config);
        } catch (refreshError) {
          // Refresh falhou, redirecionar para login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Exemplos de uso
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me')
};

export const companiesAPI = {
  list: () => api.get('/companies'),
  get: (id) => api.get(`/companies/${id}`),
  create: (data) => api.post('/companies', data),
  update: (id, data) => api.patch(`/companies/${id}`, data)
};

export const bidsAPI = {
  list: (companyId) => api.get(`/companies/${companyId}/bids`),
  get: (companyId, bidId) => api.get(`/companies/${companyId}/bids/${bidId}`),
  create: (companyId, data) => api.post(`/companies/${companyId}/bids`, data),
  update: (companyId, bidId, data) => api.patch(`/companies/${companyId}/bids/${bidId}`, data),
  delete: (companyId, bidId) => api.delete(`/companies/${companyId}/bids/${bidId}`)
};
```

---

## 🔧 Configuração de Desenvolvimento

### Variáveis de Ambiente Necessárias
```env
# Banco de dados
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="seu-jwt-secret-aqui"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"

# Supabase (para autenticação)
SUPABASE_URL="sua-url-supabase"
SUPABASE_ANON_KEY="sua-chave-anonima-supabase"

# API
PORT=3000
NODE_ENV=development

# Swagger
SWAGGER_TITLE="ACA Licitações API"
SWAGGER_VERSION="1.0"
```

### CORS
A API está configurada para aceitar requisições de:
- `http://localhost:3000`
- `http://localhost:3001`

---

## 📚 Recursos Adicionais

- **Swagger UI**: `http://localhost:3000/docs` - Documentação interativa
- **Health Check**: `http://localhost:3000/v1/health` - Status da API
- **Database Health**: `http://localhost:3000/v1/health/database` - Status do banco

---

## ⚠️ Observações Importantes

1. **Multi-tenancy**: Todas as operações são isoladas por empresa
2. **Autenticação**: Sempre incluir o token JWT no header Authorization
3. **Validação**: A API valida todos os dados de entrada automaticamente
4. **Upload de Arquivos**: Use `multipart/form-data` para uploads
5. **Paginação**: Implementar conforme necessário (não implementada na versão atual)
6. **Filtros**: Implementar conforme necessário (não implementados na versão atual)

---

*Documentação gerada automaticamente - Última atualização: 2025-09-22*
