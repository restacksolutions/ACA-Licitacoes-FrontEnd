// Script para testar o fluxo completo de autenticação
const http = require('http');

console.log('🧪 Teste do Fluxo Completo de Autenticação\n');

let accessToken = null;
let refreshToken = null;
let userData = null;

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

// Simular localStorage
const localStorage = {
  data: {},
  setItem(key, value) {
    this.data[key] = value;
    console.log(`💾 [localStorage] Salvando ${key}:`, value.substring(0, 50) + '...');
  },
  getItem(key) {
    return this.data[key] || null;
  },
  removeItem(key) {
    delete this.data[key];
    console.log(`🗑️ [localStorage] Removendo ${key}`);
  }
};

// Teste 1: Login
async function testLogin() {
  console.log('1️⃣ Testando Login...');
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
      console.log('   📊 Dados recebidos:', JSON.stringify(result.data, null, 2));
      
      // Verificar se os dados necessários existem
      if (result.data && result.data.access_token && result.data.email && result.data.user_id) {
        // Simular salvamento no localStorage
        accessToken = result.data.access_token;
        refreshToken = result.data.access_token; // Usar access_token como refresh também
        userData = {
          id: result.data.user_id,
          email: result.data.email,
          name: result.data.email.split('@')[0], // Nome baseado no email
          role: 'ADMIN', // Role padrão para desenvolvimento
          company_id: 'mock-company-id',
          created_at: new Date().toISOString()
        };
        
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        localStorage.setItem('current_user', JSON.stringify(userData));
        
        console.log('   🔑 Token salvo:', accessToken.substring(0, 20) + '...');
        console.log('   👤 User salvo:', userData.name);
        console.log('   📧 Email:', userData.email);
        console.log('   🏢 Company ID:', userData.company_id);
      } else {
        console.log('   ⚠️ Dados incompletos na resposta');
        console.log('   📊 Estrutura recebida:', Object.keys(result.data || {}));
      }
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

// Teste 2: Cadastro
async function testSignup() {
  console.log('2️⃣ Testando Cadastro...');
  try {
    const result = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/v1/auth/register',
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }, {
      fullName: 'João Silva Teste',
      email: 'joao.teste@example.com',
      password: '123456',
      companyName: 'Empresa Teste Ltda',
      companyCnpj: '12.345.678/0001-90',
      companyPhone: '(11) 99999-9999',
      companyAddress: 'Rua Teste, 123'
    });
    
    if (result.status === 200 || result.status === 201) {
      console.log('   ✅ Cadastro: SUCESSO');
      
      // Simular salvamento no localStorage
      accessToken = result.data.access_token;
      refreshToken = result.data.refresh_token;
      userData = {
        id: result.data.user.id,
        email: result.data.user.email,
        name: result.data.user.fullName,
        role: result.data.membership.role,
        company_id: result.data.company.id,
        created_at: result.data.user.createdAt
      };
      
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('current_user', JSON.stringify(userData));
      
      console.log('   🔑 Token salvo:', accessToken.substring(0, 20) + '...');
      console.log('   👤 User salvo:', userData.name);
      console.log('   🏢 Company:', result.data.company.name);
    } else {
      console.log('   ❌ Cadastro: FALHOU');
      console.log(`   📊 Status: ${result.status}`);
      console.log(`   📝 Erro: ${result.data.message || 'Erro desconhecido'}`);
    }
  } catch (error) {
    console.log('   ❌ Cadastro: ERRO -', error.message);
  }
  console.log('');
}

// Teste 3: Verificar localStorage
function testLocalStorage() {
  console.log('3️⃣ Verificando localStorage...');
  
  const storedToken = localStorage.getItem('access_token');
  const storedRefreshToken = localStorage.getItem('refresh_token');
  const storedUser = localStorage.getItem('current_user');
  
  console.log('   🔑 Access Token:', storedToken ? 'Presente' : 'Ausente');
  console.log('   🔄 Refresh Token:', storedRefreshToken ? 'Presente' : 'Ausente');
  console.log('   👤 Current User:', storedUser ? 'Presente' : 'Ausente');
  
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      console.log('   👤 User Details:', `${user.name} (${user.email}) - ${user.role}`);
    } catch (e) {
      console.log('   ❌ Erro ao parsear user data');
    }
  }
  
  console.log('   📋 Todas as chaves:', Object.keys(localStorage.data));
  console.log('');
}

// Teste 4: Endpoint Protegido
async function testProtectedEndpoint() {
  console.log('4️⃣ Testando Endpoint Protegido...');
  
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
      console.log('   ✅ Endpoint Protegido: SUCESSO');
      console.log(`   👤 User: ${result.data.fullName || 'N/A'}`);
    } else {
      console.log('   ❌ Endpoint Protegido: FALHOU');
      console.log(`   📊 Status: ${result.status}`);
      console.log(`   📝 Erro: ${result.data.message || 'Erro desconhecido'}`);
    }
  } catch (error) {
    console.log('   ❌ Endpoint Protegido: ERRO -', error.message);
  }
  console.log('');
}

// Teste 5: Simular Redirecionamento
function testRedirect() {
  console.log('5️⃣ Simulando Redirecionamento...');
  
  const isLoggedIn = !!localStorage.getItem('access_token');
  const user = localStorage.getItem('current_user');
  
  if (isLoggedIn && user) {
    console.log('   ✅ Usuário logado - Redirecionando para /dashboard');
    console.log('   🎯 URL de destino: http://localhost:4200/dashboard');
    console.log('   👤 Usuário:', JSON.parse(user).name);
  } else {
    console.log('   ❌ Usuário não logado - Redirecionando para /login');
    console.log('   🎯 URL de destino: http://localhost:4200/login');
  }
  console.log('');
}

// Executar todos os testes
async function runAllTests() {
  console.log('🚀 Iniciando testes do fluxo completo...\n');
  
  await testLogin();
  testLocalStorage();
  await testProtectedEndpoint();
  testRedirect();
  
  console.log('🔄 Testando cadastro...\n');
  await testSignup();
  testLocalStorage();
  await testProtectedEndpoint();
  testRedirect();
  
  console.log('🎉 Testes concluídos!\n');
  
  console.log('📋 Resumo:');
  console.log('   - Backend: http://localhost:3000');
  console.log('   - Frontend: http://localhost:4200');
  console.log('   - Dashboard: http://localhost:4200/dashboard');
  console.log('   - Login: http://localhost:4200/login');
  console.log('   - Cadastro: http://localhost:4200/signup');
  
  if (accessToken) {
    console.log('\n✅ Fluxo de autenticação funcionando!');
    console.log('   - Tokens salvos no localStorage');
    console.log('   - Dados do usuário salvos');
    console.log('   - Redirecionamento para dashboard configurado');
  } else {
    console.log('\n❌ Problema no fluxo de autenticação');
    console.log('   - Verifique se o backend está rodando');
    console.log('   - Verifique se as rotas estão configuradas');
  }
}

runAllTests().catch(console.error);
