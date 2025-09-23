const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/v1';

// Função para debugar a extração do companyId
async function debugCompanyId() {
  console.log('🔍 ===== DEBUGANDO EXTRACTION DO COMPANY ID =====\n');

  try {
    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });

    const { access_token } = loginResponse.data;
    console.log('✅ Login realizado com sucesso\n');

    // 2. Simular os dados que você mencionou que estão vindo no network
    console.log('2️⃣ Simulando dados do network...');
    const mockData = [
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

    console.log('Dados simulados:', JSON.stringify(mockData, null, 2));
    console.log('');

    // 3. Simular o processamento do CompanyService
    console.log('3️⃣ Simulando processamento do CompanyService...');
    if (mockData.length > 0) {
      const companyData = mockData[0];
      console.log('CompanyData completo:', companyData);
      console.log('Tipo do companyData:', typeof companyData);
      console.log('Propriedades do companyData:', Object.keys(companyData));
      console.log('');

      const company = companyData.company || companyData;
      console.log('Company extraída:', company);
      console.log('Tipo do company:', typeof company);
      console.log('Propriedades do company:', Object.keys(company));
      console.log('');

      const companyId = company.id;
      console.log('ID da empresa extraído:', companyId);
      console.log('Tipo do ID:', typeof companyId);
      console.log('ID é string?', typeof companyId === 'string');
      console.log('ID é truthy?', !!companyId);
      console.log('');

      if (companyId) {
        console.log('✅ ID extraído com sucesso');
        console.log('Valor do ID:', `"${companyId}"`);
        console.log('Comprimento do ID:', companyId.length);
      } else {
        console.error('❌ ERRO: ID não foi extraído corretamente');
        console.log('company.id:', company.id);
        console.log('companyData.company.id:', companyData.company?.id);
      }
    }

    console.log('\n🎉 ===== DEBUG CONCLUÍDO =====');

  } catch (error) {
    console.error('❌ Erro durante o debug:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Dados:', error.response.data);
    }
  }
}

// Executar o debug
debugCompanyId();
