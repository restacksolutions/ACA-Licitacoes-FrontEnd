const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = 4200;

// Servir arquivos estáticos do Angular
app.use(express.static(path.join(__dirname, 'dist/ng-tailadmin')));

// Configurar proxy para /v1/*
app.use('/v1', createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true,
  logLevel: 'debug'
}));

// Rota para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/ng-tailadmin/index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log('Proxy configurado para /v1/* -> http://localhost:3000');
});
