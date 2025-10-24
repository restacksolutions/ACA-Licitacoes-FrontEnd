# 📋 API de Licitações - Guia de Integração Frontend

Este documento contém todas as informações necessárias para integrar as APIs do módulo de **Licitações** no seu frontend.

## 🔗 Informações Básicas

- **URL Base**: `http://localhost:3000` (desenvolvimento)
- **Swagger**: `http://localhost:3000/docs`
- **Autenticação**: JWT Bearer Token + Company Guard
- **Headers Obrigatórios**: 
  - `Authorization: Bearer <access_token>`
  - `X-Company-Id: <company_id>`

## 🔐 Autenticação

Todas as rotas requerem **dois guards**:
1. **JwtAccessGuard**: Valida o token JWT
2. **CompanyGuard**: Valida se o usuário tem acesso à empresa

**Headers obrigatórios:**
- `Authorization: Bearer <access_token>`
- `X-Company-Id: <company_id>`

> **Nota**: O `CompanyGuard` tenta obter o `companyId` do header `X-Company-Id`, parâmetro da URL ou body da requisição.

## 📊 Estrutura de Dados

### Status da Licitação
```typescript
enum LicStatus {
  draft = 'draft',        // Rascunho
  open = 'open',          // Aberta
  closed = 'closed',      // Fechada
  cancelled = 'cancelled', // Cancelada
  awarded = 'awarded'     // Homologada
}
```

### DTOs Principais

#### CreateLicitacaoDto
```typescript
{
  title: string;                    // Título da licitação (obrigatório)
  status: LicStatus;               // Status (obrigatório)
  editalUrl?: string;              // URL do edital (opcional)
  sessionDate?: string;            // Data da sessão (ISO 8601)
  submissionDeadline?: string;     // Prazo de entrega (ISO 8601)
}
```

#### UpdateLicitacaoDto
```typescript
{
  title?: string;
  status?: LicStatus;
  editalUrl?: string;
  sessionDate?: string;
  submissionDeadline?: string;
}
```

#### CreateLicDocDto
```typescript
{
  name: string;                    // Nome do documento (obrigatório)
  docType?: string;               // Tipo do documento
  required?: boolean;             // Se é obrigatório (default: true)
  submitted?: boolean;            // Se foi entregue (default: false)
  signed?: boolean;               // Se está assinado
  issueDate?: string;             // Data de emissão (ISO 8601)
  expiresAt?: string;             // Data de vencimento (ISO 8601)
  notes?: string;                 // Observações
}
```

#### CreateLicEventDto
```typescript
{
  type: string;                   // Tipo do evento (ex: 'status_changed', 'note', 'deadline_update')
  payload: any;                   // Dados do evento (JSON arbitrário)
}
```

### Tipos de Resposta

#### Licitacao (Resposta completa)
```typescript
{
  id: string;                     // UUID da licitação
  title: string;                  // Título
  status: LicStatus;              // Status atual
  editalUrl?: string;             // URL do edital
  sessionDate?: string;           // Data da sessão (ISO 8601)
  submissionDeadline?: string;    // Prazo de entrega (ISO 8601)
  companyId: string;              // ID da empresa
  createdAt: string;              // Data de criação (ISO 8601)
  updatedAt: string;              // Data de atualização (ISO 8601)
}
```

#### LicitacaoDocument (Documento)
```typescript
{
  id: string;                     // UUID do documento
  name: string;                   // Nome do documento
  docType?: string;               // Tipo do documento
  required: boolean;              // Se é obrigatório
  submitted: boolean;             // Se foi entregue
  signed: boolean;                // Se está assinado
  issueDate?: string;             // Data de emissão (ISO 8601)
  expiresAt?: string;             // Data de vencimento (ISO 8601)
  notes?: string;                 // Observações
  licitacaoId: string;            // ID da licitação
  // Campos de arquivo (após upload)
  fileName?: string;              // Nome do arquivo
  fileMime?: string;              // MIME type
  fileSize?: number;              // Tamanho em bytes
  fileSha256?: string;            // Hash SHA256
  createdAt: string;              // Data de criação (ISO 8601)
  updatedAt: string;              // Data de atualização (ISO 8601)
}
```

