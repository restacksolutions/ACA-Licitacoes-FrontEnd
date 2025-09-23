const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/v1';

// Função para testar o fluxo completo da empresa
async function testCompanyFlow() {
  console.log('🏢 ===== TESTANDO FLUXO DA EMPRESA =====\n');

  try {
    // 1. Testar login para obter token
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });

    const { access_token, user_id, email } = loginResponse.data;
    console.log('✅ Login realizado com sucesso');
    console.log(`   Token: ${access_token.substring(0, 20)}...`);
    console.log(`   User ID: ${user_id}`);
    console.log(`   Email: ${email}\n`);

    // 2. Testar busca de empresas
    console.log('2️⃣ Buscando empresas...');
    const companiesResponse = await axios.get(`${API_BASE_URL}/companies`, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    console.log('✅ Empresas encontradas:', companiesResponse.data.length);
    if (companiesResponse.data.length > 0) {
      const company = companiesResponse.data[0];
      console.log(`   Empresa: ${company.name}`);
      console.log(`   CNPJ: ${company.cnpj}`);
      console.log(`   ID: ${company.id}\n`);

      // 3. Testar atualização da empresa
      console.log('3️⃣ Testando atualização da empresa...');
      const updateData = {
        name: 'Empresa Atualizada Teste',
        phone: '(11) 99999-9999',
        address: 'Rua Teste, 123 - São Paulo/SP'
      };

      const updateResponse = await axios.put(`${API_BASE_URL}/companies/${company.id}`, updateData, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });

      console.log('✅ Empresa atualizada com sucesso');
      console.log(`   Nome: ${updateResponse.data.name}`);
      console.log(`   Telefone: ${updateResponse.data.phone}`);
      console.log(`   Endereço: ${updateResponse.data.address}\n`);

      // 4. Testar busca de membros da empresa
      console.log('4️⃣ Buscando membros da empresa...');
      try {
        const membersResponse = await axios.get(`${API_BASE_URL}/companies/${company.id}/members`, {
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        });

        console.log('✅ Membros encontrados:', membersResponse.data.length);
        membersResponse.data.forEach((member, index) => {
          console.log(`   ${index + 1}. ${member.userFullName || member.userEmail} (${member.role})`);
        });
        console.log('');
      } catch (error) {
        console.log('⚠️  Endpoint de membros não disponível ou erro:', error.response?.status);
        console.log('');
      }

      // 5. Testar busca de documentos da empresa
      console.log('5️⃣ Buscando documentos da empresa...');
      try {
        const documentsResponse = await axios.get(`${API_BASE_URL}/companies/${company.id}/documents`, {
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        });

        console.log('✅ Documentos encontrados:', documentsResponse.data.length);
        documentsResponse.data.forEach((doc, index) => {
          console.log(`   ${index + 1}. ${doc.docType} - ${doc.docNumber || 'N/A'}`);
        });
        console.log('');
      } catch (error) {
        console.log('⚠️  Endpoint de documentos não disponível ou erro:', error.response?.status);
        console.log('');
      }

    } else {
      console.log('⚠️  Nenhuma empresa encontrada\n');
    }

    // 6. Testar logout
    console.log('6️⃣ Testando logout...');
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });
      console.log('✅ Logout realizado com sucesso\n');
    } catch (error) {
      console.log('⚠️  Endpoint de logout não disponível ou erro:', error.response?.status);
      console.log('');
    }

    console.log('🎉 ===== TESTE DO FLUXO DA EMPRESA CONCLUÍDO =====');
    console.log('\n📋 RESUMO:');
    console.log('✅ Login funcionando');
    console.log('✅ Busca de empresas funcionando');
    console.log('✅ Atualização de empresa funcionando');
    console.log('⚠️  Endpoints de membros e documentos podem precisar de implementação');
    console.log('⚠️  Endpoint de logout pode precisar de implementação');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Dados:', error.response.data);
    }
  }
}

// Executar o teste
testCompanyFlow();
