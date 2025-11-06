# Tela de Veículos - Documentação de Implementação Frontend

Este documento fornece uma especificação completa para implementação da tela de gerenciamento de veículos no frontend, incluindo CRUD completo, upload via CSV e estrutura completa de especificações.

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura de Dados](#estrutura-de-dados)
3. [APIs Disponíveis](#apis-disponíveis)
4. [Interface do Usuário](#interface-do-usuário)
5. [Funcionalidades](#funcionalidades)
6. [Upload CSV](#upload-csv)
7. [Template CSV](#template-csv)
8. [Validações](#validações)
9. [Exemplos de Código](#exemplos-de-código)
10. [Componentes](#componentes)

---

## 🎯 Visão Geral

A tela de veículos permite gerenciar **marcas** e **modelos** de veículos, com um sistema completo de especificações técnicas. O sistema suporta:

- ✅ CRUD completo de marcas
- ✅ CRUD completo de modelos
- ✅ Especificações técnicas detalhadas (JSON)
- ✅ Importação em massa via CSV
- ✅ Busca e filtros
- ✅ Paginação

---

## 📊 Estrutura de Dados

### Tipo: CarBrand (Marca)

```typescript
interface CarBrand {
  id: string;           // UUID
  name: string;         // Nome da marca (ex: "Toyota", "Ford")
  models?: VehicleModel[]; // Modelos associados (opcional)
}
```

### Tipo: VehicleModel (Modelo)

```typescript
interface VehicleModel {
  id: string;           // UUID
  brandId: string;      // ID da marca (UUID)
  name: string;         // Nome do modelo (ex: "Hilux", "Ranger")
  specs: VehicleSpecs;  // Especificações técnicas (JSON)
  brand?: CarBrand;     // Objeto da marca (opcional, quando inclui relacionamento)
}
```

### Tipo: VehicleSpecs (Especificações Técnicas)

**Estrutura completa recomendada:**

```typescript
interface VehicleSpecs {
  // Categoria e Tipo
  category?: string;              // "pickup", "SUV", "sedan", "hatchback", "wagon", "van", "caminhao"
  vehicleType?: string;           // "leve", "medio", "pesado"
  segment?: string;               // "A", "B", "C", "D", "E", "S", "SUV", "Pickup", "Van"
  
  // Dimensões
  dimensions?: {
    length?: number;              // mm
    width?: number;               // mm
    height?: number;              // mm
    wheelbase?: number;           // mm (distância entre eixos)
    groundClearance?: number;     // mm (altura do solo)
    trunkVolume?: number;         // litros (porta-malas)
    fuelTankCapacity?: number;    // litros (capacidade do tanque)
  };
  
  // Motor e Performance
  engine?: {
    displacement?: number;        // cm³ ou litros
    cylinders?: number;           // número de cilindros
    power?: number;               // cv (cavalos de potência)
    powerRPM?: number;            // rpm (rotações por minuto da potência)
    torque?: number;              // Nm (newton-metro)
    torqueRPM?: number;           // rpm
    fuelType?: string;            // "gasolina", "diesel", "flex", "eletrico", "hibrido"
    aspiration?: string;          // "aspirado", "turbo", "supercharger"
    transmission?: string;        // "manual", "automatico", "cvt", "dct"
    gears?: number;               // número de marchas
    driveType?: string;           // "4x2", "4x4", "awd", "rwd", "fwd"
    topSpeed?: number;            // km/h (velocidade máxima)
    acceleration?: number;        // segundos (0-100 km/h)
  };
  
  // Consumo e Emissões
  consumption?: {
    city?: number;                // km/l (consumo na cidade)
    highway?: number;             // km/l (consumo na estrada)
    combined?: number;            // km/l (consumo combinado)
    co2Emission?: number;         // g/km (emissão de CO2)
    euroStandard?: string;        // "Euro 5", "Euro 6", "Proconve L5", "Proconve L6"
  };
  
  // Peso e Capacidade
  weight?: {
    curbWeight?: number;          // kg (peso em ordem de marcha)
    grossWeight?: number;         // kg (peso bruto total)
    payload?: number;             // kg (capacidade de carga)
    towingCapacity?: number;      // kg (capacidade de reboque)
  };
  
  // Suspensão e Freios
  suspension?: {
    front?: string;               // Ex: "Suspensão independente tipo McPherson"
    rear?: string;                // Ex: "Eixo rígido com molas"
  };
  brakes?: {
    front?: string;               // Ex: "Discos ventilados"
    rear?: string;                // Ex: "Discos sólidos"
    abs?: boolean;                // ABS (Anti-lock Braking System)
    ebd?: boolean;                // EBD (Electronic Brakeforce Distribution)
    esp?: boolean;                // ESP (Electronic Stability Program)
  };
  
  // Segurança
  safety?: {
    airbags?: number;             // número de airbags
    airbagsFront?: number;        // airbags frontais
    airbagsSide?: number;         // airbags laterais
    airbagsCurtain?: boolean;     // airbags de cortina
    isofix?: boolean;             // pontos de fixação ISOFIX
    ncapRating?: string;          // "5 estrelas", "4 estrelas", etc.
    ncapYear?: number;            // ano do teste NCAP
    tractionControl?: boolean;    // controle de tração
    hillAssist?: boolean;         // assistente de rampa
    parkingSensors?: boolean;     // sensores de estacionamento
    rearviewCamera?: boolean;     // câmera de ré
    blindSpotMonitor?: boolean;   // monitor de ponto cego
  };
  
  // Conforto e Tecnologia
  comfort?: {
    seats?: number;               // número de assentos
    seatsMaterial?: string;       // "tecido", "couro", "alcantara"
    airConditioning?: string;     // "manual", "automatico", "dual-zone", "tri-zone"
    sunroof?: boolean;            // teto solar
    panoramicRoof?: boolean;      // teto panorâmico
    keylessEntry?: boolean;       // entrada sem chave
    startButton?: boolean;        // partida por botão
    cruiseControl?: boolean;      // piloto automático
    adaptiveCruise?: boolean;     // piloto automático adaptativo
    parkingAssist?: boolean;      // assistente de estacionamento
  };
  
  // Multimídia e Conectividade
  multimedia?: {
    displaySize?: number;         // polegadas
    displayType?: string;         // "touchscreen", "lcd", "led"
    androidAuto?: boolean;        // Android Auto
    appleCarPlay?: boolean;       // Apple CarPlay
    bluetooth?: boolean;          // Bluetooth
    usbPorts?: number;            // número de portas USB
    wirelessCharging?: boolean;   // carregamento sem fio
    soundSystem?: string;         // Ex: "Sistema de som 6 alto-falantes"
    speakers?: number;            // número de alto-falantes
  };
  
  // Iluminação
  lighting?: {
    headlights?: string;          // "halogena", "xenon", "led", "laser"
    daytimeLights?: boolean;      // luzes diurnas
    fogLights?: boolean;          // faróis de neblina
    adaptiveLights?: boolean;     // faróis adaptativos
    highBeamAssist?: boolean;     // assistente de luz alta
  };
  
  // Pneus e Rodas
  tires?: {
    frontSize?: string;           // Ex: "205/65 R16"
    rearSize?: string;            // Ex: "205/65 R16"
    rimSize?: number;             // polegadas (aro)
    rimMaterial?: string;         // "aco", "liga-leve"
    spareTire?: string;           // "estepe", "kit", "pneu runflat"
  };
  
  // Outros
  warranty?: {
    years?: number;               // anos de garantia
    kilometers?: number;          // quilometragem de garantia
  };
  
  releaseYear?: number;           // ano de lançamento
  endYear?: number;               // ano de descontinuação (se aplicável)
  priceRange?: string;            // "economico", "medio", "premium", "luxo"
  targetMarket?: string;          // "brasil", "america-latina", "global"
  
  // Observações adicionais
  notes?: string;                 // observações gerais
  tags?: string[];                // tags para busca (ex: ["off-road", "trabalho", "lazer"])
}
```

---

## 🔌 APIs Disponíveis

### Base URL
```
https://api-backend.com/vehicles
```

### Autenticação
Todas as requisições requerem:
```
Headers:
  Authorization: Bearer <access_token>
```

### Endpoints de Marcas

#### 1. Listar Marcas
```http
GET /vehicles/brands
GET /vehicles/brands?search=Toyota
```

**Resposta:**
```json
[
  {
    "id": "uuid-1",
    "name": "Toyota"
  },
  {
    "id": "uuid-2",
    "name": "Ford"
  }
]
```

#### 2. Obter Marca por ID
```http
GET /vehicles/brands/:id
```

#### 3. Criar Marca
```http
POST /vehicles/brands
Content-Type: application/json

{
  "name": "Toyota"
}
```

**Permissão:** Apenas admin ou owner

#### 4. Atualizar Marca
```http
PATCH /vehicles/brands/:id
Content-Type: application/json

{
  "name": "Toyota Motor Corporation"
}
```

**Permissão:** Apenas admin ou owner

#### 5. Deletar Marca
```http
DELETE /vehicles/brands/:id
```

**Permissão:** Apenas admin ou owner  
**Nota:** Não permite deletar marca que possui modelos

---

### Endpoints de Modelos

#### 1. Listar Modelos
```http
GET /vehicles/models
GET /vehicles/models?brandId=uuid&search=Hilux&page=1&limit=20
```

**Query Params:**
- `brandId` (opcional): Filtrar por marca
- `search` (opcional): Buscar por nome ou categoria
- `page` (opcional, padrão: 1): Número da página
- `limit` (opcional, padrão: 20): Itens por página

**Resposta:**
```json
[
  {
    "id": "uuid-1",
    "brandId": "uuid-brand",
    "name": "Hilux",
    "specs": { /* objeto specs */ },
    "brand": {
      "id": "uuid-brand",
      "name": "Toyota"
    }
  }
]
```

#### 2. Obter Modelo por ID
```http
GET /vehicles/models/:id
```

**Resposta:**
```json
{
  "id": "uuid-1",
  "brandId": "uuid-brand",
  "name": "Hilux",
  "specs": { /* objeto specs */ },
  "brand": {
    "id": "uuid-brand",
    "name": "Toyota"
  }
}
```

#### 3. Criar Modelo
```http
POST /vehicles/models
Content-Type: application/json

{
  "brandId": "uuid-brand",
  "name": "Hilux",
  "specs": { /* objeto specs */ }
}
```

**Permissão:** Apenas admin ou owner

#### 4. Atualizar Modelo
```http
PATCH /vehicles/models/:id
Content-Type: application/json

{
  "name": "Hilux 2.8",
  "specs": { /* objeto specs atualizado */ }
}
```

**Permissão:** Apenas admin ou owner

#### 5. Deletar Modelo
```http
DELETE /vehicles/models/:id
```

**Permissão:** Apenas admin ou owner

---

## 🎨 Interface do Usuário

### Layout Principal

```
┌─────────────────────────────────────────────────────────────┐
│  Tela de Veículos                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Tabs: Marcas | Modelos]                    [+ Nova Marca] │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Buscar...]  [Filtrar por Marca ▼]  [📥 Importar] │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Tabela de Modelos                                  │   │
│  ├──────┬─────────┬──────────┬──────────────────────┤   │
│  │  Marca │ Modelo │ Categoria │ Ações               │   │
│  ├──────┼─────────┼──────────┼──────────────────────┤   │
│  │ Toyota│ Hilux  │ Pickup   │ [✏️] [🗑️]           │   │
│  │ Ford  │ Ranger │ Pickup   │ [✏️] [🗑️]           │   │
│  └──────┴─────────┴──────────┴──────────────────────┘   │
│                                                             │
│  [< Anterior]  Página 1 de 5  [Próxima >]                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Componentes Principais

1. **Tab de Marcas**
   - Lista de marcas
   - Botão "Nova Marca"
   - Busca
   - Ações: Editar, Deletar

2. **Tab de Modelos**
   - Lista de modelos (com paginação)
   - Filtro por marca
   - Busca (nome ou categoria)
   - Botão "Novo Modelo"
   - Botão "Importar CSV"
   - Ações: Editar, Deletar, Ver Detalhes

3. **Modal de Criar/Editar Marca**
   - Campo: Nome

4. **Modal de Criar/Editar Modelo**
   - Campo: Marca (select)
   - Campo: Nome
   - Seção expandível: Especificações Técnicas

5. **Modal de Detalhes do Modelo**
   - Visualização completa das especificações

6. **Modal de Upload CSV**
   - Upload de arquivo
   - Preview dos dados
   - Validação
   - Botão "Baixar Template CSV"

---

## ⚙️ Funcionalidades

### 1. Gerenciamento de Marcas

#### Listar Marcas
- Exibir todas as marcas em ordem alfabética
- Busca em tempo real
- Indicador de quantidade de modelos por marca

#### Criar Marca
- Modal com campo de nome
- Validação: nome obrigatório, único
- Feedback de sucesso/erro

#### Editar Marca
- Modal pré-preenchido
- Validação: nome único (exceto o próprio)

#### Deletar Marca
- Confirmação antes de deletar
- Bloqueio se houver modelos associados
- Mensagem de erro clara

### 2. Gerenciamento de Modelos

#### Listar Modelos
- Tabela com colunas: Marca, Modelo, Categoria, Ações
- Paginação (20 por página)
- Filtro por marca (dropdown)
- Busca por nome ou categoria
- Ordenação por marca e nome

#### Criar Modelo
- Formulário com:
  - Select de marca (obrigatório)
  - Campo de nome (obrigatório)
  - Seção de especificações técnicas (expandível)
- Validação de marca existente
- Preview das especificações

#### Editar Modelo
- Formulário pré-preenchido
- Mesma estrutura de criação
- Validações atualizadas

#### Ver Detalhes
- Modal ou página de detalhes
- Exibição completa das especificações
- Organização por seções (Motor, Dimensões, etc.)

#### Deletar Modelo
- Confirmação antes de deletar
- Feedback de sucesso/erro

### 3. Upload CSV

#### Fluxo de Upload
1. Usuário clica em "Importar CSV"
2. Modal abre com opção de upload
3. Botão "Baixar Template CSV" disponível
4. Usuário seleciona arquivo CSV
5. Sistema valida formato e dados
6. Preview dos dados a serem importados
7. Confirmação e importação
8. Feedback de sucesso/erro com detalhes

#### Validações no CSV
- Formato correto (delimitador, encoding)
- Colunas obrigatórias presentes
- Marca existe no sistema (ou cria se necessário)
- Formato correto dos campos (números, booleanos, etc.)
- JSON válido para campos complexos

---

## 📥 Upload CSV

### Template CSV Completo

O template CSV deve incluir todas as colunas possíveis do sistema. Use o seguinte formato:

```csv
marca,nome_modelo,categoria,tipo_veiculo,segmento,comprimento_mm,largura_mm,altura_mm,distancia_eixos_mm,altura_solo_mm,volume_porta_malas_l,capacidade_tanque_l,cilindrada_cm3,cilindros,potencia_cv,potencia_rpm,torque_nm,torque_rpm,tipo_combustivel,aspiração,transmissao,marchas,tipo_tracao,velocidade_max_kmh,aceleracao_0_100_seg,consumo_cidade_km_l,consumo_estrada_km_l,consumo_combinado_km_l,emissao_co2_g_km,padrao_emissao,peso_ordem_marcha_kg,peso_bruto_kg,capacidade_carga_kg,capacidade_reboque_kg,suspensao_dianteira,suspensao_traseira,freios_dianteiros,freios_traseiros,abs,ebd,esp,numero_airbags,airbags_frontais,airbags_laterais,airbags_cortina,isofix,classificacao_ncap,ano_ncap,controle_tracao,assistente_rampa,sensores_estacionamento,camera_re,monitor_ponto_cego,numero_assentos,material_assentos,ar_condicionado,teto_solar,teto_panoramico,entrada_sem_chave,partida_botao,piloto_automatico,piloto_automatico_adaptativo,assistente_estacionamento,tamanho_tela_polegadas,tipo_tela,android_auto,apple_carplay,bluetooth,portas_usb,carregamento_sem_fio,sistema_som,alto_falantes,farois,tipo_farois,luzes_diurnas,farois_neblina,farois_adaptativos,assistente_luz_alta,dimensao_pneu_dianteiro,dimensao_pneu_traseiro,tamanho_aro_polegadas,material_aro,estepe,tempo_garantia_anos,quilometragem_garantia_km,ano_lancamento,ano_descontinuacao,faixa_preco,mercado_alvo,observacoes,tags
Toyota,Hilux CD 4x4 Diesel,Pickup,Leve,Pickup,5330,1855,1815,3085,217,0,80,2755,4,177,3400,450,1600,Diesel,Turbo,Automatica,6,4x4,175,11.5,9.5,12.5,10.8,220,Euro 5,2145,3040,895,3500,"Suspensão independente tipo McPherson","Eixo rígido com molas",Discos ventilados,Discos sólidos,Sim,Sim,Sim,7,2,2,Sim,Sim,"5 estrelas",2020,Sim,Sim,Sim,Sim,Não,5,Couro,Automático Tri-zone,Não,Não,Sim,Sim,Sim,Não,Não,8.0,Touchscreen,Sim,Sim,Sim,2,Sim,"Sistema de som 10 alto-falantes",10,LED,LED,Sim,Sim,Sim,Sim,265/65 R17,265/65 R17,17,Liga-leve,Estepe,3,100000,2016,,Médio,Brasil,"Veículo versátil para trabalho e lazer","pickup;off-road;diesel;4x4"
```

### Estrutura das Colunas

| Coluna | Tipo | Obrigatório | Descrição | Exemplo |
|--------|------|-------------|-----------|---------|
| `marca` | string | ✅ Sim | Nome da marca | "Toyota" |
| `nome_modelo` | string | ✅ Sim | Nome do modelo | "Hilux CD 4x4 Diesel" |
| `categoria` | string | Não | Categoria do veículo | "Pickup", "SUV", "Sedan" |
| `tipo_veiculo` | string | Não | Tipo: Leve, Médio, Pesado | "Leve" |
| `segmento` | string | Não | Segmento de mercado | "Pickup", "SUV" |
| `comprimento_mm` | number | Não | Comprimento em mm | 5330 |
| `largura_mm` | number | Não | Largura em mm | 1855 |
| `altura_mm` | number | Não | Altura em mm | 1815 |
| `distancia_eixos_mm` | number | Não | Distância entre eixos | 3085 |
| `altura_solo_mm` | number | Não | Altura do solo | 217 |
| `volume_porta_malas_l` | number | Não | Volume do porta-malas | 0 |
| `capacidade_tanque_l` | number | Não | Capacidade do tanque | 80 |
| `cilindrada_cm3` | number | Não | Cilindrada | 2755 |
| `cilindros` | number | Não | Número de cilindros | 4 |
| `potencia_cv` | number | Não | Potência em CV | 177 |
| `potencia_rpm` | number | Não | RPM da potência | 3400 |
| `torque_nm` | number | Não | Torque em Nm | 450 |
| `torque_rpm` | number | Não | RPM do torque | 1600 |
| `tipo_combustivel` | string | Não | Tipo de combustível | "Gasolina", "Diesel", "Flex" |
| `aspiração` | string | Não | Tipo de aspiração | "Aspirado", "Turbo" |
| `transmissao` | string | Não | Tipo de transmissão | "Manual", "Automática" |
| `marchas` | number | Não | Número de marchas | 6 |
| `tipo_tracao` | string | Não | Tipo de tração | "4x2", "4x4", "AWD" |
| `velocidade_max_kmh` | number | Não | Velocidade máxima | 175 |
| `aceleracao_0_100_seg` | number | Não | Aceleração 0-100 km/h | 11.5 |
| `consumo_cidade_km_l` | number | Não | Consumo na cidade | 9.5 |
| `consumo_estrada_km_l` | number | Não | Consumo na estrada | 12.5 |
| `consumo_combinado_km_l` | number | Não | Consumo combinado | 10.8 |
| `emissao_co2_g_km` | number | Não | Emissão de CO2 | 220 |
| `padrao_emissao` | string | Não | Padrão de emissão | "Euro 5", "Proconve L6" |
| `peso_ordem_marcha_kg` | number | Não | Peso em ordem de marcha | 2145 |
| `peso_bruto_kg` | number | Não | Peso bruto total | 3040 |
| `capacidade_carga_kg` | number | Não | Capacidade de carga | 895 |
| `capacidade_reboque_kg` | number | Não | Capacidade de reboque | 3500 |
| `suspensao_dianteira` | string | Não | Tipo de suspensão dianteira | "McPherson" |
| `suspensao_traseira` | string | Não | Tipo de suspensão traseira | "Eixo rígido" |
| `freios_dianteiros` | string | Não | Tipo de freios dianteiros | "Discos ventilados" |
| `freios_traseiros` | string | Não | Tipo de freios traseiros | "Discos sólidos" |
| `abs` | boolean | Não | ABS | "Sim", "Não" |
| `ebd` | boolean | Não | EBD | "Sim", "Não" |
| `esp` | boolean | Não | ESP | "Sim", "Não" |
| `numero_airbags` | number | Não | Número total de airbags | 7 |
| `airbags_frontais` | number | Não | Airbags frontais | 2 |
| `airbags_laterais` | number | Não | Airbags laterais | 2 |
| `airbags_cortina` | boolean | Não | Airbags de cortina | "Sim", "Não" |
| `isofix` | boolean | Não | ISOFIX | "Sim", "Não" |
| `classificacao_ncap` | string | Não | Classificação NCAP | "5 estrelas" |
| `ano_ncap` | number | Não | Ano do teste NCAP | 2020 |
| `controle_tracao` | boolean | Não | Controle de tração | "Sim", "Não" |
| `assistente_rampa` | boolean | Não | Assistente de rampa | "Sim", "Não" |
| `sensores_estacionamento` | boolean | Não | Sensores de estacionamento | "Sim", "Não" |
| `camera_re` | boolean | Não | Câmera de ré | "Sim", "Não" |
| `monitor_ponto_cego` | boolean | Não | Monitor de ponto cego | "Sim", "Não" |
| `numero_assentos` | number | Não | Número de assentos | 5 |
| `material_assentos` | string | Não | Material dos assentos | "Tecido", "Couro" |
| `ar_condicionado` | string | Não | Tipo de ar condicionado | "Manual", "Automático" |
| `teto_solar` | boolean | Não | Teto solar | "Sim", "Não" |
| `teto_panoramico` | boolean | Não | Teto panorâmico | "Sim", "Não" |
| `entrada_sem_chave` | boolean | Não | Entrada sem chave | "Sim", "Não" |
| `partida_botao` | boolean | Não | Partida por botão | "Sim", "Não" |
| `piloto_automatico` | boolean | Não | Piloto automático | "Sim", "Não" |
| `piloto_automatico_adaptativo` | boolean | Não | Piloto automático adaptativo | "Sim", "Não" |
| `assistente_estacionamento` | boolean | Não | Assistente de estacionamento | "Sim", "Não" |
| `tamanho_tela_polegadas` | number | Não | Tamanho da tela | 8.0 |
| `tipo_tela` | string | Não | Tipo de tela | "Touchscreen", "LCD" |
| `android_auto` | boolean | Não | Android Auto | "Sim", "Não" |
| `apple_carplay` | boolean | Não | Apple CarPlay | "Sim", "Não" |
| `bluetooth` | boolean | Não | Bluetooth | "Sim", "Não" |
| `portas_usb` | number | Não | Número de portas USB | 2 |
| `carregamento_sem_fio` | boolean | Não | Carregamento sem fio | "Sim", "Não" |
| `sistema_som` | string | Não | Descrição do sistema de som | "Sistema 10 alto-falantes" |
| `alto_falantes` | number | Não | Número de alto-falantes | 10 |
| `farois` | string | Não | Tipo de faróis | "LED", "Xenon" |
| `tipo_farois` | string | Não | Tipo específico | "LED" |
| `luzes_diurnas` | boolean | Não | Luzes diurnas | "Sim", "Não" |
| `farois_neblina` | boolean | Não | Faróis de neblina | "Sim", "Não" |
| `farois_adaptativos` | boolean | Não | Faróis adaptativos | "Sim", "Não" |
| `assistente_luz_alta` | boolean | Não | Assistente de luz alta | "Sim", "Não" |
| `dimensao_pneu_dianteiro` | string | Não | Dimensão do pneu dianteiro | "265/65 R17" |
| `dimensao_pneu_traseiro` | string | Não | Dimensão do pneu traseiro | "265/65 R17" |
| `tamanho_aro_polegadas` | number | Não | Tamanho do aro | 17 |
| `material_aro` | string | Não | Material do aro | "Liga-leve", "Aço" |
| `estepe` | string | Não | Tipo de estepe | "Estepe", "Kit" |
| `tempo_garantia_anos` | number | Não | Tempo de garantia | 3 |
| `quilometragem_garantia_km` | number | Não | Quilometragem de garantia | 100000 |
| `ano_lancamento` | number | Não | Ano de lançamento | 2016 |
| `ano_descontinuacao` | number | Não | Ano de descontinuação | 2023 |
| `faixa_preco` | string | Não | Faixa de preço | "Econômico", "Médio" |
| `mercado_alvo` | string | Não | Mercado alvo | "Brasil", "Global" |
| `observacoes` | string | Não | Observações gerais | "Texto livre" |
| `tags` | string | Não | Tags separadas por ponto e vírgula | "pickup;off-road;diesel" |

### Processamento do CSV

#### Passo 1: Parse do CSV
```typescript
function parseCSV(csvContent: string): Array<Record<string, string>> {
  // Usar biblioteca como papaparse ou csv-parse
  // Converter strings "Sim"/"Não" para boolean
  // Converter números
  // Tratar encoding UTF-8
}
```

#### Passo 2: Validação
```typescript
function validateCSVRow(row: Record<string, string>): ValidationResult {
  // Validar campos obrigatórios
  // Validar tipos de dados
  // Validar marca existe (ou criar se necessário)
  // Validar formatos específicos
}
```

#### Passo 3: Conversão para Especificações
```typescript
function convertCSVRowToSpecs(row: Record<string, string>): VehicleSpecs {
  // Mapear colunas CSV para estrutura specs
  // Converter tipos
  // Agrupar campos relacionados
}
```

#### Passo 4: Criação em Lote
```typescript
async function importVehicles(rows: Array<VehicleSpecs>): Promise<ImportResult> {
  // Para cada linha:
  // 1. Buscar ou criar marca
  // 2. Criar modelo com specs
  // 3. Retornar resultados (sucesso/erro por linha)
}
```

---

## ✅ Validações

### Validações de Marca

- **Nome:** Obrigatório, mínimo 2 caracteres, máximo 50 caracteres
- **Unicidade:** Não pode existir outra marca com o mesmo nome

### Validações de Modelo

- **Marca (brandId):** Obrigatório, deve ser UUID válido, marca deve existir
- **Nome:** Obrigatório, mínimo 2 caracteres, máximo 100 caracteres

### Validações de Especificações

- **Números:** Devem ser números positivos quando aplicável
- **Booleanos:** "Sim", "Não", "true", "false", "1", "0" são aceitos
- **Enums:** Validar valores aceitos (categoria, tipo de combustível, etc.)
- **Anos:** Entre 1900 e ano atual + 10
- **Dimensões:** Valores razoáveis (ex: altura entre 1000-3000mm)

### Validações de CSV

- **Encoding:** UTF-8
- **Delimitador:** Vírgula (`,`)
- **Encoding de quebra de linha:** `\n` ou `\r\n`
- **Cabeçalho:** Deve conter pelo menos `marca` e `nome_modelo`
- **Linhas vazias:** Ignoradas
- **Valores vazios:** Convertidos para `null` ou `undefined`

---

## 💻 Exemplos de Código

### TypeScript - Interface Completa

```typescript
// types/vehicle.ts

export interface CarBrand {
  id: string;
  name: string;
  models?: VehicleModel[];
}

export interface VehicleModel {
  id: string;
  brandId: string;
  name: string;
  specs: VehicleSpecs;
  brand?: CarBrand;
}

export interface VehicleSpecs {
  // Categoria e Tipo
  category?: 'pickup' | 'SUV' | 'sedan' | 'hatchback' | 'wagon' | 'van' | 'caminhao';
  vehicleType?: 'leve' | 'medio' | 'pesado';
  segment?: string;
  
  // Dimensões
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    wheelbase?: number;
    groundClearance?: number;
    trunkVolume?: number;
    fuelTankCapacity?: number;
  };
  
  // Motor e Performance
  engine?: {
    displacement?: number;
    cylinders?: number;
    power?: number;
    powerRPM?: number;
    torque?: number;
    torqueRPM?: number;
    fuelType?: 'gasolina' | 'diesel' | 'flex' | 'eletrico' | 'hibrido';
    aspiration?: 'aspirado' | 'turbo' | 'supercharger';
    transmission?: 'manual' | 'automatico' | 'cvt' | 'dct';
    gears?: number;
    driveType?: '4x2' | '4x4' | 'awd' | 'rwd' | 'fwd';
    topSpeed?: number;
    acceleration?: number;
  };
  
  // ... (demais campos conforme especificação completa acima)
  
  tags?: string[];
}

export interface CSVImportRow {
  marca: string;
  nome_modelo: string;
  [key: string]: string | number | boolean | undefined;
}

export interface ImportResult {
  success: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
}
```

### React - Componente de Lista

```typescript
// components/VehicleModelsList.tsx

import React, { useState, useEffect } from 'react';
import { VehicleModel } from '../types/vehicle';

interface Props {
  brandId?: string;
  onEdit: (model: VehicleModel) => void;
  onDelete: (id: string) => void;
}

export const VehicleModelsList: React.FC<Props> = ({ brandId, onEdit, onDelete }) => {
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 20;

  useEffect(() => {
    loadModels();
  }, [brandId, page, search]);

  const loadModels = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(brandId && { brandId }),
        ...(search && { search }),
      });
      
      const response = await fetch(`/api/vehicles/models?${params}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });
      
      const data = await response.json();
      setModels(data);
    } catch (error) {
      console.error('Erro ao carregar modelos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="filters">
        <input
          type="text"
          placeholder="Buscar modelo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Categoria</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={4}>Carregando...</td>
            </tr>
          ) : (
            models.map((model) => (
              <tr key={model.id}>
                <td>{model.brand?.name}</td>
                <td>{model.name}</td>
                <td>{model.specs.category || '-'}</td>
                <td>
                  <button onClick={() => onEdit(model)}>Editar</button>
                  <button onClick={() => onDelete(model.id)}>Deletar</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Anterior
        </button>
        <span>Página {page}</span>
        <button onClick={() => setPage(page + 1)}>Próxima</button>
      </div>
    </div>
  );
};
```

### React - Componente de Upload CSV

```typescript
// components/CSVUpload.tsx

import React, { useState } from 'react';
import Papa from 'papaparse';

interface Props {
  onImport: (data: any[]) => Promise<void>;
  onDownloadTemplate: () => void;
}

export const CSVUpload: React.FC<Props> = ({ onImport, onDownloadTemplate }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    Papa.parse(selectedFile, {
      header: true,
      encoding: 'UTF-8',
      complete: (results) => {
        setPreview(results.data as any[]);
      },
      error: (error) => {
        console.error('Erro ao parsear CSV:', error);
        alert('Erro ao ler arquivo CSV');
      },
    });
  };

  const handleImport = async () => {
    if (!file || preview.length === 0) return;

    setLoading(true);
    try {
      await onImport(preview);
      alert('Importação concluída com sucesso!');
      setFile(null);
      setPreview([]);
    } catch (error) {
      console.error('Erro na importação:', error);
      alert('Erro ao importar dados');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="csv-upload">
      <div className="actions">
        <button onClick={onDownloadTemplate}>
          📥 Baixar Template CSV
        </button>
      </div>
      
      <div className="upload-area">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
        />
        {file && <p>Arquivo: {file.name}</p>}
      </div>
      
      {preview.length > 0 && (
        <>
          <div className="preview">
            <h3>Preview ({preview.length} registros)</h3>
            <table>
              <thead>
                <tr>
                  {Object.keys(preview[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 5).map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((value: any, i) => (
                      <td key={i}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <button onClick={handleImport} disabled={loading}>
            {loading ? 'Importando...' : 'Confirmar Importação'}
          </button>
        </>
      )}
    </div>
  );
};
```

### Função de Download do Template CSV

```typescript
// utils/csvTemplate.ts

export function downloadCSVTemplate() {
  const headers = [
    'marca',
    'nome_modelo',
    'categoria',
    'tipo_veiculo',
    'segmento',
    'comprimento_mm',
    'largura_mm',
    'altura_mm',
    'distancia_eixos_mm',
    'altura_solo_mm',
    'volume_porta_malas_l',
    'capacidade_tanque_l',
    'cilindrada_cm3',
    'cilindros',
    'potencia_cv',
    'potencia_rpm',
    'torque_nm',
    'torque_rpm',
    'tipo_combustivel',
    'aspiração',
    'transmissao',
    'marchas',
    'tipo_tracao',
    'velocidade_max_kmh',
    'aceleracao_0_100_seg',
    'consumo_cidade_km_l',
    'consumo_estrada_km_l',
    'consumo_combinado_km_l',
    'emissao_co2_g_km',
    'padrao_emissao',
    'peso_ordem_marcha_kg',
    'peso_bruto_kg',
    'capacidade_carga_kg',
    'capacidade_reboque_kg',
    'suspensao_dianteira',
    'suspensao_traseira',
    'freios_dianteiros',
    'freios_traseiros',
    'abs',
    'ebd',
    'esp',
    'numero_airbags',
    'airbags_frontais',
    'airbags_laterais',
    'airbags_cortina',
    'isofix',
    'classificacao_ncap',
    'ano_ncap',
    'controle_tracao',
    'assistente_rampa',
    'sensores_estacionamento',
    'camera_re',
    'monitor_ponto_cego',
    'numero_assentos',
    'material_assentos',
    'ar_condicionado',
    'teto_solar',
    'teto_panoramico',
    'entrada_sem_chave',
    'partida_botao',
    'piloto_automatico',
    'piloto_automatico_adaptativo',
    'assistente_estacionamento',
    'tamanho_tela_polegadas',
    'tipo_tela',
    'android_auto',
    'apple_carplay',
    'bluetooth',
    'portas_usb',
    'carregamento_sem_fio',
    'sistema_som',
    'alto_falantes',
    'farois',
    'tipo_farois',
    'luzes_diurnas',
    'farois_neblina',
    'farois_adaptativos',
    'assistente_luz_alta',
    'dimensao_pneu_dianteiro',
    'dimensao_pneu_traseiro',
    'tamanho_aro_polegadas',
    'material_aro',
    'estepe',
    'tempo_garantia_anos',
    'quilometragem_garantia_km',
    'ano_lancamento',
    'ano_descontinuacao',
    'faixa_preco',
    'mercado_alvo',
    'observacoes',
    'tags',
  ];

  const csvContent = headers.join(',') + '\n';
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', 'template_veiculos.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
```

### Função de Conversão CSV para Specs

```typescript
// utils/csvConverter.ts

import { VehicleSpecs, CSVImportRow } from '../types/vehicle';

function parseBoolean(value: string): boolean | undefined {
  if (!value) return undefined;
  const lower = value.toLowerCase().trim();
  return ['sim', 'true', '1', 'yes'].includes(lower);
}

function parseNumber(value: string): number | undefined {
  if (!value) return undefined;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? undefined : parsed;
}

export function convertCSVRowToSpecs(row: CSVImportRow): VehicleSpecs {
  const specs: VehicleSpecs = {};

  // Categoria e Tipo
  if (row.categoria) specs.category = row.categoria as any;
  if (row.tipo_veiculo) specs.vehicleType = row.tipo_veiculo as any;
  if (row.segmento) specs.segmento = row.segmento;

  // Dimensões
  if (
    row.comprimento_mm ||
    row.largura_mm ||
    row.altura_mm ||
    row.distancia_eixos_mm ||
    row.altura_solo_mm ||
    row.volume_porta_malas_l ||
    row.capacidade_tanque_l
  ) {
    specs.dimensions = {
      length: parseNumber(row.comprimento_mm as string),
      width: parseNumber(row.largura_mm as string),
      height: parseNumber(row.altura_mm as string),
      wheelbase: parseNumber(row.distancia_eixos_mm as string),
      groundClearance: parseNumber(row.altura_solo_mm as string),
      trunkVolume: parseNumber(row.volume_porta_malas_l as string),
      fuelTankCapacity: parseNumber(row.capacidade_tanque_l as string),
    };
  }

  // Motor e Performance
  if (
    row.cilindrada_cm3 ||
    row.cilindros ||
    row.potencia_cv ||
    row.tipo_combustivel
  ) {
    specs.engine = {
      displacement: parseNumber(row.cilindrada_cm3 as string),
      cylinders: parseNumber(row.cilindros as string),
      power: parseNumber(row.potencia_cv as string),
      powerRPM: parseNumber(row.potencia_rpm as string),
      torque: parseNumber(row.torque_nm as string),
      torqueRPM: parseNumber(row.torque_rpm as string),
      fuelType: row.tipo_combustivel as any,
      aspiration: row.aspiração as any,
      transmission: row.transmissao as any,
      gears: parseNumber(row.marchas as string),
      driveType: row.tipo_tracao as any,
      topSpeed: parseNumber(row.velocidade_max_kmh as string),
      acceleration: parseNumber(row.aceleracao_0_100_seg as string),
    };
  }

  // Consumo e Emissões
  if (row.consumo_cidade_km_l || row.emissao_co2_g_km) {
    specs.consumption = {
      city: parseNumber(row.consumo_cidade_km_l as string),
      highway: parseNumber(row.consumo_estrada_km_l as string),
      combined: parseNumber(row.consumo_combinado_km_l as string),
      co2Emission: parseNumber(row.emissao_co2_g_km as string),
      euroStandard: row.padrao_emissao,
    };
  }

  // Peso e Capacidade
  if (row.peso_ordem_marcha_kg || row.capacidade_carga_kg) {
    specs.weight = {
      curbWeight: parseNumber(row.peso_ordem_marcha_kg as string),
      grossWeight: parseNumber(row.peso_bruto_kg as string),
      payload: parseNumber(row.capacidade_carga_kg as string),
      towingCapacity: parseNumber(row.capacidade_reboque_kg as string),
    };
  }

  // Suspensão e Freios
  if (row.suspensao_dianteira || row.freios_dianteiros) {
    specs.suspension = {
      front: row.suspensao_dianteira,
      rear: row.suspensao_traseira,
    };
    specs.brakes = {
      front: row.freios_dianteiros,
      rear: row.freios_traseiros,
      abs: parseBoolean(row.abs as string),
      ebd: parseBoolean(row.ebd as string),
      esp: parseBoolean(row.esp as string),
    };
  }

  // Segurança
  if (row.numero_airbags || row.controle_tracao) {
    specs.safety = {
      airbags: parseNumber(row.numero_airbags as string),
      airbagsFront: parseNumber(row.airbags_frontais as string),
      airbagsSide: parseNumber(row.airbags_laterais as string),
      airbagsCurtain: parseBoolean(row.airbags_cortina as string),
      isofix: parseBoolean(row.isofix as string),
      ncapRating: row.classificacao_ncap,
      ncapYear: parseNumber(row.ano_ncap as string),
      tractionControl: parseBoolean(row.controle_tracao as string),
      hillAssist: parseBoolean(row.assistente_rampa as string),
      parkingSensors: parseBoolean(row.sensores_estacionamento as string),
      rearviewCamera: parseBoolean(row.camera_re as string),
      blindSpotMonitor: parseBoolean(row.monitor_ponto_cego as string),
    };
  }

  // Conforto
  if (row.numero_assentos || row.ar_condicionado) {
    specs.comfort = {
      seats: parseNumber(row.numero_assentos as string),
      seatsMaterial: row.material_assentos,
      airConditioning: row.ar_condicionado,
      sunroof: parseBoolean(row.teto_solar as string),
      panoramicRoof: parseBoolean(row.teto_panoramico as string),
      keylessEntry: parseBoolean(row.entrada_sem_chave as string),
      startButton: parseBoolean(row.partida_botao as string),
      cruiseControl: parseBoolean(row.piloto_automatico as string),
      adaptiveCruise: parseBoolean(row.piloto_automatico_adaptativo as string),
      parkingAssist: parseBoolean(row.assistente_estacionamento as string),
    };
  }

  // Multimídia
  if (row.tamanho_tela_polegadas || row.android_auto) {
    specs.multimedia = {
      displaySize: parseNumber(row.tamanho_tela_polegadas as string),
      displayType: row.tipo_tela,
      androidAuto: parseBoolean(row.android_auto as string),
      appleCarPlay: parseBoolean(row.apple_carplay as string),
      bluetooth: parseBoolean(row.bluetooth as string),
      usbPorts: parseNumber(row.portas_usb as string),
      wirelessCharging: parseBoolean(row.carregamento_sem_fio as string),
      soundSystem: row.sistema_som,
      speakers: parseNumber(row.alto_falantes as string),
    };
  }

  // Iluminação
  if (row.farois || row.luzes_diurnas) {
    specs.lighting = {
      headlights: row.farois,
      daytimeLights: parseBoolean(row.luzes_diurnas as string),
      fogLights: parseBoolean(row.farois_neblina as string),
      adaptiveLights: parseBoolean(row.farois_adaptativos as string),
      highBeamAssist: parseBoolean(row.assistente_luz_alta as string),
    };
  }

  // Pneus
  if (row.dimensao_pneu_dianteiro || row.tamanho_aro_polegadas) {
    specs.tires = {
      frontSize: row.dimensao_pneu_dianteiro,
      rearSize: row.dimensao_pneu_traseiro,
      rimSize: parseNumber(row.tamanho_aro_polegadas as string),
      rimMaterial: row.material_aro,
      spareTire: row.estepe,
    };
  }

  // Garantia
  if (row.tempo_garantia_anos || row.quilometragem_garantia_km) {
    specs.warranty = {
      years: parseNumber(row.tempo_garantia_anos as string),
      kilometers: parseNumber(row.quilometragem_garantia_km as string),
    };
  }

  // Outros
  if (row.ano_lancamento) specs.releaseYear = parseNumber(row.ano_lancamento as string);
  if (row.ano_descontinuacao) specs.endYear = parseNumber(row.ano_descontinuacao as string);
  if (row.faixa_preco) specs.priceRange = row.faixa_preco;
  if (row.mercado_alvo) specs.targetMarket = row.mercado_alvo;
  if (row.observacoes) specs.notes = row.observacoes;
  if (row.tags) {
    specs.tags = (row.tags as string).split(';').map(t => t.trim()).filter(Boolean);
  }

  return specs;
}
```

### Função de Importação em Lote

```typescript
// services/vehicleImport.ts

import { convertCSVRowToSpecs } from '../utils/csvConverter';
import { CSVImportRow, ImportResult } from '../types/vehicle';

export async function importVehiclesFromCSV(
  rows: CSVImportRow[],
  token: string
): Promise<ImportResult> {
  const result: ImportResult = {
    success: 0,
    errors: [],
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    
    try {
      // Validar linha
      if (!row.marca || !row.nome_modelo) {
        result.errors.push({
          row: i + 2, // +2 porque linha 1 é cabeçalho e array começa em 0
          message: 'Marca e nome do modelo são obrigatórios',
        });
        continue;
      }

      // Buscar ou criar marca
      let brandId = await findOrCreateBrand(row.marca, token);

      // Converter CSV para specs
      const specs = convertCSVRowToSpecs(row);

      // Criar modelo
      await createModel(
        {
          brandId,
          name: row.nome_modelo,
          specs,
        },
        token
      );

      result.success++;
    } catch (error: any) {
      result.errors.push({
        row: i + 2,
        message: error.message || 'Erro desconhecido',
      });
    }
  }

  return result;
}

async function findOrCreateBrand(name: string, token: string): Promise<string> {
  // Buscar marca existente
  const response = await fetch(`/api/vehicles/brands?search=${encodeURIComponent(name)}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const brands = await response.json();
  const existing = brands.find((b: any) => 
    b.name.toLowerCase() === name.toLowerCase()
  );

  if (existing) {
    return existing.id;
  }

  // Criar nova marca
  const createResponse = await fetch('/api/vehicles/brands', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });

  const newBrand = await createResponse.json();
  return newBrand.id;
}

async function createModel(data: any, token: string): Promise<void> {
  const response = await fetch('/api/vehicles/models', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao criar modelo');
  }
}
```

---

## 🧩 Componentes

### Estrutura de Componentes Recomendada

```
components/
  vehicles/
    VehicleBrandsList.tsx
    VehicleBrandForm.tsx
    VehicleModelsList.tsx
    VehicleModelForm.tsx
    VehicleSpecsForm.tsx
    VehicleDetails.tsx
    CSVUpload.tsx
    CSVImportModal.tsx
```

### Formulário de Especificações (Exemplo Simplificado)

```typescript
// components/VehicleSpecsForm.tsx

import React from 'react';
import { VehicleSpecs } from '../types/vehicle';

interface Props {
  specs: VehicleSpecs;
  onChange: (specs: VehicleSpecs) => void;
}

export const VehicleSpecsForm: React.FC<Props> = ({ specs, onChange }) => {
  const updateSpecs = (path: string[], value: any) => {
    const newSpecs = { ...specs };
    let current: any = newSpecs;
    
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }
    
    current[path[path.length - 1]] = value;
    onChange(newSpecs);
  };

  return (
    <div className="specs-form">
      <h3>Especificações Técnicas</h3>
      
      {/* Categoria */}
      <div className="form-group">
        <label>Categoria</label>
        <select
          value={specs.category || ''}
          onChange={(e) => updateSpecs(['category'], e.target.value)}
        >
          <option value="">Selecione...</option>
          <option value="pickup">Pickup</option>
          <option value="SUV">SUV</option>
          <option value="sedan">Sedan</option>
          <option value="hatchback">Hatchback</option>
          <option value="wagon">Wagon</option>
          <option value="van">Van</option>
          <option value="caminhao">Caminhão</option>
        </select>
      </div>

      {/* Dimensões */}
      <div className="form-section">
        <h4>Dimensões</h4>
        <div className="form-row">
          <div className="form-group">
            <label>Comprimento (mm)</label>
            <input
              type="number"
              value={specs.dimensions?.length || ''}
              onChange={(e) =>
                updateSpecs(['dimensions', 'length'], parseFloat(e.target.value) || undefined)
              }
            />
          </div>
          <div className="form-group">
            <label>Largura (mm)</label>
            <input
              type="number"
              value={specs.dimensions?.width || ''}
              onChange={(e) =>
                updateSpecs(['dimensions', 'width'], parseFloat(e.target.value) || undefined)
              }
            />
          </div>
          {/* ... mais campos de dimensões */}
        </div>
      </div>

      {/* Motor */}
      <div className="form-section">
        <h4>Motor e Performance</h4>
        {/* ... campos de motor */}
      </div>

      {/* ... mais seções */}
    </div>
  );
};
```

---

## 📦 Dependências Recomendadas

### Para React
```json
{
  "dependencies": {
    "papaparse": "^5.4.1",        // Parse CSV
    "react-hook-form": "^7.48.2", // Formulários
    "zod": "^3.22.4",             // Validação
    "@tanstack/react-table": "^8.10.7" // Tabelas
  }
}
```

### Para Vue
```json
{
  "dependencies": {
    "papaparse": "^5.4.1",
    "vuelidate": "^2.0.3",
    "@vueuse/core": "^10.7.0"
  }
}
```

---

## 🎯 Checklist de Implementação

### Funcionalidades Básicas
- [ ] Listar marcas
- [ ] Criar marca
- [ ] Editar marca
- [ ] Deletar marca
- [ ] Listar modelos (com paginação)
- [ ] Criar modelo
- [ ] Editar modelo
- [ ] Deletar modelo
- [ ] Ver detalhes do modelo

### Funcionalidades Avançadas
- [ ] Busca de modelos
- [ ] Filtro por marca
- [ ] Upload CSV
- [ ] Download template CSV
- [ ] Validação de CSV
- [ ] Preview de importação
- [ ] Relatório de importação (sucesso/erros)

### Especificações
- [ ] Formulário completo de specs
- [ ] Validação de campos
- [ ] Agrupamento por seções
- [ ] Campos condicionais
- [ ] Preview de specs

### UX/UI
- [ ] Loading states
- [ ] Error handling
- [ ] Confirmações de ações destrutivas
- [ ] Feedback de sucesso
- [ ] Responsividade
- [ ] Acessibilidade

---

**Última atualização:** 2024-11-04  
**Versão:** 1.0.0