#### LicitacaoEvent (Evento)
```typescript
{
  id: string;                     // UUID do evento
  type: string;                   // Tipo do evento
  payload: any;                   // Dados do evento
  licitacaoId: string;            // ID da licitação
  createdById: string;            // ID do usuário que criou
  createdAt: string;              // Data de criação (ISO 8601)
}
```

#### Summary (Resumo)
```typescript
{
  total: number;                  // Total de documentos
  required: number;               // Documentos obrigatórios
  submitted: number;              // Documentos entregues
  signed: number;                 // Documentos assinados
  coveragePercent: number;        // Percentual de cobertura (0-100)
}
```

---

## 🚀 Endpoints da API

### 1. CRUD de Licitações

#### 📝 Criar Licitação
```http
POST /licitacoes
Content-Type: application/json
Authorization: Bearer <token>
X-Company-Id: <company_id>

{
  "title": "Licitação de Serviços de TI",
  "status": "draft",
  "editalUrl": "https://example.com/edital.pdf",
  "sessionDate": "2024-02-15T14:00:00Z",
  "submissionDeadline": "2024-02-10T23:59:59Z"
}
```

**Resposta:**
```json
{
  "id": "uuid-da-licitacao",
  "title": "Licitação de Serviços de TI",
  "status": "draft",
  "editalUrl": "https://example.com/edital.pdf",
  "sessionDate": "2024-02-15T14:00:00Z",
  "submissionDeadline": "2024-02-10T23:59:59Z",
  "companyId": "uuid-da-empresa",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

#### 📋 Listar Licitações
```http
GET /licitacoes?status=open&search=serviços
Authorization: Bearer <token>
X-Company-Id: <company_id>
```

**Query Parameters:**
- `status` (opcional): Filtrar por status
- `search` (opcional): Buscar por título

**Resposta:**
```json
[
  {
    "id": "uuid-da-licitacao",
    "title": "Licitação de Serviços de TI",
    "status": "open",
    "editalUrl": "https://example.com/edital.pdf",
    "sessionDate": "2024-02-15T14:00:00Z",
    "submissionDeadline": "2024-02-10T23:59:59Z",
    "companyId": "uuid-da-empresa",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
]
```

#### 🔍 Obter Licitação Específica
```http
GET /licitacoes/{id}
Authorization: Bearer <token>
X-Company-Id: <company_id>
```

**Resposta:** Mesmo formato do item individual da listagem.

#### ✏️ Atualizar Licitação
```http
PATCH /licitacoes/{id}
Content-Type: application/json
Authorization: Bearer <token>
X-Company-Id: <company_id>

{
  "status": "open",
  "submissionDeadline": "2024-02-12T23:59:59Z"
}
```

**Resposta:** Licitação atualizada.

#### 🗑️ Excluir Licitação
```http
DELETE /licitacoes/{id}
Authorization: Bearer <token>
X-Company-Id: <company_id>
```

**Resposta:** Licitação excluída.

---

### 2. Gestão de Documentos

#### 📄 Listar Documentos da Licitação
```http
GET /licitacoes/{id}/documents
Authorization: Bearer <token>
X-Company-Id: <company_id>
```

**Resposta:**
```json
[
  {
    "id": "uuid-do-documento",
    "name": "Proposta Técnica",
    "docType": "proposta",
    "required": true,
    "submitted": false,
    "signed": false,
    "issueDate": null,
    "expiresAt": null,
    "notes": "Documento principal da proposta",
    "licitacaoId": "uuid-da-licitacao",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
]
```

#### ➕ Adicionar Documento
```http
POST /licitacoes/{id}/documents
Content-Type: application/json
Authorization: Bearer <token>
X-Company-Id: <company_id>

{
  "name": "Proposta Técnica",
  "docType": "proposta",
  "required": true,
  "notes": "Documento principal da proposta"
}
```

**Resposta:** Documento criado.

#### ✏️ Atualizar Documento
```http
PATCH /licitacoes/{id}/documents/{docId}
Content-Type: application/json
Authorization: Bearer <token>
X-Company-Id: <company_id>

{
  "submitted": true,
  "signed": true,
  "notes": "Documento assinado e entregue"
}
```

**Resposta:** Documento atualizado.

#### 🗑️ Excluir Documento
```http
DELETE /licitacoes/{id}/documents/{docId}
Authorization: Bearer <token>
X-Company-Id: <company_id>
```

**Resposta:** Documento excluído.

---

### 3. Upload e Download de Arquivos

#### 📤 Upload de Arquivo
```http
POST /licitacoes/{id}/documents/{docId}/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>
X-Company-Id: <company_id>

Form Data:
- file: [arquivo] (PDF, DOC, DOCX)
```

**Limitações:**
- **Tamanho máximo**: 10MB (configurável via `UPLOAD_MAX_BYTES`)
- **Tipos permitidos**: PDF, DOC, DOCX (configurável via `UPLOAD_ALLOWED_MIME`)

**Resposta:**
```json
{
  "id": "uuid-do-documento",
  "name": "Proposta Técnica",
  "fileName": "proposta_tecnica.pdf",
  "fileMime": "application/pdf",
  "fileSize": 1024000,
  "fileSha256": "hash-do-arquivo",
  "submitted": true,
  "licitacaoId": "uuid-da-licitacao",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

#### 📥 Download de Arquivo
```http
GET /licitacoes/{id}/documents/{docId}/file
Authorization: Bearer <token>
X-Company-Id: <company_id>
```

**Resposta:** Arquivo binário com headers apropriados.

---

### 4. Eventos da Licitação

#### 📋 Listar Eventos
```http
GET /licitacoes/{id}/events
Authorization: Bearer <token>
X-Company-Id: <company_id>
```

**Resposta:**
```json
[
  {
    "id": "uuid-do-evento",
    "type": "status_changed",
    "payload": {
      "from": "draft",
      "to": "open",
      "reason": "Licitação publicada"
    },
    "licitacaoId": "uuid-da-licitacao",
    "createdById": "uuid-do-usuario",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

#### ➕ Criar Evento
```http
POST /licitacoes/{id}/events
Content-Type: application/json
Authorization: Bearer <token>
X-Company-Id: <company_id>

{
  "type": "note",
  "payload": {
    "message": "Reunião com cliente agendada para amanhã",
    "priority": "high"
  }
}
```

**Resposta:** Evento criado.

---

### 5. Resumo da Licitação

#### 📊 Obter Resumo
```http
GET /licitacoes/{id}/summary
Authorization: Bearer <token>
X-Company-Id: <company_id>
```

**Resposta:**
```json
{
  "total": 5,           // Total de documentos
  "required": 4,        // Documentos obrigatórios
  "submitted": 3,       // Documentos entregues
  "signed": 2,          // Documentos assinados
  "coveragePercent": 60 // Percentual de cobertura
}
```

---

## 💻 Exemplos de Integração

### JavaScript/TypeScript (Fetch API)

```typescript
// Configuração base
const API_BASE = 'http://localhost:3000';
const token = 'seu-access-token';
const companyId = 'seu-company-id';

const headers = {
  'Authorization': `Bearer ${token}`,
  'X-Company-Id': companyId,
  'Content-Type': 'application/json'
};

// Criar licitação
async function criarLicitacao(dados) {
  const response = await fetch(`${API_BASE}/licitacoes`, {
    method: 'POST',
    headers,
    body: JSON.stringify(dados)
  });
  return response.json();
}

// Listar licitações
async function listarLicitacoes(filtros = {}) {
  const params = new URLSearchParams(filtros);
  const response = await fetch(`${API_BASE}/licitacoes?${params}`, {
    headers: { ...headers, 'Content-Type': undefined }
  });
  return response.json();
}

// Upload de arquivo
async function uploadArquivo(licitacaoId, docId, arquivo) {
  const formData = new FormData();
  formData.append('file', arquivo);
  
  const response = await fetch(
    `${API_BASE}/licitacoes/${licitacaoId}/documents/${docId}/upload`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Company-Id': companyId
        // Não definir Content-Type para multipart/form-data
      },
      body: formData
    }
  );
  return response.json();
}
```

### Axios

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-Company-Id': companyId
  }
});

// Criar licitação
const licitacao = await api.post('/licitacoes', dados);

// Upload com progress
const uploadProgress = await api.post(
  `/licitacoes/${licitacaoId}/documents/${docId}/upload`,
  formData,
  {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      console.log(`Upload: ${percentCompleted}%`);
    }
  }
);
```

### React Hook Personalizado

```typescript
import { useState, useEffect } from 'react';

function useLicitacoes() {
  const [licitacoes, setLicitacoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLicitacoes = async (filtros = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filtros);
      const response = await fetch(`/api/licitacoes?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Company-Id': companyId
        }
      });
      const data = await response.json();
      setLicitacoes(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicitacoes();
  }, []);

  return { licitacoes, loading, error, refetch: fetchLicitacoes };
}
```

---

## ⚠️ Códigos de Status HTTP

### Sucesso
| Código | Descrição |
|--------|-----------|
| `200` | OK - Operação realizada com sucesso |
| `201` | Created - Recurso criado com sucesso |

### Erro do Cliente
| Código | Descrição | Solução |
|--------|-----------|---------|
| `400` | Bad Request | Verificar dados enviados (validação falhou) |
| `401` | Unauthorized | Token JWT inválido ou expirado |
| `403` | Forbidden | Sem permissão para a empresa ou operação |
| `404` | Not Found | Recurso não encontrado |
| `413` | Payload Too Large | Arquivo muito grande (max 10MB) |
| `415` | Unsupported Media Type | Tipo de arquivo não permitido |

### Erro do Servidor
| Código | Descrição |
|--------|-----------|
| `500` | Internal Server Error | Erro interno do servidor |

### Exemplos de Respostas de Erro

#### 400 - Bad Request
```json
{
  "statusCode": 400,
  "message": [
    "title should not be empty",
    "status must be a valid enum value"
  ],
  "error": "Bad Request"
}
```

#### 401 - Unauthorized
```json
{
  "statusCode": 401,
  "message": "Invalid or expired access token",
  "error": "Unauthorized"
}
```

#### 403 - Forbidden
```json
{
  "statusCode": 403,
  "message": "No membership for this company",
  "error": "Forbidden"
}
```

#### 404 - Not Found
```json
{
  "statusCode": 404,
  "message": "Licitacao not found",
  "error": "Not Found"
}
```

---

## 🔧 Configurações e Limitações

### Upload de Arquivos
```env
UPLOAD_MAX_BYTES=10485760  # 10MB (padrão)
UPLOAD_ALLOWED_MIME=application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document
```

**Tipos de arquivo permitidos:**
- `application/pdf` - Arquivos PDF
- `application/msword` - Documentos Word (.doc)
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document` - Documentos Word (.docx)

