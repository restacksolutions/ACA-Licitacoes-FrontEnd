// Simular exatamente os dados que estão vindo do backend
const mockBackendData = [
    {
        "id": "22e7a281-ac87-4e57-8fc8-072b715ae4b8",
        "companyId": "38cb9c40-ae23-4a12-ba60-ec216c6d4905",
        "userId": "395f3902-370d-4280-b97b-5d03260edcb0",
        "role": "owner",
        "user": {
            "id": "395f3902-370d-4280-b97b-5d03260edcb0",
            "authUserId": "mock-user-acsvalefilho-gmail-com",
            "fullName": "Adriano Vale",
            "email": "acsvalefilho@gmail.com",
            "createdAt": "2025-09-23T19:13:44.800Z"
        }
    }
];

console.log('🧪 ===== TESTANDO MAPEAMENTO DE MEMBROS =====\n');

console.log('📥 DADOS BRUTOS DO BACKEND:');
console.log(JSON.stringify(mockBackendData, null, 2));

console.log('\n🔄 SIMULANDO MAPEAMENTO DO FRONTEND:');

const mappedMembers = mockBackendData.map(member => {
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

console.log('\n🎯 RESULTADO ESPERADO NO FRONTEND:');
console.log('✅ Tabela deve mostrar:');
console.log('  - Nome: Adriano Vale');
console.log('  - Email: acsvalefilho@gmail.com');
console.log('  - Função: Proprietário (badge dourado)');
console.log('  - Data: 23/09/2025');
console.log('  - Status: Ativo');
console.log('  - Ações: Editar/Remover');

console.log('\n🎉 ===== TESTE DE MAPEAMENTO CONCLUÍDO =====');
