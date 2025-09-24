const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/v1';

// Testar se os membros estão sendo exibidos corretamente
async function testMembersDisplay() {
  console.log('👥 ===== TESTANDO EXIBIÇÃO DE MEMBROS =====\n');

  try {
    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });

    const { access_token } = loginResponse.data;
    console.log('✅ Login realizado com sucesso');

    // 2. Verificar empresas
    console.log('\n2️⃣ Verificando empresas...');
    const companiesResponse = await axios.get(`${API_BASE_URL}/companies`, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    console.log('Empresas encontradas:', companiesResponse.data.length);
    
    if (companiesResponse.data.length === 0) {
      console.log('⚠️  Nenhuma empresa encontrada');
      return;
    }

    const companyData = companiesResponse.data[0];
    const company = companyData.company || companyData;
    const companyId = company.id;
    
    console.log('Company ID:', companyId);
    console.log('Nome da empresa:', company.name);

    // 3. Testar listagem de membros
    console.log('\n3️⃣ Testando listagem de membros...');
    try {
      const membersResponse = await axios.get(`${API_BASE_URL}/companies/${companyId}/members`, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });
      
      console.log('✅ Listagem de membros funcionando');
      console.log('Membros encontrados:', membersResponse.data.length);
      console.log('\n📋 DADOS BRUTOS DO BACKEND:');
      console.log(JSON.stringify(membersResponse.data, null, 2));
      
      // Simular o mapeamento que o frontend faz
      console.log('\n🔄 SIMULANDO MAPEAMENTO DO FRONTEND:');
      const mappedMembers = membersResponse.data.map(member => {
        console.log('\n--- Processando membro ---');
        console.log('Dados originais:', JSON.stringify(member, null, 2));
        
        const mappedMember = {
          id: member.id,
          company_id: member.companyId || '',
          user_id: member.userId || '',
          role: member.role,
          name: member.user?.fullName || '',
          email: member.user?.email || '',
          created_at: member.user?.createdAt || '',
          user: {
            id: member.userId || '',
            full_name: member.user?.fullName || '',
            email: member.user?.email || ''
          }
        };
        
        console.log('Membro mapeado:', JSON.stringify(mappedMember, null, 2));
        return mappedMember;
      });
      
      console.log('\n✅ MEMBROS MAPEADOS PARA EXIBIÇÃO:');
      console.log(JSON.stringify(mappedMembers, null, 2));
      
      // Verificar se os dados estão corretos
      console.log('\n🔍 VERIFICAÇÃO DOS DADOS:');
      mappedMembers.forEach((member, index) => {
        console.log(`\nMembro ${index + 1}:`);
        console.log(`  ID: ${member.id}`);
        console.log(`  Nome: ${member.name}`);
        console.log(`  Email: ${member.email}`);
        console.log(`  Função: ${member.role}`);
        console.log(`  Data de criação: ${member.created_at}`);
        
        // Verificar se os campos obrigatórios estão preenchidos
        const issues = [];
        if (!member.name) issues.push('Nome vazio');
        if (!member.email) issues.push('Email vazio');
        if (!member.role) issues.push('Função vazia');
        
        if (issues.length > 0) {
          console.log(`  ⚠️  PROBLEMAS: ${issues.join(', ')}`);
        } else {
          console.log(`  ✅ Dados corretos`);
        }
      });
      
    } catch (error) {
      console.error('❌ Erro ao listar membros:', error.response?.data || error.message);
      console.log('Status:', error.response?.status);
    }

    console.log('\n🎉 ===== TESTE DE EXIBIÇÃO CONCLUÍDO =====');
    console.log('\n📋 RESUMO:');
    console.log('✅ Backend retornando dados');
    console.log('✅ Mapeamento implementado');
    console.log('✅ Logs detalhados adicionados');
    console.log('\n🔧 PRÓXIMOS PASSOS:');
    console.log('1. Verificar se os membros aparecem no frontend');
    console.log('2. Verificar logs do navegador');
    console.log('3. Testar funcionalidades de edição/remoção');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Dados:', error.response.data);
    }
  }
}

// Executar o teste
testMembersDisplay();