### Rate Limiting
- **Limite global**: 300 requisições por minuto
- **Aplicado a**: Todas as rotas da API
- **Headers de resposta**:
  - `X-RateLimit-Limit`: Limite total
  - `X-RateLimit-Remaining`: Requisições restantes
  - `X-RateLimit-Reset`: Timestamp de reset

### JWT Tokens
```env
JWT_ACCESS_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_TTL=15m    # 15 minutos
JWT_REFRESH_TTL=7d    # 7 dias
```

### CORS
- **Origins permitidas**: Configuráveis via variável de ambiente
- **Headers permitidos**: `Authorization`, `X-Company-Id`, `Content-Type`
- **Métodos permitidos**: `GET`, `POST`, `PATCH`, `DELETE`

### Validação no Frontend
```typescript
function validarArquivo(arquivo: File): string | null {
  const tiposPermitidos = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  const tamanhoMaximo = 10 * 1024 * 1024; // 10MB
  
  if (!tiposPermitidos.includes(arquivo.type)) {
    return 'Tipo de arquivo não permitido. Use PDF, DOC ou DOCX.';
  }
  
  if (arquivo.size > tamanhoMaximo) {
    return 'Arquivo muito grande. Máximo 10MB.';
  }
  
  return null;
}
```

---

## 📱 Exemplo de Interface React

