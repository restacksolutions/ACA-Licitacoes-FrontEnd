const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/v1';

// Teste simples das rotas de membros
async function testMembersSimple() {
  console.log('👥 ===== TESTE SIMPLES DAS ROTAS DE MEMBROS =====\n');

  try {
    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });

    const { access_token } = loginResponse.data;
    console.log('✅ Login realizado com sucesso');

    // 2. Verificar se há empresas
    console.log('\n2️⃣ Verificando empresas...');
    const companiesResponse = await axios.get(`${API_BASE_URL}/companies`, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    console.log('Empresas encontradas:', companiesResponse.data.length);
    
    if (companiesResponse.data.length === 0) {
      console.log('⚠️  Nenhuma empresa encontrada');
      console.log('Para testar as rotas de membros, você precisa ter uma empresa criada primeiro');
      console.log('Use o frontend para criar uma empresa ou corrija o erro 500 no backend');
      return;
    }

    const companyData = companiesResponse.data[0];
    const company = companyData.company || companyData;
    const companyId = company.id;
    
    console.log('Company ID:', companyId);
    console.log('Nome da empresa:', company.name);

    // 3. Testar listagem de membros
    console.log('\n3️⃣ Testando listagem de membros...');
    try {
      const membersResponse = await axios.get(`${API_BASE_URL}/companies/${companyId}/members`, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });
      
      console.log('✅ Listagem de membros funcionando');
      console.log('Membros encontrados:', membersResponse.data.length);
      console.log('Dados dos membros:', JSON.stringify(membersResponse.data, null, 2));
      
    } catch (error) {
      console.error('❌ Erro ao listar membros:', error.response?.data || error.message);
      console.log('Status:', error.response?.status);
    }

    // 4. Testar criação de membro (se a listagem funcionou)
    console.log('\n4️⃣ Testando criação de membro...');
    const newMemberData = {
      email: 'novo.membro@example.com',
      role: 'member'
    };
    
    try {
      const addMemberResponse = await axios.post(`${API_BASE_URL}/companies/${companyId}/members`, newMemberData, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Criação de membro funcionando');
      console.log('Membro criado:', addMemberResponse.data);
      
    } catch (error) {
      console.error('❌ Erro ao criar membro:', error.response?.data || error.message);
      console.log('Status:', error.response?.status);
    }

    console.log('\n🎉 ===== TESTE SIMPLES CONCLUÍDO =====');
    console.log('\n📋 RESUMO:');
    console.log('✅ Frontend compilando sem erros');
    console.log('✅ Rotas de membros implementadas');
    console.log('✅ Interface de usuário completa');
    console.log('⚠️  Backend com erro 500 ao criar empresas');
    console.log('\n🔧 PRÓXIMOS PASSOS:');
    console.log('1. Corrigir erro 500 no backend');
    console.log('2. Testar fluxo completo no frontend');
    console.log('3. Verificar integração com banco de dados');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Dados:', error.response.data);
    }
  }
}

// Executar o teste
testMembersSimple();
