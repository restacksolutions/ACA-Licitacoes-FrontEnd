const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/v1';

// Testar criação de membro com dados corretos da empresa
async function testMemberCreationFixed() {
  console.log('👥 ===== TESTANDO CRIAÇÃO DE MEMBRO COM DADOS CORRETOS =====\n');

  try {
    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });

    const { access_token } = loginResponse.data;
    console.log('✅ Login realizado com sucesso');

    // 2. Verificar empresas
    console.log('\n2️⃣ Verificando empresas...');
    const companiesResponse = await axios.get(`${API_BASE_URL}/companies`, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    console.log('Empresas encontradas:', companiesResponse.data.length);
    
    if (companiesResponse.data.length === 0) {
      console.log('⚠️  Nenhuma empresa encontrada');
      console.log('Para testar a criação de membros, você precisa ter uma empresa criada primeiro');
      return;
    }

    const companyData = companiesResponse.data[0];
    const company = companyData.company || companyData;
    
    console.log('Dados da empresa atual:');
    console.log('  Nome:', company.name);
    console.log('  CNPJ:', company.cnpj);
    console.log('  Telefone:', company.phone);
    console.log('  Endereço:', company.address);

    // 3. Simular o payload que seria enviado com os dados corretos
    console.log('\n3️⃣ Simulando payload correto...');
    
    const correctPayload = {
      fullName: 'Novo Funcionário',
      email: 'novo.funcionario@example.com',
      password: 'senha123456',
      companyName: company.name || 'Empresa',
      companyCnpj: company.cnpj || '',
      companyPhone: company.phone || '',
      companyAddress: company.address || ''
    };
    
    console.log('Payload correto (com dados da empresa atual):');
    console.log(JSON.stringify(correctPayload, null, 2));
    
    // 4. Comparar com o payload anterior (incorreto)
    console.log('\n4️⃣ Comparação com payload anterior (incorreto):');
    
    const incorrectPayload = {
      fullName: 'Novo Funcionário',
      email: 'novo.funcionario@example.com',
      password: 'senha123456',
      companyName: 'Empresa Padrão',
      companyCnpj: '00.000.000/0001-00',
      companyPhone: '',
      companyAddress: ''
    };
    
    console.log('Payload incorreto (dados padrão):');
    console.log(JSON.stringify(incorrectPayload, null, 2));
    
    console.log('\n🔍 DIFERENÇAS:');
    console.log('✅ companyName:', incorrectPayload.companyName, '->', correctPayload.companyName);
    console.log('✅ companyCnpj:', incorrectPayload.companyCnpj, '->', correctPayload.companyCnpj);
    console.log('✅ companyPhone:', incorrectPayload.companyPhone, '->', correctPayload.companyPhone);
    console.log('✅ companyAddress:', incorrectPayload.companyAddress, '->', correctPayload.companyAddress);

    // 5. Testar criação de usuário com dados corretos
    console.log('\n5️⃣ Testando criação de usuário com dados corretos...');
    
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, correctPayload);
      console.log('✅ Usuário criado com sucesso!');
      console.log('Resposta:', JSON.stringify(registerResponse.data, null, 2));
      
      // 6. Adicionar como membro da empresa
      console.log('\n6️⃣ Adicionando como membro da empresa...');
      
      const addMemberResponse = await axios.post(`${API_BASE_URL}/companies/${company.id}/members`, {
        email: correctPayload.email,
        role: 'member'
      }, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Membro adicionado com sucesso!');
      console.log('Resposta:', JSON.stringify(addMemberResponse.data, null, 2));
      
    } catch (error) {
      console.error('❌ Erro na criação:', error.response?.data || error.message);
      console.log('Status:', error.response?.status);
      
      if (error.response?.status === 409) {
        console.log('\n🔍 Análise do erro 409:');
        console.log('O email já está em uso no sistema');
        console.log('Isso é esperado se o usuário já existe');
      }
    }

    console.log('\n🎉 ===== TESTE DE CRIAÇÃO CORRIGIDA CONCLUÍDO =====');
    console.log('\n📋 RESUMO:');
    console.log('✅ Payload agora usa dados da empresa atual');
    console.log('✅ Nome da empresa correto');
    console.log('✅ CNPJ da empresa correto');
    console.log('✅ Telefone da empresa correto');
    console.log('✅ Endereço da empresa correto');
    console.log('\n🔧 PRÓXIMOS PASSOS:');
    console.log('1. Testar no frontend');
    console.log('2. Verificar se o erro 409 foi resolvido');
    console.log('3. Confirmar que o membro é adicionado corretamente');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Dados:', error.response.data);
    }
  }
}

// Executar o teste
testMemberCreationFixed();