```tsx
import React, { useState } from 'react';

function LicitacaoForm() {
  const [formData, setFormData] = useState({
    title: '',
    status: 'draft',
    editalUrl: '',
    sessionDate: '',
    submissionDeadline: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/licitacoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Company-Id': companyId
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        alert('Licitação criada com sucesso!');
        // Redirecionar ou atualizar lista
      }
    } catch (error) {
      alert('Erro ao criar licitação');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Título da licitação"
        value={formData.title}
        onChange={(e) => setFormData({...formData, title: e.target.value})}
        required
      />
      
      <select
        value={formData.status}
        onChange={(e) => setFormData({...formData, status: e.target.value})}
      >
        <option value="draft">Rascunho</option>
        <option value="open">Aberta</option>
        <option value="closed">Fechada</option>
        <option value="cancelled">Cancelada</option>
        <option value="awarded">Homologada</option>
      </select>
      
      <input
        type="url"
        placeholder="URL do edital"
        value={formData.editalUrl}
        onChange={(e) => setFormData({...formData, editalUrl: e.target.value})}
      />
      
      <input
        type="datetime-local"
        value={formData.sessionDate}
        onChange={(e) => setFormData({...formData, sessionDate: e.target.value})}
      />
      
      <input
        type="datetime-local"
        value={formData.submissionDeadline}
        onChange={(e) => setFormData({...formData, submissionDeadline: e.target.value})}
      />
      
      <button type="submit">Criar Licitação</button>
    </form>
  );
}
```

