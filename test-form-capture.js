const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/v1';

// Simular exatamente o que o usuário está fazendo no frontend
async function testFormCapture() {
  console.log('📝 ===== TESTANDO CAPTURA DE DADOS DO FORMULÁRIO =====\n');

  try {
    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });

    const { access_token } = loginResponse.data;
    console.log('✅ Login realizado com sucesso');

    // 2. Simular carregamento da página (getCompanyInfo)
    console.log('\n2️⃣ Simulando carregamento da página...');
    const companiesResponse = await axios.get(`${API_BASE_URL}/companies`, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    console.log('Empresas encontradas:', companiesResponse.data.length);
    
    let companyId;
    if (companiesResponse.data.length > 0) {
      const companyData = companiesResponse.data[0];
      const company = companyData.company || companyData;
      companyId = company.id;
      console.log('Company ID encontrado:', companyId);
    } else {
      // Simular empresa vazia como o frontend faz
      console.log('Nenhuma empresa encontrada - simulando empresa vazia');
      companyId = 'mock-company-id';
    }

    // 3. Simular inicialização do formulário
    console.log('\n3️⃣ Simulando inicialização do formulário...');
    const companyForm = {
      name: '',
      cnpj: '',
      legal_name: '',
      state_registration: '',
      municipal_registration: '',
      phone: '',
      address: '',
      email: ''
    };
    
    console.log('Formulário inicializado:', companyForm);

    // 4. Simular preenchimento dos campos (como o usuário faria)
    console.log('\n4️⃣ Simulando preenchimento dos campos...');
    
    const fieldsToFill = [
      { key: 'name', value: 'RESTACK' },
      { key: 'cnpj', value: '12.345.678/0001-90' },
      { key: 'phone', value: '41992021603' },
      { key: 'address', value: 'Rua Professor Pedro Viriato Parigot de Souza' }
    ];
    
    fieldsToFill.forEach(field => {
      console.log(`\nPreenchendo campo ${field.key}: ${field.value}`);
      console.log(`Valor anterior: ${companyForm[field.key]}`);
      
      companyForm[field.key] = field.value;
      
      console.log(`Valor posterior: ${companyForm[field.key]}`);
      console.log(`Formulário atual:`, companyForm);
    });

    console.log('\nFormulário final preenchido:', companyForm);

    // 5. Simular validação
    console.log('\n5️⃣ Simulando validação...');
    if (!companyForm.name?.trim()) {
      console.log('❌ Validação falhou: Nome da empresa é obrigatório');
      return;
    }
    if (!companyForm.cnpj?.trim()) {
      console.log('❌ Validação falhou: CNPJ é obrigatório');
      return;
    }
    console.log('✅ Validação passou');

    // 6. Simular mapeamento dos dados para API
    console.log('\n6️⃣ Simulando mapeamento para API...');
    const updateData = {
      name: companyForm.name,
      phone: companyForm.phone,
      address: companyForm.address,
      logoPath: companyForm.logo_path || '',
      letterheadPath: companyForm.letterhead_path || '',
      active: companyForm.active !== undefined ? companyForm.active : true
    };
    
    console.log('Dados mapeados para API:', updateData);
    console.log('Campos mapeados:');
    console.log('  - name:', companyForm.name, '->', updateData.name);
    console.log('  - phone:', companyForm.phone, '->', updateData.phone);
    console.log('  - address:', companyForm.address, '->', updateData.address);

    // 7. Fazer requisição de atualização
    console.log('\n7️⃣ Fazendo requisição de atualização...');
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
      
      if (updateError.response?.status === 403) {
        console.log('\n🔍 Análise do erro 403:');
        console.log('O usuário não tem permissão para atualizar esta empresa');
        console.log('Isso é esperado se a empresa não pertence ao usuário');
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
testFormCapture();
