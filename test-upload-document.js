// Script de teste para verificar o upload de documentos
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const FormData = require('form-data');
const fs = require('fs');

const API_BASE_URL = 'http://localhost:3000/v1';

async function testUploadDocument() {
  console.log('🧪 [Test] Iniciando teste de upload de documento...');
  
  try {
    // 1. Fazer login
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
    
    // 3. Criar arquivo de teste
    console.log('📄 [Test] Criando arquivo de teste...');
    const testContent = 'Este é um documento de teste para upload.';
    fs.writeFileSync('test-document.txt', testContent);
    
    // 4. Fazer upload do documento
    console.log('📤 [Test] Fazendo upload do documento...');
    const formData = new FormData();
    formData.append('file', fs.createReadStream('test-document.txt'));
    formData.append('docType', 'CNPJ');
    formData.append('docNumber', '12.345.678/0001-90');
    formData.append('issuer', 'Receita Federal');
    formData.append('issueDate', '2024-01-01');
    formData.append('expiresAt', '2025-12-31');
    formData.append('notes', 'Documento de teste');
    
    const uploadResponse = await fetch(`${API_BASE_URL}/companies/${companyId}/documents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      },
      body: formData
    });
    
    console.log(`📊 [Test] Status da resposta: ${uploadResponse.status}`);
    
    if (uploadResponse.ok) {
      const uploadData = await uploadResponse.json();
      console.log('✅ [Test] Documento enviado com sucesso!');
      console.log('📦 [Test] Resposta:', uploadData);
    } else {
      const errorData = await uploadResponse.text();
      console.log('❌ [Test] Erro ao enviar documento:');
      console.log('📊 Status:', uploadResponse.status);
      console.log('📝 Erro:', errorData);
    }
    
    // Limpar arquivo de teste
    fs.unlinkSync('test-document.txt');
    
  } catch (error) {
    console.error('❌ [Test] Erro no teste:', error.message);
  }
}

// Executar teste
testUploadDocument();
