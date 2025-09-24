// Simular dados da empresa atual
const mockCompanyData = {
  id: "38cb9c40-ae23-4a12-ba60-ec216c6d4905",
  name: "RESTACK",
  cnpj: "12.345.678/0001-90",
  phone: "(11) 99999-9999",
  address: "Rua Teste, 123 - São Paulo/SP"
};

// Dados do novo membro
const memberData = {
  name: "Ary Felipe",
  email: "aryfelipe@gmail.com",
  password: "12345678",
  role: "member"
};

console.log('🔧 ===== COMPARAÇÃO DE PAYLOADS =====\n');

console.log('📊 DADOS DA EMPRESA ATUAL:');
console.log(JSON.stringify(mockCompanyData, null, 2));

console.log('\n👤 DADOS DO NOVO MEMBRO:');
console.log(JSON.stringify(memberData, null, 2));

console.log('\n❌ PAYLOAD ANTERIOR (INCORRETO):');
const incorrectPayload = {
  fullName: memberData.name,
  email: memberData.email,
  password: memberData.password,
  companyName: 'Empresa Padrão',
  companyCnpj: '00.000.000/0001-00',
  companyPhone: '',
  companyAddress: ''
};
console.log(JSON.stringify(incorrectPayload, null, 2));

console.log('\n✅ PAYLOAD CORRIGIDO (CORRETO):');
const correctPayload = {
  fullName: memberData.name,
  email: memberData.email,
  password: memberData.password,
  companyName: mockCompanyData.name,
  companyCnpj: mockCompanyData.cnpj,
  companyPhone: mockCompanyData.phone,
  companyAddress: mockCompanyData.address
};
console.log(JSON.stringify(correctPayload, null, 2));

console.log('\n🔍 DIFERENÇAS DETALHADAS:');
console.log('┌─────────────────────┬─────────────────────┬─────────────────────┐');
console.log('│ Campo               │ Anterior (Errado)   │ Atual (Correto)     │');
console.log('├─────────────────────┼─────────────────────┼─────────────────────┤');
console.log(`│ companyName         │ ${incorrectPayload.companyName.padEnd(19)} │ ${correctPayload.companyName.padEnd(19)} │`);
console.log(`│ companyCnpj         │ ${incorrectPayload.companyCnpj.padEnd(19)} │ ${correctPayload.companyCnpj.padEnd(19)} │`);
console.log(`│ companyPhone        │ ${incorrectPayload.companyPhone.padEnd(19)} │ ${correctPayload.companyPhone.padEnd(19)} │`);
console.log(`│ companyAddress      │ ${incorrectPayload.companyAddress.padEnd(19)} │ ${correctPayload.companyAddress.padEnd(19)} │`);
console.log('└─────────────────────┴─────────────────────┴─────────────────────┘');

console.log('\n🎯 BENEFÍCIOS DA CORREÇÃO:');
console.log('✅ Usuário criado com dados reais da empresa');
console.log('✅ CNPJ correto da empresa');
console.log('✅ Telefone correto da empresa');
console.log('✅ Endereço correto da empresa');
console.log('✅ Evita conflitos de dados');
console.log('✅ Mantém consistência no sistema');

console.log('\n🔧 IMPLEMENTAÇÃO NO CÓDIGO:');
console.log('// ANTES (incorreto):');
console.log('companyName: "Empresa Padrão",');
console.log('companyCnpj: "00.000.000/0001-00",');
console.log('companyPhone: "",');
console.log('companyAddress: ""');
console.log('');
console.log('// DEPOIS (correto):');
console.log('companyName: company.name || "Empresa",');
console.log('companyCnpj: company.cnpj || "",');
console.log('companyPhone: company.phone || "",');
console.log('companyAddress: company.address || ""');

console.log('\n🎉 ===== CORREÇÃO IMPLEMENTADA COM SUCESSO =====');
