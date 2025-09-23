const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/v1';

// Simular exatamente o que o frontend está fazendo
async function testFrontendReal() {
  console.log('🖥️ ===== SIMULANDO FRONTEND REAL =====\n');

  try {
    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });

    const { access_token } = loginResponse.data;
    console.log('✅ Login realizado com sucesso\n');

    // 2. Simular o que o frontend faz quando carrega a página
    console.log('2️⃣ Simulando carregamento da página...');
    
    // Simular getCompanyInfo() - que retorna empresa vazia quando não há empresas
    console.log('Simulando getCompanyInfo()...');
    const emptyCompany = {
      id: '',
      name: '',
      cnpj: '',
      legal_name: '',
      state_registration: '',
      municipal_registration: '',
      phone: '',
      address: '',
      email: '',
      logo_path: '',
      letterhead_path: '',
      active: true,
      created_by: '',
      created_at: null
    };
    
    console.log('Empresa vazia criada:', emptyCompany);
    
    // 3. Simular o que acontece quando o usuário clica em "Editar"
    console.log('\n3️⃣ Simulando clique em "Editar"...');
    
    // Simular initializeCompanyForm()
    const companyForm = {
      name: emptyCompany.name || '',
      cnpj: emptyCompany.cnpj || '',
      legal_name: emptyCompany.legal_name || '',
      state_registration: emptyCompany.state_registration || '',
      municipal_registration: emptyCompany.municipal_registration || '',
      phone: emptyCompany.phone || '',
      address: emptyCompany.address || '',
      email: emptyCompany.email || ''
    };
    
    console.log('Formulário inicializado:', companyForm);
    
    // 4. Simular o que acontece quando o usuário preenche os campos
    console.log('\n4️⃣ Simulando preenchimento dos campos...');
    
    // Simular onInputChange para cada campo
    const fields = ['name', 'cnpj', 'phone', 'address'];
    const values = ['RESTACK', '12.345.678/0001-90', '(11) 99999-9999', 'Rua Teste, 123 - São Paulo/SP'];
    
    fields.forEach((field, index) => {
      console.log(`Simulando input para ${field}: ${values[index]}`);
      companyForm[field] = values[index];
      console.log(`Formulário após ${field}:`, companyForm);
    });
    
    console.log('\nFormulário final:', companyForm);
    
    // 5. Simular o que acontece quando o usuário clica em "Salvar"
    console.log('\n5️⃣ Simulando clique em "Salvar"...');
    
    // Simular validateCompanyForm()
    console.log('Validando formulário...');
    if (!companyForm.name?.trim()) {
      console.log('❌ Validação falhou: Nome da empresa é obrigatório');
      return;
    }
    if (!companyForm.cnpj?.trim()) {
      console.log('❌ Validação falhou: CNPJ é obrigatório');
      return;
    }
    console.log('✅ Validação passou');
    
    // Simular updateCompanyInfo()
    console.log('\n6️⃣ Simulando updateCompanyInfo()...');
    
    // Simular getCompanies() - retorna array vazio
    const companies = [];
    console.log('Empresas encontradas:', companies.length);
    
    if (companies.length > 0) {
      console.log('Há empresas - fazendo atualização');
      // Código de atualização...
    } else {
      console.log('Nenhuma empresa encontrada - criando nova empresa');
      
      // Simular createData
      const createData = {
        name: companyForm.name,
        cnpj: companyForm.cnpj,
        phone: companyForm.phone,
        address: companyForm.address,
        logoPath: companyForm.logo_path || '',
        letterheadPath: companyForm.letterhead_path || '',
        active: companyForm.active !== undefined ? companyForm.active : true
      };
      
      console.log('Dados para criação:', createData);
      
      // Fazer a requisição real
      try {
        const createResponse = await axios.post(`${API_BASE_URL}/companies`, createData, {
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('✅ Empresa criada com sucesso!');
        console.log('Resposta:', JSON.stringify(createResponse.data, null, 2));

      } catch (createError) {
        console.error('❌ Erro na criação:');
        console.error('Status:', createError.response?.status);
        console.error('Dados:', createError.response?.data);
        
        if (createError.response?.status === 500) {
          console.log('\n🔍 Análise do erro 500:');
          console.log('O backend está com erro interno');
          console.log('Verifique os logs do backend para mais detalhes');
        }
      }
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

// Executar a simulação
testFrontendReal();
