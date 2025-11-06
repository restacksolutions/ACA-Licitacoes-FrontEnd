# API de Análise de Licitações - Documentação de Implementação

Este documento descreve a implementação das APIs de análise de licitação que enviam dados para o **n8n** (automação de fluxos) e integram com o módulo de **veículos** do sistema.

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Endpoints da API](#endpoints-da-api)
4. [Estrutura de Dados](#estrutura-de-dados)
5. [Fluxo de Análise](#fluxo-de-análise)
6. [Integração com n8n](#integração-com-n8n)
7. [Integração com Módulo de Veículos](#integração-com-módulo-de-veículos)
8. [Tratamento de Erros](#tratamento-de-erros)
9. [Logs e Monitoramento](#logs-e-monitoramento)
10. [Exemplos de Uso](#exemplos-de-uso)

---

## 🎯 Visão Geral

As APIs de análise de licitação permitem enviar uma licitação para processamento externo através de webhooks do **n8n**. O n8n recebe os dados da licitação, processa informações (possivelmente extraindo dados de editais, analisando documentos, etc.) e pode retornar resultados que incluem informações sobre veículos relacionados à licitação.

### Funcionalidades Principais

- ✅ Envio de licitação para análise via webhook n8n (produção)
- ✅ Envio de licitação para análise via webhook n8n (teste)
- ✅ Validação de autenticação e permissões
- ✅ Tratamento robusto de erros e timeouts
- ✅ Logs detalhados para debugging
- ✅ Integração com módulo de veículos (marcas e modelos)

---

## 🏗️ Arquitetura

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Cliente   │────────▶│   Backend    │────────▶│     n8n     │
│  (Frontend) │  POST   │   (NestJS)   │  POST   │  (Webhook)  │
│             │         │              │         │             │
└─────────────┘         └──────────────┘         └─────────────┘
                               │                         │
                               │                         │
                               ▼                         ▼
                        ┌──────────────┐         ┌─────────────┐
                        │  PostgreSQL  │         │  Processa   │
                        │   (Prisma)   │         │  Análise e  │
                        │              │         │  Retorna    │
                        └──────────────┘         │  Veículos   │
                                                 └─────────────┘
```

### Componentes Principais

1. **LicitacoesController** (`src/modules/licitacoes/licitacoes.controller.ts`)
   - Gerencia as rotas HTTP
   - Aplica guards de autenticação e autorização
   - Valida parâmetros de entrada

2. **LicitacoesService** (`src/modules/licitacoes/licitacoes.service.ts`)
   - Lógica de negócio
   - Comunicação com banco de dados
   - Envio para webhooks n8n

3. **Módulo de Veículos** (`src/modules/vehicles/`)
   - Gerencia marcas (`CarBrand`) e modelos (`VehicleModel`)
   - Fornece dados para análise de veículos nas licitações

---

## 🔌 Endpoints da API

### 1. Análise de Licitação (Produção)

**Endpoint:** `POST /licitacoes/:id/analise`

**Descrição:** Envia uma licitação para análise no n8n (ambiente de produção).

**Autenticação:** Requerida
- Header: `Authorization: Bearer <access_token>`
- Header: `X-Company-Id: <company_id>`

**Parâmetros:**
- `id` (path): ID da licitação (UUID)

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Análise enviada com sucesso",
  "licitacaoId": "123e4567-e89b-12d3-a456-426614174000",
  "webhook": {
    "url": "https://botmedflow-n8n.kucha.live/webhook/licitacoes-analise/",
    "status": 200,
    "statusText": "OK",
    "responseData": {
      // Dados retornados pelo n8n (podem incluir informações de veículos)
      "veiculos": [
        {
          "marca": "Toyota",
          "modelo": "Hilux",
          "quantidade": 5
        }
      ],
      "analise": {
        "status": "concluida",
        "dataConclusao": "2024-11-04T20:00:00.000Z"
      }
    },
    "timestamp": "2024-11-04T20:00:00.000Z"
  }
}
```

**Códigos de Erro:**
- `401` - Token inválido ou ausente
- `403` - Sem permissão para a empresa
- `404` - Licitação não encontrada
- `502` - Erro ao comunicar com webhook ou status diferente de 200

---

### 2. Análise de Licitação (Teste)

**Endpoint:** `POST /licitacoes/:id/analise-test`

**Descrição:** Envia uma licitação para análise no n8n (ambiente de teste). Útil para desenvolvimento e debugging.

**Autenticação:** Requerida (mesma que produção)

**Parâmetros:**
- `id` (path): ID da licitação (UUID)

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Análise enviada com sucesso",
  "licitacaoId": "123e4567-e89b-12d3-a456-426614174000",
  "webhook": {
    "url": "https://botmedflow-n8n.kucha.live/webhook-test/licitacoes-analise/",
    "status": 200,
    "statusText": "OK",
    "responseData": { /* dados do n8n */ },
    "timestamp": "2024-11-04T20:00:00.000Z"
  }
}
```

**Códigos de Erro:** Mesmos da rota de produção

---

## 📊 Estrutura de Dados

### Payload Enviado para n8n

O backend envia o seguinte payload para o webhook do n8n:

```json
{
  "licitacaoId": "123e4567-e89b-12d3-a456-426614174000",
  "companyId": "da6cc36e-b112-4301-ae6d-f824ccf944ad",
  "title": "Licitação para Serviços de TI",
  "status": "open"
}
```

**Campos:**
- `licitacaoId` (string, UUID): Identificador único da licitação
- `companyId` (string, UUID): Identificador da empresa proprietária
- `title` (string): Título/descrição da licitação
- `status` (string): Status atual da licitação (`draft`, `open`, `closed`, `cancelled`, `awarded`)

### Modelo de Licitação (Database)

```typescript
{
  id: string;
  companyId: string;
  title: string;
  status: 'draft' | 'open' | 'closed' | 'cancelled' | 'awarded';
  editalUrl?: string;
  sessionDate?: Date;
  submissionDeadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Modelo de Veículos (Database)

```typescript
// Marca
{
  id: string;
  name: string; // Ex: "Toyota", "Ford"
}

// Modelo
{
  id: string;
  brandId: string;
  name: string; // Ex: "Hilux", "Ranger"
  specs: {
    category?: string; // Ex: "pickup", "SUV"
    // ... outras especificações
  };
}
```

---

## 🔄 Fluxo de Análise

### 1. Requisição do Cliente

```
Cliente → POST /licitacoes/:id/analise
Headers:
  - Authorization: Bearer <token>
  - X-Company-Id: <company_id>
```

### 2. Validação no Backend

1. **Autenticação JWT** (`JwtAccessGuard`)
   - Valida token de acesso
   - Extrai informações do usuário

2. **Validação de Empresa** (`CompanyGuard`)
   - Verifica se o usuário pertence à empresa
   - Verifica permissões (owner/admin/member)

3. **Validação da Licitação**
   - Verifica se a licitação existe
   - Verifica se pertence à empresa do usuário

### 3. Envio para n8n

```typescript
// Código do serviço (resumido)
const licitacao = await this.get(companyId, licitacaoId);
const webhookUrl = 'https://botmedflow-n8n.kucha.live/webhook/licitacoes-analise/';

const payload = {
  licitacaoId: licitacao.id,
  companyId: licitacao.companyId,
  title: licitacao.title,
  status: licitacao.status,
};

const response = await this.httpService.post(webhookUrl, payload, {
  timeout: 30000, // 30 segundos
  headers: { 'Content-Type': 'application/json' },
});
```

### 4. Processamento no n8n

O n8n recebe o payload e pode:
- ✅ Buscar informações adicionais da licitação (via API do backend)
- ✅ Analisar documentos anexados (edital, propostas, etc.)
- ✅ Extrair informações sobre veículos mencionados
- ✅ Comparar com modelos cadastrados no módulo de veículos
- ✅ Retornar resultados da análise

### 5. Resposta ao Cliente

- Se n8n retornar status `200`: sucesso
- Se n8n retornar outro status: erro `502 Bad Gateway`
- Se timeout (30s): erro `502 Bad Gateway`

---

## 🔗 Integração com n8n

### Configuração dos Webhooks

#### Webhook de Produção
```
URL: https://botmedflow-n8n.kucha.live/webhook/licitacoes-analise/
Método: POST
Content-Type: application/json
```

#### Webhook de Teste
```
URL: https://botmedflow-n8n.kucha.live/webhook-test/licitacoes-analise/
Método: POST
Content-Type: application/json
```

### Workflow Esperado no n8n

1. **Receber Webhook** → Captura payload do backend
2. **Buscar Dados da Licitação** → Chamada para API do backend (opcional)
3. **Processar Documentos** → Extrair informações do edital/documentos
4. **Identificar Veículos** → Detectar marcas/modelos mencionados
5. **Validar com Banco** → Consultar módulo de veículos (via API)
6. **Retornar Resultado** → Resposta JSON com análise

### Exemplo de Resposta Esperada do n8n

```json
{
  "success": true,
  "licitacaoId": "123e4567-e89b-12d3-a456-426614174000",
  "veiculos": [
    {
      "marca": "Toyota",
      "modelo": "Hilux",
      "quantidade": 5,
      "modeloId": "uuid-do-modelo", // Se encontrado no banco
      "encontradoNoBanco": true
    },
    {
      "marca": "Ford",
      "modelo": "Ranger",
      "quantidade": 3,
      "modeloId": null,
      "encontradoNoBanco": false
    }
  ],
  "resumo": {
    "totalVeiculos": 8,
    "veiculosEncontrados": 5,
    "veiculosNaoEncontrados": 3
  }
}
```

---

## 🚗 Integração com Módulo de Veículos

### Endpoints Disponíveis

#### Listar Marcas
```
GET /vehicles/brands
GET /vehicles/brands?search=Toyota
```

#### Listar Modelos
```
GET /vehicles/models
GET /vehicles/models?brandId=<uuid>
GET /vehicles/models?search=Hilux
```

#### Obter Modelo Específico
```
GET /vehicles/models/:id
```

### Como o n8n Pode Usar

O n8n pode fazer chamadas para a API de veículos para:

1. **Validar Marca/Modelo** → Verificar se existe no banco
2. **Buscar Especificações** → Obter specs do modelo
3. **Sugerir Modelos** → Comparar com modelos similares

### Exemplo de Uso no n8n

```javascript
// No workflow do n8n (Node.js)
const veiculoMencionado = "Toyota Hilux";

// Buscar modelo
const response = await fetch('https://api-backend.com/vehicles/models?search=Hilux', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const modelos = await response.json();
const modeloEncontrado = modelos.find(m => 
  m.brand.name === 'Toyota' && m.name === 'Hilux'
);

if (modeloEncontrado) {
  return {
    encontrado: true,
    modeloId: modeloEncontrado.id,
    specs: modeloEncontrado.specs,
  };
}
```

---

## ⚠️ Tratamento de Erros

### Erros de Autenticação/Autorização

**401 Unauthorized**
- Token inválido ou expirado
- Token ausente no header

**403 Forbidden**
- Usuário não pertence à empresa
- Sem permissão para acessar a licitação

### Erros de Recursos

**404 Not Found**
- Licitação não existe
- Licitação não pertence à empresa

### Erros de Comunicação

**502 Bad Gateway**

Motivos possíveis:
1. **Webhook não encontrado (404)**
   - Workflow do n8n não está ativo
   - URL incorreta
   - Método HTTP incorreto

2. **Redirect (3xx)**
   - Problema com barra final na URL
   - Problema com prefixo `N8N_PATH`

3. **Timeout (30s)**
   - n8n demorou mais de 30 segundos para responder
   - Workflow muito pesado

4. **Erro de Conexão**
   - n8n indisponível
   - Problema de rede

### Logs de Erro

O sistema gera logs detalhados para cada erro:

```typescript
console.error('[WEBHOOK] Erro ao enviar para webhook:', {
  url: webhookUrl,
  error: {
    message: error?.message,
    code: error?.code,
    response: {
      status: resp.status,
      statusText: resp.statusText,
      data: errorDataStr,
    },
  },
  timestamp: new Date().toISOString(),
});
```

---

## 📝 Logs e Monitoramento

### Logs de Sucesso

```
[ANALISE-PROD] Iniciando análise de licitação: {
  companyId: "...",
  licitacaoId: "...",
  timestamp: "2024-11-04T20:00:00.000Z"
}

[WEBHOOK] Iniciando envio para webhook: {
  url: "...",
  payload: { ... },
  timestamp: "..."
}

[WEBHOOK] Resposta recebida: {
  status: 200,
  statusText: "OK",
  data: { ... },
  timestamp: "..."
}

[ANALISE-PROD] Análise concluída com sucesso: {
  licitacaoId: "...",
  webhookStatus: 200
}
```

### Logs de Erro

```
[WEBHOOK] Erro ao enviar para webhook: {
  url: "...",
  error: {
    message: "...",
    code: "...",
    response: { ... }
  },
  timestamp: "..."
}
```

### Monitoramento Recomendado

1. **Taxa de Sucesso** → % de requisições que retornam 200
2. **Tempo de Resposta** → Tempo médio de resposta do n8n
3. **Taxa de Timeout** → % de requisições que excedem 30s
4. **Erros por Tipo** → Distribuição de erros (404, 502, timeout, etc.)

---

## 💡 Exemplos de Uso

### Exemplo 1: Análise de Licitação (Produção)

```bash
curl -X POST \
  'https://api-backend.com/licitacoes/123e4567-e89b-12d3-a456-426614174000/analise' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'X-Company-Id: da6cc36e-b112-4301-ae6d-f824ccf944ad' \
  -H 'Content-Type: application/json'
```

**Resposta:**
```json
{
  "success": true,
  "message": "Análise enviada com sucesso",
  "licitacaoId": "123e4567-e89b-12d3-a456-426614174000",
  "webhook": {
    "url": "https://botmedflow-n8n.kucha.live/webhook/licitacoes-analise/",
    "status": 200,
    "statusText": "OK",
    "responseData": {
      "veiculos": [
        {
          "marca": "Toyota",
          "modelo": "Hilux",
          "quantidade": 5,
          "modeloId": "abc-123",
          "encontradoNoBanco": true
        }
      ]
    },
    "timestamp": "2024-11-04T20:00:00.000Z"
  }
}
```

### Exemplo 2: Análise de Licitação (Teste)

```bash
curl -X POST \
  'https://api-backend.com/licitacoes/123e4567-e89b-12d3-a456-426614174000/analise-test' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'X-Company-Id: da6cc36e-b112-4301-ae6d-f824ccf944ad' \
  -H 'Content-Type: application/json'
```

### Exemplo 3: JavaScript/TypeScript

```typescript
async function analisarLicitacao(licitacaoId: string, token: string, companyId: string) {
  const response = await fetch(
    `https://api-backend.com/licitacoes/${licitacaoId}/analise`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Company-Id': companyId,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Erro: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

// Uso
try {
  const resultado = await analisarLicitacao(
    '123e4567-e89b-12d3-a456-426614174000',
    'token-jwt',
    'company-id'
  );
  
  console.log('Veículos encontrados:', resultado.webhook.responseData.veiculos);
} catch (error) {
  console.error('Erro na análise:', error);
}
```

---

## 🔧 Configuração e Variáveis de Ambiente

### Variáveis Necessárias

```env
# Webhooks n8n (hardcoded no código, mas podem ser movidas para env)
N8N_WEBHOOK_PRODUCTION=https://botmedflow-n8n.kucha.live/webhook/licitacoes-analise/
N8N_WEBHOOK_TEST=https://botmedflow-n8n.kucha.live/webhook-test/licitacoes-analise/

# Timeout (em milissegundos)
N8N_WEBHOOK_TIMEOUT=30000
```

### Configuração Futura (Recomendada)

Para melhorar a flexibilidade, considere mover as URLs dos webhooks para variáveis de ambiente:

```typescript
// No serviço
const webhookUrl = this.configService.get<string>('N8N_WEBHOOK_PRODUCTION');
const timeout = this.configService.get<number>('N8N_WEBHOOK_TIMEOUT', 30000);
```

---

## 🚀 Melhorias Futuras

### 1. Assíncrono com Queue

- Implementar fila (Redis/Bull) para processamento assíncrono
- Retornar `202 Accepted` imediatamente
- Processar análise em background
- Notificar cliente via webhook quando concluir

### 2. Retry Automático

- Implementar retry automático em caso de falha
- Configurar número máximo de tentativas
- Backoff exponencial

### 3. Webhook de Callback

- Permitir que n8n retorne resultados via webhook
- Salvar resultados no banco de dados
- Criar endpoint para consultar status da análise

### 4. Cache de Resultados

- Cachear resultados de análises recentes
- Evitar reprocessar licitações já analisadas

### 5. Validação de Dados Retornados

- Validar estrutura da resposta do n8n
- Garantir que dados de veículos estão no formato esperado

---

## 📚 Referências

### Arquivos Relacionados

- `src/modules/licitacoes/licitacoes.controller.ts` - Rotas da API
- `src/modules/licitacoes/licitacoes.service.ts` - Lógica de negócio
- `src/modules/licitacoes/dto.ts` - DTOs e validações
- `src/modules/vehicles/vehicles.controller.ts` - API de veículos
- `src/modules/vehicles/vehicles.service.ts` - Serviço de veículos
- `prisma/schema.prisma` - Schema do banco de dados

### Documentação Externa

- [NestJS Documentation](https://docs.nestjs.com/)
- [n8n Documentation](https://docs.n8n.io/)
- [Prisma Documentation](https://www.prisma.io/docs)

---

## ❓ FAQ

### 1. Qual a diferença entre `/analise` e `/analise-test`?

- `/analise` → Envia para webhook de **produção** (dados reais)
- `/analise-test` → Envia para webhook de **teste** (dados de desenvolvimento)

### 2. Quanto tempo leva a análise?

O timeout é de **30 segundos**. Se o n8n não responder nesse tempo, a requisição falha com erro 502.

### 3. O que acontece se o n8n retornar erro?

O backend retorna erro `502 Bad Gateway` com detalhes do erro retornado pelo n8n.

### 4. Posso usar a API de veículos dentro do n8n?

Sim! O n8n pode fazer chamadas para a API de veículos para validar e buscar informações sobre marcas/modelos.

### 5. Como sei se a análise foi concluída?

Atualmente, a API aguarda a resposta do n8n. Se retornar `200`, a análise foi processada. Considere implementar webhook de callback para análises assíncronas.

---

**Última atualização:** 2024-11-04  
**Versão da API:** 1.0.0

