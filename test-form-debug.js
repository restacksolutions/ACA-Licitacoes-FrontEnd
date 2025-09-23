const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/v1';

// Simular o comportamento do frontend
async function testFormDebug() {
  console.log('🔍 ===== TESTANDO COMPORTAMENTO DO FORMULÁRIO =====\n');

  try {
    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });

    const { access_token } = loginResponse.data;
    console.log('✅ Login realizado com sucesso\n');

    // 2. Simular carregamento de empresa (como o frontend faz)
    console.log('2️⃣ Simulando carregamento de empresa...');
    
    try {
      const companiesResponse = await axios.get(`${API_BASE_URL}/companies`, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });

      console.log('Empresas encontradas:', companiesResponse.data.length);
      
      if (companiesResponse.data.length > 0) {
        console.log('✅ Empresa encontrada - testando atualização');
        await testUpdateWithRealData(access_token, companiesResponse.data[0]);
      } else {
        console.log('⚠️  Nenhuma empresa encontrada - testando criação');
        await testCreateWithFormData(access_token);
      }
    } catch (error) {
      console.log('⚠️  Erro ao buscar empresas - testando criação');
      await testCreateWithFormData(access_token);
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

// Testar atualização com dados reais
async function testUpdateWithRealData(accessToken, companyData) {
  console.log('\n3️⃣ Testando atualização com dados reais...');
  
  const company = companyData.company || companyData;
  const companyId = company.id;
  
  console.log('Company ID:', companyId);
  console.log('Dados da empresa:', company);
  
  // Simular dados do formulário como o usuário preencheria
  const formData = {
    name: 'RESTACK', // Como o usuário preencheu
    cnpj: '12.345.678/0001-90', // Como o usuário preencheu
    phone: '(11) 99999-9999', // Como o usuário preencheu
    address: 'Rua Teste, 123 - São Paulo/SP', // Como o usuário preencheu
    logo_path: '',
    letterhead_path: '',
    active: true
  };
  
  console.log('Dados do formulário (como preenchido pelo usuário):', formData);
  
  // Mapear como o CompanyService faz
  const updateData = {
    name: formData.name,
    phone: formData.phone,
    address: formData.address,
    logoPath: formData.logo_path,
    letterheadPath: formData.letterhead_path,
    active: formData.active
  };
  
  console.log('Dados mapeados para API:', updateData);
  
  try {
    const updateResponse = await axios.patch(`${API_BASE_URL}/companies/${companyId}`, updateData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Empresa atualizada com sucesso!');
    console.log('Resposta:', JSON.stringify(updateResponse.data, null, 2));

  } catch (updateError) {
    console.error('❌ Erro na atualização:');
    console.error('Status:', updateError.response?.status);
    console.error('Dados:', updateError.response?.data);
  }
}

// Testar criação com dados do formulário
async function testCreateWithFormData(accessToken) {
  console.log('\n3️⃣ Testando criação com dados do formulário...');
  
  // Simular dados do formulário como o usuário preencheria
  const formData = {
    name: 'RESTACK', // Como o usuário preencheu
    cnpj: '12.345.678/0001-90', // Como o usuário preencheu
    phone: '(11) 99999-9999', // Como o usuário preencheu
    address: 'Rua Teste, 123 - São Paulo/SP', // Como o usuário preencheu
    logo_path: '',
    letterhead_path: '',
    active: true
  };
  
  console.log('Dados do formulário (como preenchido pelo usuário):', formData);
  
  // Mapear como o CompanyService faz
  const createData = {
    name: formData.name,
    cnpj: formData.cnpj,
    phone: formData.phone,
    address: formData.address,
    logoPath: formData.logo_path,
    letterheadPath: formData.letterhead_path,
    active: formData.active
  };
  
  console.log('Dados mapeados para API:', createData);
  
  try {
    const createResponse = await axios.post(`${API_BASE_URL}/companies`, createData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Empresa criada com sucesso!');
    console.log('Resposta:', JSON.stringify(createResponse.data, null, 2));

  } catch (createError) {
    console.error('❌ Erro na criação:');
    console.error('Status:', createError.response?.status);
    console.error('Dados:', createError.response?.data);
  }
}

// Executar o teste
testFormDebug();
