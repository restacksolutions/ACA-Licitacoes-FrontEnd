const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/v1';

// Função para criar empresa e testar atualização
async function createCompanyAndTest() {
  console.log('🏢 ===== CRIANDO EMPRESA E TESTANDO ATUALIZAÇÃO =====\n');

  try {
    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });

    const { access_token, user_id } = loginResponse.data;
    console.log('✅ Login realizado com sucesso');
    console.log(`User ID: ${user_id}\n`);

    // 2. Criar empresa
    console.log('2️⃣ Criando empresa...');
    const companyData = {
      name: 'Empresa Teste Ltda',
      cnpj: '12.345.678/0001-90',
      phone: '(11) 99999-9999',
      address: 'Rua Teste, 123 - São Paulo/SP'
    };

    let companyId;
    try {
      const createResponse = await axios.post(`${API_BASE_URL}/companies`, companyData, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Empresa criada com sucesso!');
      console.log('Resposta:', JSON.stringify(createResponse.data, null, 2));
      companyId = createResponse.data.id;

    } catch (createError) {
      console.error('❌ Erro ao criar empresa:', createError.response?.data);
      console.error('Status:', createError.response?.status);
      
      if (createError.response?.status === 500) {
        console.log('⚠️  Erro interno do servidor. Vamos tentar buscar empresas existentes...');
        
        // Tentar buscar empresas existentes
        const companiesResponse = await axios.get(`${API_BASE_URL}/companies`, {
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        });
        
        if (companiesResponse.data.length > 0) {
          const companyData = companiesResponse.data[0];
          const company = companyData.company || companyData;
          companyId = company.id;
          console.log('✅ Usando empresa existente:', company.name, 'ID:', companyId);
        } else {
          throw new Error('Não foi possível criar nem encontrar empresas');
        }
      } else {
        throw createError;
      }
    }

    if (companyId) {
      // 3. Testar atualização
      console.log('\n3️⃣ Testando atualização...');
      const updateData = {
        name: 'Empresa Atualizada Teste',
        phone: '(11) 88888-8888',
        address: 'Rua Atualizada, 456 - São Paulo/SP'
      };

      console.log('Dados para atualização:', updateData);
      console.log('URL da requisição:', `${API_BASE_URL}/companies/${companyId}`);
      console.log('');

      try {
        const updateResponse = await axios.patch(`${API_BASE_URL}/companies/${companyId}`, updateData, {
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('✅ Empresa atualizada com sucesso!');
        console.log('Resposta:', JSON.stringify(updateResponse.data, null, 2));

      } catch (updateError) {
        console.error('❌ Erro na atualização:');
        console.error('Status:', updateError.response?.status);
        console.error('Dados:', updateError.response?.data);
        
        if (updateError.response?.status === 400) {
          console.log('\n🔍 Análise do erro 400:');
          console.log('O CompanyGuard ainda não está reconhecendo o companyId da URL');
          console.log('Verifique os logs do backend para ver o que está acontecendo');
        } else if (updateError.response?.status === 403) {
          console.log('\n🔍 Análise do erro 403:');
          console.log('O usuário não tem permissão para atualizar esta empresa');
        }
      }
    }

    console.log('\n🎉 ===== TESTE CONCLUÍDO =====');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Dados:', error.response.data);
    }
  }
}

// Executar o teste
createCompanyAndTest();
