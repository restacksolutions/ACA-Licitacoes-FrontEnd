# Multi-stage build para otimizar o tamanho da imagem
FROM node:18-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação Angular
RUN npm run build

# Estágio de produção com Nginx
FROM nginx:alpine AS production

# Instalar curl para healthcheck
RUN apk add --no-cache curl

# Copiar arquivos compilados do estágio anterior
COPY --from=builder /app/dist/ng-tailadmin /usr/share/nginx/html

# Copiar configuração customizada do Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Expor porta
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80 || exit 1

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]
