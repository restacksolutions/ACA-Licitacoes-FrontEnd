const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/v1';

// Função para testar o payload com dados simulados
async function testPayloadDebug() {
  console.log('🔍 ===== TESTANDO PAYLOAD COM DADOS SIMULADOS =====\n');

  try {
    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });

    const { access_token } = loginResponse.data;
    console.log('✅ Login realizado com sucesso\n');

    // 2. Simular dados do formulário como o frontend enviaria
    console.log('2️⃣ Simulando dados do formulário...');
    
    // Dados como seriam coletados do formulário
    const formData = {
      name: 'Empresa Teste Atualizada',
      cnpj: '12.345.678/0001-90',
      legal_name: 'Empresa Teste LTDA',
      state_registration: '123456789',
      municipal_registration: '987654321',
      phone: '(11) 99999-9999',
      address: 'Rua Teste, 123 - São Paulo/SP',
      email: 'contato@empresateste.com'
    };

    console.log('Dados do formulário:', formData);

    // 3. Mapear dados como o CompanyService faria
    console.log('\n3️⃣ Mapeando dados como o CompanyService...');
    
    const updateData = {
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      logoPath: '', // Vazio por enquanto
      letterheadPath: '', // Vazio por enquanto
      active: true
    };

    console.log('Dados mapeados para API:', updateData);
    console.log('Campos mapeados:');
    console.log('  - name:', formData.name, '->', updateData.name);
    console.log('  - phone:', formData.phone, '->', updateData.phone);
    console.log('  - address:', formData.address, '->', updateData.address);
    console.log('  - logoPath: "" ->', updateData.logoPath);
    console.log('  - letterheadPath: "" ->', updateData.letterheadPath);
    console.log('  - active: true ->', updateData.active);

    // 4. Testar com ID mock
    const mockCompanyId = '38cb9c40-ae23-4a12-ba60-ec216c6d4905';
    console.log(`\n4️⃣ Testando atualização com ID: ${mockCompanyId}`);
    console.log('URL:', `${API_BASE_URL}/companies/${mockCompanyId}`);
    console.log('Payload:', JSON.stringify(updateData, null, 2));

    try {
      const updateResponse = await axios.patch(`${API_BASE_URL}/companies/${mockCompanyId}`, updateData, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('\n✅ Empresa atualizada com sucesso!');
      console.log('Resposta:', JSON.stringify(updateResponse.data, null, 2));

    } catch (updateError) {
      console.error('\n❌ Erro na atualização:');
      console.error('Status:', updateError.response?.status);
      console.error('Dados:', updateError.response?.data);
      
      if (updateError.response?.status === 400) {
        console.log('\n🔍 Análise do erro 400:');
        console.log('Possíveis problemas:');
        console.log('1. Campo obrigatório ausente');
        console.log('2. Formato de dados inválido');
        console.log('3. Validação do DTO falhando');
      } else if (updateError.response?.status === 403) {
        console.log('\n🔍 Análise do erro 403:');
        console.log('✅ O CompanyGuard está funcionando!');
        console.log('O usuário não tem permissão para esta empresa');
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
testPayloadDebug();
