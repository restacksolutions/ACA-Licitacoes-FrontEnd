# Sistema de Controle de Licitações

Sistema completo para controle e gestão de licitações públicas, desenvolvido com Angular 20 e FastAPI.

## 🚀 Tecnologias

### Frontend
- **Angular 20** - Framework principal
- **Tailwind CSS** - Estilização
- **TypeScript** - Linguagem de programação
- **RxJS** - Programação reativa

### Dados
- **Dados Fictícios** - Sistema funciona com dados mockados
- **LocalStorage** - Persistência local de dados
- **Observables** - Simulação de chamadas de API

## 📋 Funcionalidades

### ✅ Implementado
- [x] Interface de navegação do sistema
- [x] Dados fictícios de licitações
- [x] Dados fictícios de veículos
- [x] Serviços mockados para simulação de API
- [x] Estrutura de componentes Angular
- [x] Sistema de roteamento

### 🚧 Em Desenvolvimento
- [ ] Sistema de autenticação
- [ ] Upload de editais
- [ ] CRUD completo de veículos
- [ ] Sistema de compatibilidade
- [ ] Geração de documentos
- [ ] Kanban de prazos
- [ ] Relatórios

## 🛠️ Instalação

### Pré-requisitos
- Node.js 18+
- Angular CLI

### Frontend
```bash
# Instalar dependências
npm install

# Executar em modo de desenvolvimento
ng serve

# Acessar em http://localhost:4200
```

## 🔧 Configuração

### Dados Fictícios
O sistema funciona com dados fictícios pré-carregados:

- **Licitações**: 5 licitações de exemplo com diferentes status
- **Veículos**: 6 veículos de exemplo com especificações completas
- **Usuários**: 3 usuários de exemplo (Admin, Analista, Técnico)

### Credenciais de Teste
Para testar o sistema (quando a autenticação for implementada):
- **Admin**: admin@sistema.com / senha123
- **Analista**: analista@sistema.com / senha123
- **Técnico**: tecnico@sistema.com / senha123

## 📁 Estrutura do Projeto

```
VV-Licitacoes/
├── src/                    # Frontend Angular
│   ├── app/
│   │   ├── core/          # Serviços e guards
│   │   │   └── services/  # Serviços com dados fictícios
│   │   ├── pages/         # Páginas da aplicação
│   │   │   ├── tenders/   # Páginas de licitações
│   │   │   ├── vehicles/  # Páginas de veículos
│   │   │   └── reports/   # Páginas de relatórios
│   │   └── shared/        # Componentes compartilhados
│   └── environments/      # Configurações de ambiente
├── backend/               # Backend (removido temporariamente)
└── README.md
```

## 🔐 Autenticação

**Status**: Temporariamente desabilitada

O sistema foi projetado para utilizar JWT com três níveis de acesso:
- **ADMIN**: Acesso total ao sistema
- **ANALYST**: Análise de licitações e veículos
- **TECH**: Operações técnicas

## 📊 Dados

### Estrutura dos Dados Fictícios
- **Licitações**: Título, órgão, UF, modalidade, objeto, status, prazos
- **Veículos**: Nome, versão, especificações técnicas completas
- **Usuários**: Email, nome, role, empresa

## 🚀 Deploy

### Desenvolvimento Local
```bash
ng serve
```

### Produção
```bash
ng build --configuration production
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte, entre em contato através dos canais oficiais do projeto.