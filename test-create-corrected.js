const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/v1';

// Função para testar criação com campos corretos
async function testCreateCorrected() {
  console.log('✅ ===== TESTANDO CRIAÇÃO COM CAMPOS CORRETOS =====\n');

  try {
    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });

    const { access_token } = loginResponse.data;
    console.log('✅ Login realizado com sucesso\n');

    // 2. Dados para criação com apenas campos aceitos pelo DTO
    console.log('2️⃣ Testando criação com campos corretos...');
    
    const createData = {
      name: 'Nova Empresa Teste',
      cnpj: '12.345.678/0001-90',
      phone: '(11) 99999-9999',
      address: 'Rua Nova, 123 - São Paulo/SP',
      logoPath: '',
      letterheadPath: '',
      active: true
    };
    
    console.log('Dados para criação (apenas campos aceitos):', createData);
    console.log('Campos incluídos:');
    console.log('  ✅ name:', createData.name);
    console.log('  ✅ cnpj:', createData.cnpj);
    console.log('  ✅ phone:', createData.phone);
    console.log('  ✅ address:', createData.address);
    console.log('  ✅ logoPath:', createData.logoPath);
    console.log('  ✅ letterheadPath:', createData.letterheadPath);
    console.log('  ✅ active:', createData.active);
    
    try {
      const createResponse = await axios.post(`${API_BASE_URL}/companies`, createData, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('\n✅ Empresa criada com sucesso!');
      console.log('Status:', createResponse.status);
      console.log('Resposta:', JSON.stringify(createResponse.data, null, 2));

      // 3. Testar atualização da empresa criada
      if (createResponse.data && createResponse.data.id) {
        console.log('\n3️⃣ Testando atualização da empresa criada...');
        
        const companyId = createResponse.data.id;
        const updateData = {
          name: 'Empresa Atualizada Teste',
          phone: '(11) 88888-8888',
          address: 'Rua Atualizada, 456 - São Paulo/SP',
          logoPath: '',
          letterheadPath: '',
          active: true
        };
        
        console.log('Dados para atualização:', updateData);
        console.log('URL:', `${API_BASE_URL}/companies/${companyId}`);
        
        try {
          const updateResponse = await axios.patch(`${API_BASE_URL}/companies/${companyId}`, updateData, {
            headers: {
              'Authorization': `Bearer ${access_token}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('✅ Empresa atualizada com sucesso!');
          console.log('Status:', updateResponse.status);
          console.log('Resposta:', JSON.stringify(updateResponse.data, null, 2));

        } catch (updateError) {
          console.error('❌ Erro na atualização:');
          console.error('Status:', updateError.response?.status);
          console.error('Dados:', updateError.response?.data);
        }
      }

    } catch (createError) {
      console.error('\n❌ Erro na criação:');
      console.error('Status:', createError.response?.status);
      console.error('Dados:', createError.response?.data);
      
      if (createError.response?.status === 400) {
        console.log('\n🔍 Análise do erro 400:');
        console.log('Campos rejeitados:', createError.response?.data?.message);
        console.log('Verifique se todos os campos estão no DTO correto');
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
testCreateCorrected();
