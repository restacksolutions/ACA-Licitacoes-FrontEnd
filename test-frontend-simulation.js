const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/v1';

// Simular exatamente o que o frontend faz
async function testFrontendSimulation() {
  console.log('🖥️ ===== SIMULANDO FRONTEND REAL =====\n');

  try {
    // 1. Login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });

    const { access_token, user_id } = loginResponse.data;
    console.log('✅ Login realizado');
    console.log('User ID:', user_id);

    // 2. Buscar empresas (como o frontend faria)
    console.log('\n2️⃣ Buscando empresas...');
    const companiesResponse = await axios.get(`${API_BASE_URL}/companies`, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    console.log('Empresas encontradas:', companiesResponse.data.length);
    
    if (companiesResponse.data.length > 0) {
      const companyData = companiesResponse.data[0];
      console.log('Dados brutos da empresa:', JSON.stringify(companyData, null, 2));
      
      // Extrair empresa como o CompanyService faz
      const company = companyData.company || companyData;
      console.log('Empresa extraída:', JSON.stringify(company, null, 2));
      
      const companyId = company.id;
      console.log('Company ID extraído:', companyId);
      
      if (companyId) {
        // 3. Simular dados do formulário
        console.log('\n3️⃣ Simulando dados do formulário...');
        const formData = {
          name: company.name || 'Nome Atualizado',
          phone: company.phone || '(11) 99999-9999',
          address: company.address || 'Endereço Atualizado',
          logo_path: company.logoPath || '',
          letterhead_path: company.letterheadPath || '',
          active: company.active !== undefined ? company.active : true
        };
        
        console.log('Dados do formulário:', formData);
        
        // 4. Mapear como o CompanyService faz
        console.log('\n4️⃣ Mapeando dados...');
        const updateData = {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          logoPath: formData.logo_path,
          letterheadPath: formData.letterhead_path,
          active: formData.active
        };
        
        console.log('Dados para API:', updateData);
        
        // 5. Fazer a requisição
        console.log('\n5️⃣ Fazendo requisição de atualização...');
        console.log('URL:', `${API_BASE_URL}/companies/${companyId}`);
        
        try {
          const updateResponse = await axios.patch(`${API_BASE_URL}/companies/${companyId}`, updateData, {
            headers: {
              'Authorization': `Bearer ${access_token}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('✅ Atualização bem-sucedida!');
          console.log('Resposta:', JSON.stringify(updateResponse.data, null, 2));

        } catch (updateError) {
          console.error('❌ Erro na atualização:');
          console.error('Status:', updateError.response?.status);
          console.error('Dados:', updateError.response?.data);
          
          if (updateError.response?.status === 400) {
            console.log('\n🔍 Erro 400 - Problema de validação:');
            console.log('Mensagem:', updateError.response?.data?.message);
          } else if (updateError.response?.status === 403) {
            console.log('\n🔍 Erro 403 - Problema de permissão:');
            console.log('O usuário não tem permissão para esta empresa');
          }
        }
      } else {
        console.log('❌ Company ID não encontrado');
      }
    } else {
      console.log('⚠️  Nenhuma empresa encontrada');
      console.log('Para testar, você precisa ter uma empresa cadastrada');
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
testFrontendSimulation();
