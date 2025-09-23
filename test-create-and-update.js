const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/v1';

// Função para criar empresa e testar atualização
async function testCreateAndUpdate() {
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
    console.log('User ID:', user_id);

    // 2. Criar uma empresa
    console.log('\n2️⃣ Criando empresa...');
    const createData = {
      name: 'Empresa Teste Inicial',
      cnpj: '12.345.678/0001-90',
      phone: '(11) 11111-1111',
      address: 'Rua Inicial, 123 - São Paulo/SP',
      logoPath: '',
      letterheadPath: '',
      active: true
    };
    
    console.log('Dados para criação:', createData);
    
    let companyId;
    try {
      const createResponse = await axios.post(`${API_BASE_URL}/companies`, createData, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Empresa criada com sucesso!');
      console.log('Status:', createResponse.status);
      console.log('Resposta:', JSON.stringify(createResponse.data, null, 2));
      
      companyId = createResponse.data.id;
      console.log('Company ID:', companyId);

    } catch (createError) {
      console.error('❌ Erro na criação:');
      console.error('Status:', createError.response?.status);
      console.error('Dados:', createError.response?.data);
      
      if (createError.response?.status === 500) {
        console.log('\n🔍 Erro 500 na criação - continuando com ID mock para testar atualização...');
        companyId = 'mock-company-id';
      } else {
        return;
      }
    }

    // 3. Buscar empresas para verificar se foi criada
    console.log('\n3️⃣ Verificando empresas criadas...');
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
      companyId = company.id;
      
      console.log('Company ID real:', companyId);
      console.log('Dados da empresa:', company);
    }

    // 4. Testar atualização
    if (companyId) {
      console.log('\n4️⃣ Testando atualização da empresa...');
      
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
        console.log('\n5️⃣ Fazendo requisição de atualização...');
        const updateResponse = await axios.patch(`${API_BASE_URL}/companies/${companyId}`, updateData, {
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('✅ Empresa atualizada com sucesso!');
        console.log('Status:', updateResponse.status);
        console.log('Resposta:', JSON.stringify(updateResponse.data, null, 2));

        // 6. Verificar se a atualização foi persistida
        console.log('\n6️⃣ Verificando se a atualização foi persistida...');
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
          console.log('\n7️⃣ Verificando se os dados foram realmente atualizados...');
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
testCreateAndUpdate();
