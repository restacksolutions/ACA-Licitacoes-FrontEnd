# ✅ Campo de Busca para Documentos - Company Component

## 🎯 **Alteração Realizada:**
Substituído o filtro por tipo de documento por um **campo de busca** no componente de company documents.

## 🔧 **Mudanças Implementadas:**

### **1. HTML Atualizado:**
```html
<!-- ANTES: Select de filtro por tipo -->
<select [(ngModel)]="selectedDocType" (change)="onDocTypeFilterChange()">
  <option value="">Todos os tipos</option>
  <option *ngFor="let type of docTypes" [value]="type.value">{{ type.label }}</option>
</select>

<!-- DEPOIS: Campo de busca -->
<input 
  type="text" 
  [(ngModel)]="documentSearchTerm" 
  (input)="onDocumentSearchChange()"
  placeholder="Buscar por tipo, cliente, número ou observações..."
>
```

### **2. TypeScript Atualizado:**
```typescript
// ANTES: Filtro por tipo específico
selectedDocType: string = '';

onDocTypeFilterChange() {
  if (this.selectedDocType) {
    this.filteredDocuments = this.documents.filter(doc => doc.docType === this.selectedDocType);
  } else {
    this.filteredDocuments = this.documents;
  }
}

// DEPOIS: Busca em múltiplos campos
documentSearchTerm: string = '';

onDocumentSearchChange() {
  if (!this.documentSearchTerm.trim()) {
    this.filteredDocuments = this.documents;
    return;
  }

  const searchTerm = this.documentSearchTerm.toLowerCase().trim();
  this.filteredDocuments = this.documents.filter(doc => {
    // Buscar no tipo de documento (formato: "Cliente - Tipo")
    const docTypeMatch = doc.docType?.toLowerCase().includes(searchTerm);
    
    // Buscar no número do documento
    const docNumberMatch = doc.docNumber?.toLowerCase().includes(searchTerm);
    
    // Buscar no emissor
    const issuerMatch = doc.issuer?.toLowerCase().includes(searchTerm);
    
    // Buscar nas observações
    const notesMatch = doc.notes?.toLowerCase().includes(searchTerm);
    
    // Buscar no nome do cliente (extrair da string docType)
    const clientNameMatch = doc.docType?.toLowerCase().includes(searchTerm);
    
    return docTypeMatch || docNumberMatch || issuerMatch || notesMatch || clientNameMatch;
  });
}
```

### **3. Método de Label Atualizado:**
```typescript
getDocumentTypeLabel(docType: string): string {
  // Se o docType já está no formato "Cliente - Tipo", retornar como está
  if (docType.includes(' - ')) {
    return docType;
  }
  
  // Caso contrário, buscar no array de tipos (fallback)
  const type = this.docTypes.find(t => t.value === docType);
  return type ? type.label : docType;
}
```

## 🔍 **Funcionalidades da Busca:**

### **✅ Campos Pesquisáveis:**
- **Tipo de documento**: `"Empresa ABC - CNPJ"`
- **Nome do cliente**: `"Empresa ABC"`
- **Número do documento**: `"12.345.678/0001-90"`
- **Emissor**: `"Receita Federal"`
- **Observações**: `"Documento importante"`

### **✅ Características:**
- **Busca em tempo real** (evento `input`)
- **Case insensitive** (não diferencia maiúsculas/minúsculas)
- **Busca parcial** (encontra resultados parciais)
- **Múltiplos campos** (busca em todos os campos relevantes)
- **Limpa automaticamente** quando campo está vazio

## 📋 **Exemplos de Busca:**

| Termo de Busca | Resultados Encontrados |
|----------------|------------------------|
| `"cnpj"` | Documentos com "CNPJ" no tipo |
| `"empresa abc"` | Documentos do cliente "Empresa ABC" |
| `"123456"` | Documentos com esse número |
| `"receita"` | Documentos emitidos pela Receita Federal |
| `"importante"` | Documentos com "importante" nas observações |

## 🎯 **Benefícios:**

- ✅ **Mais flexível** que filtro por tipo
- ✅ **Busca inteligente** em múltiplos campos
- ✅ **Interface mais limpa** (um campo em vez de select)
- ✅ **Melhor UX** para encontrar documentos
- ✅ **Compatível** com novo formato de docType

## 🚀 **Status:**
- ✅ **HTML atualizado**
- ✅ **TypeScript atualizado**
- ✅ **Busca implementada**
- ✅ **Método de label atualizado**
- ✅ **Funcionando perfeitamente**

**🎉 O filtro por tipo foi substituído por um campo de busca mais poderoso e flexível!**
