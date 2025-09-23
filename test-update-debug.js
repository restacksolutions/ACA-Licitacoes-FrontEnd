const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/v1';

// Função para testar atualização com logs detalhados
async function testUpdateDebug() {
  console.log('🔍 ===== TESTANDO ATUALIZAÇÃO COM LOGS DETALHADOS =====\n');

  try {
    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });

    const { access_token, user_id } = loginResponse.data;
    console.log('✅ Login realizado com sucesso');
    console.log('User ID:', user_id);

    // 2. Buscar empresas existentes
    console.log('\n2️⃣ Buscando empresas existentes...');
    const companiesResponse = await axios.get(`${API_BASE_URL}/companies`, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    console.log('Empresas encontradas:', companiesResponse.data.length);
    console.log('Dados das empresas:', JSON.stringify(companiesResponse.data, null, 2));

    if (companiesResponse.data.length > 0) {
      const companyData = companiesResponse.data[0];
      const company = companyData.company || companyData;
      const companyId = company.id;
      
      console.log('\n3️⃣ Testando atualização da empresa existente...');
      console.log('Company ID:', companyId);
      console.log('Dados atuais da empresa:', company);
      
      // Dados para atualização
      const updateData = {
        name: 'Empresa Atualizada Teste',
        phone: '(11) 99999-9999',
        address: 'Rua Atualizada, 456 - São Paulo/SP',
        logoPath: '',
        letterheadPath: '',
        active: true
      };
      
      console.log('Dados para atualização:', updateData);
      console.log('URL da requisição:', `${API_BASE_URL}/companies/${companyId}`);
      
      try {
        console.log('\n4️⃣ Fazendo requisição de atualização...');
        const updateResponse = await axios.patch(`${API_BASE_URL}/companies/${companyId}`, updateData, {
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('✅ Empresa atualizada com sucesso!');
        console.log('Status:', updateResponse.status);
        console.log('Resposta:', JSON.stringify(updateResponse.data, null, 2));

        // 5. Verificar se a atualização foi persistida
        console.log('\n5️⃣ Verificando se a atualização foi persistida...');
        const verifyResponse = await axios.get(`${API_BASE_URL}/companies`, {
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        });

        console.log('Empresas após atualização:', verifyResponse.data.length);
        if (verifyResponse.data.length > 0) {
          const updatedCompany = verifyResponse.data[0].company || verifyResponse.data[0];
          console.log('Dados da empresa após atualização:', updatedCompany);
          
          // Verificar se os dados foram realmente atualizados
          console.log('\n6️⃣ Verificando se os dados foram realmente atualizados...');
          console.log('Nome atualizado:', updatedCompany.name === updateData.name ? '✅' : '❌');
          console.log('Telefone atualizado:', updatedCompany.phone === updateData.phone ? '✅' : '❌');
          console.log('Endereço atualizado:', updatedCompany.address === updateData.address ? '✅' : '❌');
        }

      } catch (updateError) {
        console.error('❌ Erro na atualização:');
        console.error('Status:', updateError.response?.status);
        console.error('Dados:', updateError.response?.data);
        
        if (updateError.response?.status === 403) {
          console.log('\n🔍 Análise do erro 403:');
          console.log('O usuário não tem permissão para atualizar esta empresa');
        } else if (updateError.response?.status === 404) {
          console.log('\n🔍 Análise do erro 404:');
          console.log('A empresa não foi encontrada');
        } else if (updateError.response?.status === 500) {
          console.log('\n🔍 Análise do erro 500:');
          console.log('Erro interno do servidor');
        }
      }
    } else {
      console.log('⚠️  Nenhuma empresa encontrada para atualizar');
      console.log('Para testar a atualização, você precisa ter uma empresa cadastrada');
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
testUpdateDebug();
