# ✅ Correção do Erro pageSize - Bad Request

## 🎯 **Problema Identificado:**
```
{
    "message": [
        "property pageSize should not exist"
    ],
    "error": "Bad Request",
    "statusCode": 400
}
```

## 🔍 **Causa do Erro:**
- **Frontend** enviava parâmetro `pageSize`
- **Backend** esperava parâmetro `limit`
- **Incompatibilidade** entre frontend e backend

## 🔧 **Correções Implementadas:**

### **1. Documents Component (`documents.component.ts`)**
```typescript
// ❌ ANTES (causava erro)
const params: any = {
  page: this.currentPage,
  pageSize: this.pageSize  // ❌ Parâmetro incorreto
};

// ✅ DEPOIS (corrigido)
const params: any = {
  page: this.currentPage,
  limit: this.pageSize     // ✅ Parâmetro correto
};
```

### **2. Documents Service (`documents.service.ts`)**
```typescript
// ❌ ANTES
getDocuments(companyId: string, params?: { 
  docType?: string; 
  page?: number; 
  pageSize?: number  // ❌ Parâmetro incorreto
})

// ✅ DEPOIS
getDocuments(companyId: string, params?: { 
  docType?: string; 
  page?: number; 
  limit?: number     // ✅ Parâmetro correto
})
```

### **3. API Service (`api.service.ts`)**
```typescript
// ❌ ANTES
getDocuments(companyId: string, params?: { 
  docType?: string; 
  page?: number; 
  pageSize?: number  // ❌ Parâmetro incorreto
}) {
  // ...
  if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
}

// ✅ DEPOIS
getDocuments(companyId: string, params?: { 
  docType?: string; 
  page?: number; 
  limit?: number     // ✅ Parâmetro correto
}) {
  // ...
  if (params.limit) queryParams.append('limit', params.limit.toString());
}
```

## 📋 **Parâmetros Corretos do Backend:**

### **DocumentListQueryDto:**
```typescript
export class DocumentListQueryDto {
  @ApiPropertyOptional({ example: 1, minimum: 1 })
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, minimum: 1 })
  limit?: number = 10;  // ✅ Backend espera 'limit'

  @ApiPropertyOptional({ example: 'CNPJ' })
  search?: string;
}
```

## 🎯 **Resultado:**
- ✅ **Erro 400 resolvido**
- ✅ **Parâmetros compatíveis** entre frontend e backend
- ✅ **Paginação funcionando** corretamente
- ✅ **Busca de documentos** funcionando

## 🚀 **Status:**
- ✅ **Frontend corrigido**
- ✅ **Backend compatível**
- ✅ **Erro resolvido**
- ✅ **Funcionalidade restaurada**

**🎉 O erro de pageSize foi completamente corrigido!**
