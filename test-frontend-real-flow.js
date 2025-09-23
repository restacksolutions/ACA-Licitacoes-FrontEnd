const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/v1';

// Simular exatamente o que o frontend faz
async function testFrontendRealFlow() {
  console.log('🖥️ ===== SIMULANDO FLUXO REAL DO FRONTEND =====\n');

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

    // 2. Simular o que o frontend faz quando carrega a página
    console.log('\n2️⃣ Simulando carregamento da página (getCompanyInfo)...');
    
    try {
      const companiesResponse = await axios.get(`${API_BASE_URL}/companies`, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });

      console.log('Empresas encontradas:', companiesResponse.data.length);
      console.log('Dados das empresas:', JSON.stringify(companiesResponse.data, null, 2));
      
      if (companiesResponse.data.length > 0) {
        console.log('✅ Há empresas - testando atualização');
        await testUpdateWithRealCompany(access_token, companiesResponse.data[0]);
      } else {
        console.log('⚠️  Nenhuma empresa encontrada - testando criação');
        await testCreateWithRealData(access_token);
      }
    } catch (error) {
      console.log('⚠️  Erro ao buscar empresas - testando criação');
      await testCreateWithRealData(access_token);
    }

    console.log('\n🎉 ===== SIMULAÇÃO CONCLUÍDA =====');

  } catch (error) {
    console.error('❌ Erro durante a simulação:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Dados:', error.response.data);
    }
  }
}

// Testar atualização com empresa real
async function testUpdateWithRealCompany(accessToken, companyData) {
  console.log('\n3️⃣ Testando atualização com empresa real...');
  
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
  console.log('URL da requisição:', `${API_BASE_URL}/companies/${companyId}`);
  
  try {
    console.log('\n4️⃣ Fazendo requisição de atualização...');
    const updateResponse = await axios.patch(`${API_BASE_URL}/companies/${companyId}`, updateData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
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
    
    if (updateError.response?.status === 403) {
      console.log('\n🔍 Análise do erro 403:');
      console.log('O usuário não tem permissão para atualizar esta empresa');
      console.log('Isso indica que o CompanyGuard está funcionando, mas o usuário não tem vínculo com a empresa');
    }
  }
}

// Testar criação com dados reais
async function testCreateWithRealData(accessToken) {
  console.log('\n3️⃣ Testando criação com dados reais...');
  
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
    console.log('\n4️⃣ Fazendo requisição de criação...');
    const createResponse = await axios.post(`${API_BASE_URL}/companies`, createData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Empresa criada com sucesso!');
    console.log('Status:', createResponse.status);
    console.log('Resposta:', JSON.stringify(createResponse.data, null, 2));

  } catch (createError) {
    console.error('❌ Erro na criação:');
    console.error('Status:', createError.response?.status);
    console.error('Dados:', createError.response?.data);
    console.error('Erro completo:', createError.message);
    
    if (createError.response?.status === 500) {
      console.log('\n🔍 Análise do erro 500:');
      console.log('O backend está com erro interno');
      console.log('Verifique os logs do backend para mais detalhes');
    } else if (!createError.response) {
      console.log('\n🔍 Análise do erro:');
      console.log('Erro de conexão ou backend não está rodando');
    }
  }
}

// Executar a simulação
testFrontendRealFlow();
