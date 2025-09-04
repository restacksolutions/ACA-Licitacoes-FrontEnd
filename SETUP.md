# Guia de Configuração - Sistema de Licitações

## 🚀 Início Rápido

### 1. Configuração do Frontend

```bash
# Instalar dependências
npm install

# Executar em modo de desenvolvimento
ng serve

# Acessar em http://localhost:4200
```

## 📊 Dados Fictícios

O sistema funciona com dados fictícios pré-carregados:

### Licitações (5 exemplos)
- Aquisição de Veículos para Prefeitura (SP)
- Contratação de Serviços de Limpeza (RJ)
- Fornecimento de Equipamentos de Informática (DF)
- Construção de Escola Municipal (MG)
- Aquisição de Medicamentos (SP)

### Veículos (6 exemplos)
- Hilux SW4 2024
- Ranger 2024
- Amarok 2024
- S10 2024
- L200 Triton 2024
- Frontier 2024

### Usuários (3 exemplos)
- **Admin**: admin@sistema.com / senha123
- **Analista**: analista@sistema.com / senha123
- **Técnico**: tecnico@sistema.com / senha123

## 🧪 Testando a Aplicação

### 1. Acesse o Frontend
- URL: `http://localhost:4200`
- Navegue pelas diferentes seções do sistema

### 2. Funcionalidades Disponíveis
- **Dashboard**: Visão geral do sistema
- **Licitações**: Lista de licitações com diferentes status
- **Veículos**: Catálogo de veículos com especificações
- **Calendário**: Visualização de prazos
- **Relatórios**: Análises e estatísticas
- **Configurações**: Ajustes do sistema

### 3. Navegação
- Use o menu lateral para navegar entre as seções
- Cada página mostra dados fictícios realistas
- Os dados são carregados com delay simulado para simular API

## 🔧 Estrutura dos Dados

### Licitações
```typescript
interface Tender {
  id: string;
  title: string;
  orgao: string;
  uf: string;
  modalidade: string;
  objeto: string;
  status: string;
  deadlines_json: any;
  version: number;
  created_at: string;
  updated_at: string;
}
```

### Veículos
```typescript
interface Vehicle {
  id: string;
  name: string;
  version: string;
  specs_json: any;
  active: boolean;
  created_at: string;
  updated_at: string;
}
```

## 📝 Próximos Passos

Após a configuração inicial:

1. **Explorar Interface**: Navegue pelas diferentes seções
2. **Verificar Dados**: Confirme que os dados fictícios estão carregando
3. **Testar Navegação**: Use o menu lateral e breadcrumbs
4. **Analisar Estrutura**: Examine os componentes e serviços
5. **Planejar Desenvolvimento**: Identifique próximas funcionalidades

## 🆘 Troubleshooting

### Erro de Build
```bash
# Limpar cache do Angular
ng cache clean

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

### Erro de Servidor
```bash
# Verificar se a porta 4200 está livre
netstat -an | findstr :4200

# Usar porta alternativa
ng serve --port 4201
```

### Problemas de Dados
- Os dados são carregados automaticamente
- Se não aparecerem, verifique o console do navegador
- Os dados são simulados com delay de 500ms

## 📞 Suporte

Para suporte:
1. Verifique os logs no console do navegador
2. Confirme que todas as dependências estão instaladas
3. Verifique se o Node.js está na versão 18+
4. Abra uma issue no repositório se necessário