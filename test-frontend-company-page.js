const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/v1';

// Simular exatamente o que acontece quando o usuário acessa a página de empresa
async function testFrontendCompanyPage() {
  console.log('🖥️ ===== SIMULANDO PÁGINA DE EMPRESA DO FRONTEND =====\n');

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

    // 2. Simular getCompanyInfo() - que chama getCompanies()
    console.log('\n2️⃣ Simulando getCompanyInfo()...');
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
      const userRole = companyData.role;
      
      console.log('\n3️⃣ Empresa encontrada:');
      console.log('Company ID:', companyId);
      console.log('User Role:', userRole);
      console.log('Company Data:', company);
      
      // 4. Simular o que acontece quando o usuário clica em "Editar"
      console.log('\n4️⃣ Simulando clique em "Editar"...');
      
      // Simular initializeCompanyForm()
      const companyForm = {
        name: company.name || '',
        cnpj: company.cnpj || '',
        legal_name: company.legal_name || '',
        state_registration: company.state_registration || '',
        municipal_registration: company.municipal_registration || '',
        phone: company.phone || '',
        address: company.address || '',
        email: company.email || ''
      };
      
      console.log('Formulário inicializado:', companyForm);
      
      // 5. Simular o que acontece quando o usuário preenche os campos
      console.log('\n5️⃣ Simulando preenchimento dos campos...');
      
      // Simular onInputChange para cada campo
      const fields = ['name', 'cnpj', 'phone', 'address'];
      const values = ['RESTACK', '12.345.678/0001-90', '41992021603', 'Rua Professor Pedro Viriato Parigot de Souza'];
      
      fields.forEach((field, index) => {
        console.log(`Simulando input para ${field}: ${values[index]}`);
        companyForm[field] = values[index];
        console.log(`Formulário após ${field}:`, companyForm);
      });
      
      console.log('\nFormulário final:', companyForm);
      
      // 6. Simular o que acontece quando o usuário clica em "Salvar"
      console.log('\n6️⃣ Simulando clique em "Salvar"...');
      
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
      console.log('\n7️⃣ Simulando updateCompanyInfo()...');
      
      // Simular getCompanies() novamente
      const companiesResponse2 = await axios.get(`${API_BASE_URL}/companies`, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });
      
      console.log('Empresas encontradas (novamente):', companiesResponse2.data.length);
      
      if (companiesResponse2.data.length > 0) {
        const companyData2 = companiesResponse2.data[0];
        const company2 = companyData2.company || companyData2;
        const companyId2 = company2.id;
        const userRole2 = companyData2.role;
        
        console.log('Company ID (novamente):', companyId2);
        console.log('User Role (novamente):', userRole2);
        
        // Mapear dados como o CompanyService faz
        const updateData = {
          name: companyForm.name,
          phone: companyForm.phone,
          address: companyForm.address,
          logoPath: companyForm.logo_path || '',
          letterheadPath: companyForm.letterhead_path || '',
          active: companyForm.active !== undefined ? companyForm.active : true
        };
        
        console.log('Dados mapeados para API:', updateData);
        console.log('URL da requisição:', `${API_BASE_URL}/companies/${companyId2}`);
        
        // Fazer a requisição real
        try {
          console.log('\n8️⃣ Fazendo requisição de atualização...');
          const updateResponse = await axios.patch(`${API_BASE_URL}/companies/${companyId2}`, updateData, {
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
            console.log('Isso indica que o CompanyGuard está funcionando, mas o usuário não tem vínculo com a empresa');
            console.log('Verifique se o usuário tem uma membership válida com esta empresa');
          }
        }
      }
    } else {
      console.log('⚠️  Nenhuma empresa encontrada para o usuário');
      console.log('Para testar a atualização, você precisa ter uma empresa cadastrada e associada ao usuário');
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
testFrontendCompanyPage();