---

## 🚀 Próximos Passos

1. **Configure a autenticação** no seu frontend
2. **Implemente os hooks/services** para as APIs
3. **Crie as interfaces** para listagem e formulários
4. **Configure o upload** de arquivos
5. **Implemente validações** no frontend
6. **Teste todas as funcionalidades** com dados reais

## 💡 Boas Práticas

### Segurança
- **Nunca** armazene tokens em localStorage (use httpOnly cookies se possível)
- **Sempre** valide dados no frontend antes de enviar
- **Implemente** refresh automático de tokens
- **Use** HTTPS em produção

### Performance
- **Implemente** cache de dados quando apropriado
- **Use** paginação para listas grandes
- **Otimize** uploads com progress indicators
- **Implemente** debounce em buscas

### UX/UI
- **Mostre** loading states durante requisições
- **Exiba** mensagens de erro claras
- **Implemente** retry automático para falhas de rede
- **Use** skeletons para melhor percepção de performance

### Código
- **Crie** interfaces TypeScript para todas as respostas
- **Implemente** error boundaries no React
- **Use** interceptors do Axios para tratamento global de erros
- **Documente** funções complexas

### Exemplo de Error Boundary
```tsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Algo deu errado. Tente novamente.</h1>;
    }

    return this.props.children;
  }
}
```

### Exemplo de Interceptor Axios
```typescript
import axios from 'axios';

// Request interceptor
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado, tentar renovar
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('/auth/refresh', { refreshToken });
        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        
        // Retry da requisição original
        return axios.request(error.config);
      } catch (refreshError) {
        // Refresh falhou, redirecionar para login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

---

## 🧪 Testes e Debugging

### Swagger UI
Acesse `http://localhost:3000/docs` para:
- Testar todas as rotas interativamente
- Ver exemplos de requisições e respostas
- Validar schemas de dados
- Testar autenticação

### Health Check
```http
GET /healthz
```
Verifica se a API está funcionando corretamente.

### Logs da Aplicação
```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run start
```

### Testando com cURL

#### 1. Autenticação
```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Registrar (primeira vez)
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","companyName":"Minha Empresa","cnpj":"00.000.000/0001-00"}'
```

#### 2. Criar Licitação
```bash
curl -X POST http://localhost:3000/licitacoes \
  -H "Authorization: Bearer <access_token>" \
  -H "X-Company-Id: <company_id>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Licitação Teste","status":"draft"}'
```

#### 3. Upload de Arquivo
```bash
curl -X POST http://localhost:3000/licitacoes/{id}/documents/{docId}/upload \
  -H "Authorization: Bearer <access_token>" \
  -H "X-Company-Id: <company_id>" \
  -F "file=@documento.pdf"
```

### Debugging Common Issues

#### Token Expirado
```json
{
  "statusCode": 401,
  "message": "Invalid or expired access token"
}
```
**Solução**: Renovar token usando `/auth/refresh`

#### Company ID Missing
```json
{
  "statusCode": 403,
  "message": "Company ID required (X-Company-Id header, companyId param, or company_id in body)"
}
```
**Solução**: Adicionar header `X-Company-Id`

#### Arquivo Muito Grande
```json
{
  "statusCode": 400,
  "message": "File too large (max 10485760 bytes)"
}
```
**Solução**: Reduzir tamanho do arquivo ou ajustar `UPLOAD_MAX_BYTES`

## 📞 Suporte

Para dúvidas ou problemas:
- **Swagger**: `http://localhost:3000/docs`
- **Health Check**: `http://localhost:3000/healthz`
- **Logs**: Verifique a saída do console
- **Testes**: Use Postman, Insomnia ou cURL
- **Documentação**: Este guia e comentários no código

---

*Documento atualizado automaticamente - Última atualização: Outubro 2024*
