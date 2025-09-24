const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/v1';

// Testar o fluxo completo de membros
async function testMembersFlow() {
  console.log('👥 ===== TESTANDO FLUXO DE MEMBROS =====\n');

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
    
    let companyId;
    if (companiesResponse.data.length > 0) {
      const companyData = companiesResponse.data[0];
      const company = companyData.company || companyData;
      companyId = company.id;
      console.log('Company ID:', companyId);
    } else {
      console.log('⚠️  Nenhuma empresa encontrada - criando uma...');
      
      // Criar empresa primeiro
      const createCompanyResponse = await axios.post(`${API_BASE_URL}/companies`, {
        name: 'Empresa Teste',
        cnpj: '12.345.678/0001-90',
        phone: '(11) 99999-9999',
        address: 'Rua Teste, 123',
        logoPath: '',
        letterheadPath: '',
        active: true
      }, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      companyId = createCompanyResponse.data.id;
      console.log('✅ Empresa criada:', companyId);
    }

    // 3. Listar membros atuais
    console.log('\n3️⃣ Listando membros atuais...');
    try {
      const membersResponse = await axios.get(`${API_BASE_URL}/companies/${companyId}/members`, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });
      
      console.log('Membros encontrados:', membersResponse.data.length);
      console.log('Dados dos membros:', JSON.stringify(membersResponse.data, null, 2));
    } catch (error) {
      console.log('⚠️  Erro ao listar membros:', error.response?.data || error.message);
    }

    // 4. Testar criação de usuário e adição como membro
    console.log('\n4️⃣ Testando criação de usuário e adição como membro...');
    
    const newMemberData = {
      name: 'João Silva',
      email: 'joao.silva@example.com',
      password: 'senha123',
      role: 'member'
    };
    
    console.log('Dados do novo membro:', newMemberData);
    
    try {
      // Primeiro, registrar o usuário
      console.log('Criando usuário...');
      const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
        name: newMemberData.name,
        email: newMemberData.email,
        password: newMemberData.password
      });
      
      console.log('✅ Usuário criado:', registerResponse.data);
      
      // Agora adicionar como membro
      console.log('Adicionando como membro...');
      const addMemberResponse = await axios.post(`${API_BASE_URL}/companies/${companyId}/members`, {
        email: newMemberData.email,
        role: newMemberData.role
      }, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Membro adicionado:', addMemberResponse.data);
      
    } catch (error) {
      console.error('❌ Erro ao criar usuário/membro:', error.response?.data || error.message);
    }

    // 5. Listar membros novamente
    console.log('\n5️⃣ Listando membros após adição...');
    try {
      const membersResponse = await axios.get(`${API_BASE_URL}/companies/${companyId}/members`, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });
      
      console.log('Membros encontrados:', membersResponse.data.length);
      console.log('Dados dos membros:', JSON.stringify(membersResponse.data, null, 2));
      
      if (membersResponse.data.length > 0) {
        const memberToUpdate = membersResponse.data[0];
        console.log('\n6️⃣ Testando atualização de membro...');
        console.log('Membro a ser atualizado:', memberToUpdate.id);
        
        try {
          const updateResponse = await axios.patch(`${API_BASE_URL}/companies/${companyId}/members/${memberToUpdate.id}`, {
            role: 'admin'
          }, {
            headers: {
              'Authorization': `Bearer ${access_token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('✅ Membro atualizado:', updateResponse.data);
          
        } catch (updateError) {
          console.error('❌ Erro ao atualizar membro:', updateError.response?.data || updateError.message);
        }
      }
      
    } catch (error) {
      console.log('⚠️  Erro ao listar membros:', error.response?.data || error.message);
    }

    console.log('\n🎉 ===== TESTE DE MEMBROS CONCLUÍDO =====');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Dados:', error.response.data);
    }
  }
}

// Executar o teste
testMembersFlow();
