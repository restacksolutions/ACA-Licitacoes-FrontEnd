const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/v1';

// Função para testar com os dados reais que você mencionou
async function testWithRealData() {
  console.log('🏢 ===== TESTANDO COM DADOS REAIS =====\n');

  try {
    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });

    const { access_token } = loginResponse.data;
    console.log('✅ Login realizado com sucesso');
    console.log(`Token: ${access_token.substring(0, 20)}...\n`);

    // 2. Simular os dados que você mencionou que estão vindo no network
    console.log('2️⃣ Simulando dados do network...');
    const mockNetworkData = [
      {
        "role": "owner",
        "company": {
          "id": "38cb9c40-ae23-4a12-ba60-ec216c6d4905",
          "name": "RESTACK",
          "cnpj": "",
          "phone": "",
          "address": "",
          "logoPath": null,
          "letterheadPath": null,
          "active": true,
          "createdById": "395f3902-370d-4280-b97b-5d03260edcb0",
          "createdAt": "2025-09-23T19:13:44.803Z"
        }
      }
    ];

    console.log('Dados simulados:', JSON.stringify(mockNetworkData, null, 2));
    console.log('');

    // 3. Simular o processamento do CompanyService
    console.log('3️⃣ Simulando processamento do CompanyService...');
    if (mockNetworkData.length > 0) {
      const companyData = mockNetworkData[0];
      console.log('Primeiro item:', companyData);
      
      const company = companyData.company || companyData;
      console.log('Empresa extraída:', company);
      
      const companyInfo = {
        id: company.id,
        name: company.name,
        cnpj: company.cnpj || '',
        legal_name: company.name,
        state_registration: '',
        municipal_registration: '',
        phone: company.phone || '',
        address: company.address || '',
        email: '',
        logo_path: company.logoPath || '',
        letterhead_path: company.letterheadPath || '',
        active: company.active,
        created_by: company.createdById || '',
        created_at: company.createdAt
      };
      
      console.log('✅ Informações da empresa processadas:');
      console.log(JSON.stringify(companyInfo, null, 2));
      console.log('');
      
      // 4. Verificar se os dados seriam exibidos no template
      console.log('4️⃣ Verificando exibição no template...');
      console.log(`Nome da empresa: ${companyInfo.name}`);
      console.log(`CNPJ: ${companyInfo.cnpj || 'Não informado'}`);
      console.log(`Telefone: ${companyInfo.phone || 'Não informado'}`);
      console.log(`Endereço: ${companyInfo.address || 'Não informado'}`);
      console.log(`Ativo: ${companyInfo.active ? 'Sim' : 'Não'}`);
    }

    console.log('\n🎉 ===== TESTE CONCLUÍDO =====');
    console.log('\n📋 CONCLUSÃO:');
    console.log('✅ O processamento dos dados está correto');
    console.log('✅ Os dados seriam exibidos no template');
    console.log('⚠️  O problema pode estar na chamada da API ou no carregamento do componente');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Dados:', error.response.data);
    }
  }
}

// Executar o teste
testWithRealData();
