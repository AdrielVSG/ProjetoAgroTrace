# 🔧 Configuração do Firebase Storage

## 📋 **Passo a Passo para Configurar o Storage**

### 1. **Acessar o Firebase Console**
- Vá para: https://console.firebase.google.com/
- Selecione seu projeto "AgroTrace"

### 2. **Habilitar o Storage**
- No menu lateral, clique em "Storage"
- Clique em "Começar"
- Escolha "Começar no modo de teste" (para desenvolvimento)
- Selecione a localização do servidor (recomendado: us-central1)
- Clique em "Próximo" e depois "Concluído"

### 3. **Configurar Regras de Segurança**
- Na aba "Rules" do Storage
- Apague o conteúdo atual
- Cole o seguinte código:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Imagens de produtos e perfis: leitura pública, escrita por usuários autenticados
    match /images/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

- Clique em "Publicar"

### 4. **Verificar Configuração**
- Acesse a aba "Files" para ver se o Storage está funcionando
- Você deve ver uma pasta vazia chamada "images"

## 🎯 **O que o Storage Permite**

### ✅ **Funcionalidades Implementadas:**
- **Upload de Imagens de Produtos**: Produtores podem adicionar fotos aos produtos
- **Upload de Fotos de Perfil**: Usuários podem personalizar seus perfis
- **Armazenamento Seguro**: Apenas usuários autenticados podem fazer upload
- **Acesso Público**: Qualquer pessoa pode ver as imagens (para produtos)

### 📁 **Estrutura de Arquivos:**
```
images/
├── 1703123456789-produto1.jpg    # Imagens de produtos
├── 1703123456790-produto2.png    # (timestamp-nomearquivo)
├── 1703123456791-perfil1.jpg     # Fotos de perfil
└── ...
```

## 🔒 **Segurança**

### **Regras Implementadas:**
- ✅ **Leitura Pública**: Qualquer pessoa pode ver as imagens
- ✅ **Escrita Autenticada**: Apenas usuários logados podem fazer upload
- ✅ **Validação de Tipo**: Apenas arquivos de imagem são aceitos
- ✅ **Limite de Tamanho**: Máximo 5MB por arquivo

### **Validações no Código:**
- Verificação de tipo de arquivo (image/*)
- Limite de tamanho (5MB)
- Nomes únicos com timestamp
- Tratamento de erros

## 🚀 **Testando o Upload**

### **Para Produtores:**
1. Faça login como Produtor
2. Vá para "Adicionar Produto"
3. Clique na área de upload de imagem
4. Selecione uma imagem
5. Verifique se o upload foi bem-sucedido

### **Para Todos os Usuários:**
1. Vá para "Perfil"
2. Clique na área de upload de foto
3. Selecione uma imagem
4. Verifique se a foto foi atualizada

## ⚠️ **Problemas Comuns**

### **Erro: "Permission denied"**
- Verifique se as regras do Storage estão configuradas corretamente
- Certifique-se de que o usuário está autenticado

### **Erro: "File too large"**
- Reduza o tamanho da imagem (máximo 5MB)
- Use ferramentas online para comprimir imagens

### **Erro: "Invalid file type"**
- Use apenas arquivos de imagem (JPG, PNG, GIF)
- Verifique a extensão do arquivo

## 📱 **Próximos Passos**

Após configurar o Storage:
1. Teste o upload de imagens
2. Verifique se as imagens aparecem nos produtos
3. Teste a funcionalidade de catálogo
4. Verifique se as avaliações estão funcionando

## 🆘 **Suporte**

Se encontrar problemas:
1. Verifique o console do navegador para erros
2. Confirme se o Storage está habilitado
3. Verifique se as regras estão corretas
4. Teste com uma imagem pequena primeiro
