// Script para testar integração entre frontend e backend
const http = require('http');

console.log('🧪 Testando integração Frontend/Backend...\n');

// Teste 1: Verificar se o backend está rodando
function testBackendHealth() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/v1/health',
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('✅ Backend Health Check:');
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Response: ${data}\n`);
        resolve({ status: res.statusCode, data: JSON.parse(data) });
      });
    });

    req.on('error', (err) => {
      console.log('❌ Backend Health Check:');
      console.log(`   Erro: ${err.message}\n`);
      reject(err);
    });

    req.end();
  });
}

// Teste 2: Verificar CORS
function testCORS() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/v1/health/cors',
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Origin': 'http://localhost:4200'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('✅ CORS Test:');
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   CORS Headers: ${JSON.stringify(res.headers, null, 2)}`);
        console.log(`   Response: ${data}\n`);
        resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(data) });
      });
    });

    req.on('error', (err) => {
      console.log('❌ CORS Test:');
      console.log(`   Erro: ${err.message}\n`);
      reject(err);
    });

    req.end();
  });
}

// Teste 3: Verificar se o frontend pode acessar
function testFrontendAccess() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4200,
      path: '/',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      console.log('✅ Frontend Access:');
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   Frontend está rodando em http://localhost:4200\n`);
      resolve({ status: res.statusCode });
    });

    req.on('error', (err) => {
      console.log('❌ Frontend Access:');
      console.log(`   Erro: ${err.message}`);
      console.log('   Frontend não está rodando ou não está na porta 4200\n');
      reject(err);
    });

    req.end();
  });
}

// Executar todos os testes
async function runTests() {
  try {
    console.log('🚀 Iniciando testes de integração...\n');
    
    await testBackendHealth();
    await testCORS();
    await testFrontendAccess();
    
    console.log('🎉 Testes concluídos!');
    console.log('\n📋 Resumo:');
    console.log('   - Backend: http://localhost:3000');
    console.log('   - Frontend: http://localhost:4200');
    console.log('   - API Base: http://localhost:3000/v1');
    console.log('   - Swagger: http://localhost:3000/docs');
    
  } catch (error) {
    console.log('❌ Alguns testes falharam. Verifique se:');
    console.log('   1. Backend está rodando: npm run start:dev (na pasta ACA-Licitacoes-Back)');
    console.log('   2. Frontend está rodando: npm start (na pasta ACA-Licitacoes-Front)');
    console.log('   3. CORS está configurado no backend');
  }
}

runTests();
