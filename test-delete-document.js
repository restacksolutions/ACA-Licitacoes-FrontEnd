// Script de teste para verificar a funcionalidade de exclusão de documentos
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_BASE_URL = 'http://localhost:3000/v1';

async function testDeleteDocument() {
  console.log('🧪 [Test] Iniciando teste de exclusão de documento...');
  
  try {
    // 1. Fazer login para obter token
    console.log('🔐 [Test] Fazendo login...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'password123'
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Erro no login: ${loginResponse.status}`);
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.access_token;
    console.log('✅ [Test] Login realizado com sucesso');
    
    // 2. Obter empresas
    console.log('🏢 [Test] Obtendo empresas...');
    const companiesResponse = await fetch(`${API_BASE_URL}/companies`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!companiesResponse.ok) {
      throw new Error(`Erro ao obter empresas: ${companiesResponse.status}`);
    }
    
    const companies = await companiesResponse.json();
    console.log('📊 [Test] Resposta das empresas:', JSON.stringify(companies, null, 2));
    
    if (companies.length === 0) {
      console.log('⚠️ [Test] Nenhuma empresa encontrada, tentando criar uma...');
      
      // Tentar criar empresa simples
      const companyData = {
        name: 'Empresa Teste',
        cnpj: '12.345.678/0001-90'
      };
      
      const createResponse = await fetch(`${API_BASE_URL}/companies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(companyData)
      });
      
      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.log('❌ [Test] Erro ao criar empresa:', errorText);
        throw new Error('Não foi possível criar empresa');
      }
      
      // Tentar obter empresas novamente
      const companiesResponse2 = await fetch(`${API_BASE_URL}/companies`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const companies2 = await companiesResponse2.json();
      if (companies2.length === 0) {
        throw new Error('Ainda não há empresas após criação');
      }
      
      const companyId = companies2[0].id || companies2[0].company?.id;
      console.log(`✅ [Test] Empresa criada/encontrada: ${companyId}`);
    } else {
      const companyId = companies[0].id || companies[0].company?.id;
      console.log(`✅ [Test] Empresa encontrada: ${companyId}`);
    }
    
    // 3. Obter documentos
    console.log('📄 [Test] Obtendo documentos...');
    const documentsResponse = await fetch(`${API_BASE_URL}/companies/${companyId}/documents`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!documentsResponse.ok) {
      throw new Error(`Erro ao obter documentos: ${documentsResponse.status}`);
    }
    
    const documentsData = await documentsResponse.json();
    const documents = documentsData.documents || documentsData;
    
    if (documents.length === 0) {
      console.log('⚠️ [Test] Nenhum documento encontrado para testar exclusão');
      return;
    }
    
    const documentToDelete = documents[0];
    console.log(`✅ [Test] Documento encontrado para exclusão: ${documentToDelete.id}`);
    
    // 4. Tentar excluir documento
    console.log('🗑️ [Test] Tentando excluir documento...');
    const deleteResponse = await fetch(`${API_BASE_URL}/companies/${companyId}/documents/${documentToDelete.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`📊 [Test] Status da resposta: ${deleteResponse.status}`);
    
    if (deleteResponse.ok) {
      const deleteData = await deleteResponse.json();
      console.log('✅ [Test] Documento excluído com sucesso!');
      console.log('📦 [Test] Resposta:', deleteData);
    } else {
      const errorData = await deleteResponse.text();
      console.log('❌ [Test] Erro ao excluir documento:');
      console.log('📊 Status:', deleteResponse.status);
      console.log('📝 Erro:', errorData);
    }
    
  } catch (error) {
    console.error('❌ [Test] Erro no teste:', error.message);
  }
}

// Executar teste
testDeleteDocument();
