# 🔍 Debug de Documentos - Frontend

## 🎯 **Problema Identificado:**
O usuário reportou erro 404 nas rotas de download e exclusão de documentos:
- `Cannot GET /v1/companies/{companyId}/documents/{documentId}/content`
- `Cannot DELETE /v1/companies/{companyId}/documents/{documentId}`

## 🔧 **Correções Implementadas:**

### **✅ 1. Rotas Adicionadas ao Backend**
Adicionei as rotas faltantes ao `CompaniesController`:
- `GET /v1/companies/{companyId}/documents/{documentId}/content` - Download
- `DELETE /v1/companies/{companyId}/documents/{documentId}` - Exclusão
- `GET /v1/companies/{companyId}/documents/{documentId}/meta` - Metadados
- `PATCH /v1/companies/{companyId}/documents/{documentId}` - Atualização

### **✅ 2. Logs de Debug Adicionados**
Adicionei logs detalhados no frontend para identificar o problema:

#### **Download de Documentos:**
```typescript
downloadDocument(document: CompanyDocument) {
  console.log('🚀 [DocumentsComponent.downloadDocument] ===== INICIANDO DOWNLOAD =====');
  console.log('📄 Documento:', document.id, document.docType);
  
  // Verificar se há token
  const token = localStorage.getItem('access_token');
  console.log('🔑 Token no localStorage:', token ? 'Presente' : 'Ausente');
  
  // Logs detalhados para debug...
}
```

#### **Exclusão de Documentos:**
```typescript
deleteDocument(document: CompanyDocument) {
  console.log('🗑️ [DocumentsComponent.deleteDocument] ===== INICIANDO EXCLUSÃO =====');
  console.log('📄 Documento:', document.id, document.docType);
  
  // Verificar se há token
  const token = localStorage.getItem('access_token');
  console.log('🔑 Token no localStorage:', token ? 'Presente' : 'Ausente');
  
  // Logs detalhados para debug...
}
```

## 🧪 **Como Testar:**

### **1. Abrir o Console do Navegador:**
- Pressione `F12` ou `Ctrl+Shift+I`
- Vá para a aba "Console"

### **2. Testar Download:**
- Clique no botão "Baixar" de um documento
- Verifique os logs no console:
  - ✅ Token presente no localStorage?
  - ✅ Empresas encontradas?
  - ✅ ID da empresa correto?
  - ✅ URL que será chamada?

### **3. Testar Exclusão:**
- Clique no botão "Excluir" de um documento
- Confirme a exclusão
- Verifique os logs no console:
  - ✅ Token presente no localStorage?
  - ✅ Empresas encontradas?
  - ✅ ID da empresa correto?
  - ✅ URL que será chamada?

## 🔍 **Possíveis Problemas:**

### **1. Token de Autenticação:**
- Se o log mostrar "Token no localStorage: Ausente"
- **Solução:** Fazer login novamente

### **2. Empresas não encontradas:**
- Se o log mostrar "Empresas encontradas: 0"
- **Solução:** Verificar se há empresas cadastradas

### **3. ID da empresa incorreto:**
- Se o log mostrar "ID da empresa não encontrado"
- **Solução:** Verificar estrutura dos dados da empresa

### **4. URL incorreta:**
- Se a URL mostrada estiver incorreta
- **Solução:** Verificar configuração do `apiBaseUrl`

## 📊 **Logs Esperados:**

### **Download Funcionando:**
```
🚀 [DocumentsComponent.downloadDocument] ===== INICIANDO DOWNLOAD =====
📄 Documento: cmgb89tgj0001vf48wzrpmegp Cliente - CNPJ
🔑 Token no localStorage: Presente
🏢 [DocumentsComponent.downloadDocument] Empresas encontradas: 1
🏢 [DocumentsComponent.downloadDocument] Empresa selecionada: Empresa Teste ID: cmgb3ck690002vfbgozex0i25
📥 [DocumentsComponent.downloadDocument] URL que será chamada: http://localhost:3000/v1/companies/cmgb3ck690002vfbgozex0i25/documents/cmgb89tgj0001vf48wzrpmegp/content
Download realizado com sucesso, tamanho: 12345 bytes
```

### **Exclusão Funcionando:**
```
🗑️ [DocumentsComponent.deleteDocument] ===== INICIANDO EXCLUSÃO =====
📄 Documento: cmgb89tgj0001vf48wzrpmegp Cliente - CNPJ
🔑 Token no localStorage: Presente
🏢 [DocumentsComponent.deleteDocument] Empresas encontradas: 1
🏢 [DocumentsComponent.deleteDocument] Empresa selecionada: Empresa Teste ID: cmgb3ck690002vfbgozex0i25
🗑️ [DocumentsComponent.deleteDocument] URL que será chamada: http://localhost:3000/v1/companies/cmgb3ck690002vfbgozex0i25/documents/cmgb89tgj0001vf48wzrpmegp
Documento excluído com sucesso, recarregando lista...
```

## 🚨 **Se Ainda Houver Erro 404:**

### **Verificar Backend:**
1. O servidor está rodando? (`http://localhost:3000/v1/health`)
2. As rotas foram adicionadas corretamente?
3. Há algum erro nos logs do backend?

### **Verificar Frontend:**
1. O token está sendo enviado?
2. A URL está correta?
3. O `companyId` está correto?

## 🎉 **Status:**
- ✅ **Rotas adicionadas ao backend**
- ✅ **Logs de debug implementados**
- ✅ **Sistema pronto para teste**

**🚀 Teste agora e verifique os logs no console do navegador!**
