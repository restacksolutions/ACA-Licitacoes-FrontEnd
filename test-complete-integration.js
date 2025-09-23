// Script completo para testar integração Frontend/Backend
const http = require('http');

console.log('🧪 Teste Completo de Integração Frontend/Backend\n');

let accessToken = null;

// Função para fazer requisições HTTP
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsedData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData, headers: res.headers });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Teste 1: Health Check
async function testHealthCheck() {
  console.log('1️⃣ Testando Health Check...');
  try {
    const result = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/v1/health',
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (result.status === 200) {
      console.log('   ✅ Health Check: OK');
      console.log(`   📊 Status: ${result.data.status}`);
    } else {
      console.log('   ❌ Health Check: FALHOU');
    }
  } catch (error) {
    console.log('   ❌ Health Check: ERRO -', error.message);
  }
  console.log('');
}

// Teste 2: Login
async function testLogin() {
  console.log('2️⃣ Testando Login...');
  try {
    const result = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/v1/auth/login',
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }, {
      email: 'test@test.com',
      password: '123456'
    });
    
    if (result.status === 200 || result.status === 201) {
      console.log('   ✅ Login: SUCESSO');
      accessToken = result.data.access_token;
      console.log(`   🔑 Token: ${accessToken.substring(0, 20)}...`);
      console.log(`   👤 User: ${result.data.user.fullName}`);
    } else {
      console.log('   ❌ Login: FALHOU');
      console.log(`   📊 Status: ${result.status}`);
      console.log(`   📝 Erro: ${result.data.message || 'Erro desconhecido'}`);
    }
  } catch (error) {
    console.log('   ❌ Login: ERRO -', error.message);
  }
  console.log('');
}

// Teste 3: Endpoint Protegido (sem token)
async function testProtectedWithoutToken() {
  console.log('3️⃣ Testando Endpoint Protegido (sem token)...');
  try {
    const result = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/v1/users/me',
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (result.status === 401) {
      console.log('   ✅ Endpoint Protegido (sem token): Comportamento correto (401)');
      console.log(`   📝 Mensagem: ${result.data.message}`);
    } else {
      console.log('   ⚠️ Endpoint Protegido (sem token): Comportamento inesperado');
      console.log(`   📊 Status: ${result.status}`);
    }
  } catch (error) {
    console.log('   ❌ Endpoint Protegido (sem token): ERRO -', error.message);
  }
  console.log('');
}

// Teste 4: Endpoint Protegido (com token)
async function testProtectedWithToken() {
  console.log('4️⃣ Testando Endpoint Protegido (com token)...');
  
  if (!accessToken) {
    console.log('   ⚠️ Nenhum token disponível. Pulando teste.');
    console.log('');
    return;
  }
  
  try {
    const result = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/v1/users/me',
      method: 'GET',
      headers: { 
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (result.status === 200) {
      console.log('   ✅ Endpoint Protegido (com token): SUCESSO');
      console.log(`   👤 User: ${result.data.fullName || 'N/A'}`);
    } else {
      console.log('   ❌ Endpoint Protegido (com token): FALHOU');
      console.log(`   📊 Status: ${result.status}`);
      console.log(`   📝 Erro: ${result.data.message || 'Erro desconhecido'}`);
    }
  } catch (error) {
    console.log('   ❌ Endpoint Protegido (com token): ERRO -', error.message);
  }
  console.log('');
}

// Teste 5: Companies (com token)
async function testCompanies() {
  console.log('5️⃣ Testando Companies (com token)...');
  
  if (!accessToken) {
    console.log('   ⚠️ Nenhum token disponível. Pulando teste.');
    console.log('');
    return;
  }
  
  try {
    const result = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/v1/companies',
      method: 'GET',
      headers: { 
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (result.status === 200) {
      console.log('   ✅ Companies: SUCESSO');
      console.log(`   📊 Quantidade: ${Array.isArray(result.data) ? result.data.length : 'N/A'}`);
    } else {
      console.log('   ❌ Companies: FALHOU');
      console.log(`   📊 Status: ${result.status}`);
      console.log(`   📝 Erro: ${result.data.message || 'Erro desconhecido'}`);
    }
  } catch (error) {
    console.log('   ❌ Companies: ERRO -', error.message);
  }
  console.log('');
}

// Teste 6: CORS
async function testCORS() {
  console.log('6️⃣ Testando CORS...');
  try {
    const result = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/v1/health',
      method: 'GET',
      headers: { 
        'Accept': 'application/json',
        'Origin': 'http://localhost:4200'
      }
    });
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': result.headers['access-control-allow-origin'],
      'Access-Control-Allow-Methods': result.headers['access-control-allow-methods'],
      'Access-Control-Allow-Headers': result.headers['access-control-allow-headers'],
      'Access-Control-Allow-Credentials': result.headers['access-control-allow-credentials']
    };
    
    if (corsHeaders['Access-Control-Allow-Origin']) {
      console.log('   ✅ CORS: Configurado');
      console.log(`   🌐 Origin: ${corsHeaders['Access-Control-Allow-Origin']}`);
      console.log(`   🔧 Methods: ${corsHeaders['Access-Control-Allow-Methods'] || 'N/A'}`);
    } else {
      console.log('   ⚠️ CORS: Headers não encontrados');
    }
  } catch (error) {
    console.log('   ❌ CORS: ERRO -', error.message);
  }
  console.log('');
}

// Executar todos os testes
async function runAllTests() {
  console.log('🚀 Iniciando testes de integração...\n');
  
  await testHealthCheck();
  await testLogin();
  await testProtectedWithoutToken();
  await testProtectedWithToken();
  await testCompanies();
  await testCORS();
  
  console.log('🎉 Testes concluídos!\n');
  
  console.log('📋 Resumo:');
  console.log('   - Backend: http://localhost:3000');
  console.log('   - Frontend: http://localhost:4200');
  console.log('   - API Base: http://localhost:3000/v1');
  console.log('   - Swagger: http://localhost:3000/docs');
  console.log('   - Teste HTML: http://localhost:4200/test-auth.html');
  
  if (accessToken) {
    console.log('\n🔑 Token obtido com sucesso!');
    console.log('   O frontend deve conseguir fazer requisições autenticadas.');
  } else {
    console.log('\n⚠️ Nenhum token obtido.');
    console.log('   Verifique se o backend está rodando e se o login está funcionando.');
  }
}

runAllTests().catch(console.error);
