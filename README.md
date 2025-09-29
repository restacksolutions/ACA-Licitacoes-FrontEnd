# 🎨 ACA Licitações Frontend

Frontend do sistema de licitações desenvolvido em **Angular + Tailwind CSS**.

## 🚀 Quick Start

### Com Docker (Recomendado)

```bash
# 1. Iniciar todos os serviços
docker-compose up -d

# 2. Acessar aplicação
# http://localhost:4200
```

### Desenvolvimento Local

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar em modo desenvolvimento
npm start

# 3. Acessar aplicação
# http://localhost:4200
```

## 📁 Estrutura

```
src/
├── app/
│   ├── components/              # Componentes reutilizáveis
│   ├── pages/                   # Páginas da aplicação
│   ├── services/                # Serviços Angular
│   ├── guards/                  # Guards de rota
│   ├── interceptors/            # Interceptors HTTP
│   ├── models/                  # Interfaces/Models
│   └── shared/                  # Componentes compartilhados
├── assets/                      # Assets estáticos
├── environments/                # Configurações de ambiente
└── styles/                      # Estilos globais
```

## 🎨 Tecnologias

- **Angular 20**: Framework principal
- **Tailwind CSS**: Framework de estilos
- **Angular Material**: Componentes UI
- **RxJS**: Programação reativa
- **Axios**: Cliente HTTP
- **SweetAlert2**: Alertas e modais

## 🔧 Configuração

### Variáveis de Ambiente

```typescript
// environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  appName: 'ACA Licitações'
};
```

### Proxy para API

```json
// proxy.conf.json
{
  "/api/*": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

## 🚀 Scripts Disponíveis

```bash
# Desenvolvimento
npm start                    # Servidor de desenvolvimento
npm run start:proxy         # Com proxy para API

# Build
npm run build               # Build para produção
npm run build:dev           # Build para desenvolvimento

# Testes
npm test                    # Testes unitários
npm run test:watch          # Testes em modo watch

# Linting
npm run lint                # ESLint
```

## 🐳 Docker

### Build e Run

```bash
# Build da imagem
docker build -t aca-frontend .

# Executar container
docker run -p 4200:80 aca-frontend

# Com docker-compose
docker-compose up -d
```

### Nginx Configuration

```nginx
# nginx.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://aca-backend:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🔐 Autenticação

### Serviço de Auth

```typescript
// services/auth.service.ts
@Injectable()
export class AuthService {
  login(credentials: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/v1/auth/login', credentials);
  }

  register(data: RegisterDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/v1/auth/register', data);
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/v1/auth/refresh', {
      refresh_token: this.getRefreshToken()
    });
  }
}
```

### Guard de Rota

```typescript
// guards/auth.guard.ts
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(): boolean {
    return this.authService.isAuthenticated();
  }
}
```

## 🎨 Componentes

### Layout Principal

```typescript
// components/layout/main-layout.component.ts
@Component({
  selector: 'app-main-layout',
  template: `
    <div class="min-h-screen bg-gray-100">
      <app-header></app-header>
      <main class="container mx-auto px-4 py-8">
        <router-outlet></router-outlet>
      </main>
      <app-footer></app-footer>
    </div>
  `
})
export class MainLayoutComponent {}
```

### Formulário de Login

```typescript
// components/auth/login-form.component.ts
@Component({
  selector: 'app-login-form',
  template: `
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
      <input formControlName="email" type="email" placeholder="Email">
      <input formControlName="password" type="password" placeholder="Senha">
      <button type="submit" [disabled]="loginForm.invalid">
        Entrar
      </button>
    </form>
  `
})
export class LoginFormComponent {}
```

## 📱 Responsividade

### Breakpoints Tailwind

```css
/* Mobile First */
.container {
  @apply px-4;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    @apply px-6;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    @apply px-8;
  }
}
```

## 🧪 Testes

### Teste de Componente

```typescript
// components/auth/login-form.component.spec.ts
describe('LoginFormComponent', () => {
  let component: LoginFormComponent;
  let fixture: ComponentFixture<LoginFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoginFormComponent],
      imports: [ReactiveFormsModule]
    });
    fixture = TestBed.createComponent(LoginFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

## 🚀 Deploy

### Build para Produção

```bash
# Build otimizado
npm run build

# Arquivos gerados em dist/ng-tailadmin/
```

### Docker para Produção

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist/ng-tailadmin /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔧 Desenvolvimento

### Adicionar Nova Página

```bash
# Gerar componente
ng generate component pages/nova-pagina

# Gerar serviço
ng generate service services/nova-pagina

# Gerar guard
ng generate guard guards/nova-pagina
```

### Adicionar Nova Rota

```typescript
// app-routing.module.ts
const routes: Routes = [
  { path: 'nova-pagina', component: NovaPaginaComponent },
  { path: 'nova-pagina/:id', component: NovaPaginaDetailComponent }
];
```

## 📚 Documentação

- **Angular Docs**: https://angular.io/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Angular Material**: https://material.angular.io/

## ❓ Troubleshooting

### Problemas Comuns

#### 1. **Erro de CORS**
```typescript
// Adicionar proxy no angular.json
"serve": {
  "builder": "@angular-devkit/build-angular:dev-server",
  "options": {
    "proxyConfig": "proxy.conf.json"
  }
}
```

#### 2. **Erro de Build**
```bash
# Limpar cache
npm run clean
rm -rf node_modules
npm install
```

#### 3. **Erro de Rota**
```typescript
// Verificar se a rota está registrada
// app-routing.module.ts
```

---

**Desenvolvido com ❤️ pela equipe ACA**