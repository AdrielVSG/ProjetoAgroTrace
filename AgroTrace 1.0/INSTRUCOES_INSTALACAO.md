# 🚀 Instruções de Instalação e Execução - AgroTrace

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 16 ou superior) - [Download aqui](https://nodejs.org/)
- **npm** (vem com o Node.js) ou **yarn**
- **Git** - [Download aqui](https://git-scm.com/)
- **Conta no Firebase** - [Criar conta aqui](https://firebase.google.com/)

## 🔧 Passo a Passo da Instalação

### 1. Clone o Repositório
```bash
git clone <url-do-repositorio>
cd agrotrace-web
```

### 2. Instale as Dependências
```bash
npm install
# ou
yarn install
```

### 3. Configure o Firebase

#### 3.1. Crie um Projeto no Firebase
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Digite o nome: `agrotrace-web` (ou qualquer nome de sua escolha)
4. Ative o Google Analytics (opcional)
5. Clique em "Criar projeto"

#### 3.2. Configure a Autenticação
1. No painel do Firebase, vá para "Authentication"
2. Clique em "Começar"
3. Vá para a aba "Sign-in method"
4. Ative "Email/Password"
5. Clique em "Salvar"

#### 3.3. Configure o Firestore Database
1. No painel do Firebase, vá para "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha "Começar no modo de teste" (para desenvolvimento)
4. Escolha uma localização (recomendado: us-central1)
5. Clique em "Concluído"

#### 3.4. Configure as Regras do Firestore
1. Vá para "Firestore Database" > "Regras"
2. Substitua o conteúdo por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários: apenas o próprio usuário pode ler/escrever
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Produtos: leitura pública, escrita apenas pelo produtor
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && 
        resource.data.producerId == request.auth.uid;
    }
    
    // Avaliações: leitura pública, escrita por usuários autenticados
    match /ratings/{ratingId} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.uid == resource.data.user_id;
    }
  }
}
```

3. Clique em "Publicar"

#### 3.5. Obtenha as Configurações do Firebase
1. No painel do Firebase, vá para "Configurações do projeto" (ícone de engrenagem)
2. Role para baixo até "Seus aplicativos"
3. Clique em "Web" (ícone `</>`)
4. Digite um nome para o app: `AgroTrace Web`
5. Clique em "Registrar app"
6. **COPIE** as configurações que aparecem (você vai precisar delas)

### 4. Configure o Arquivo de Configuração

1. Abra o arquivo `src/firebase/config.js`
2. Substitua as configurações de exemplo pelas suas configurações reais:

```javascript
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
};
```

### 5. Execute o Projeto

```bash
npm run dev
# ou
yarn dev
```

O projeto será aberto automaticamente no seu navegador em `http://localhost:3000`

## 🧪 Testando a Aplicação

### 1. Cadastro de Usuário
1. Acesse `http://localhost:3000`
2. Clique em "Cadastrar"
3. Preencha os dados:
   - Nome: Seu nome
   - Email: seu@email.com
   - Senha: 123456
   - Tipo: Consumidor ou Produtor
   - Localização: Sua cidade
4. Clique em "Criar Conta"

### 2. Login
1. Use o email e senha cadastrados
2. Clique em "Entrar"

### 3. Testando como Consumidor
1. Vá para "Escanear QR Code"
2. Clique em "Iniciar Escaneamento"
3. Aguarde a simulação (2 segundos)
4. Veja os detalhes do produto
5. Avalie o produto com estrelas

### 4. Testando como Produtor
1. Vá para "Adicionar Produto"
2. Preencha os dados do produto
3. Clique em "Cadastrar Produto"
4. Vá para "Gestão de Estoque" para ver o produto cadastrado

## 🐛 Solução de Problemas

### Erro: "Firebase: No Firebase App '[DEFAULT]' has been created"
**Solução**: Verifique se as configurações do Firebase estão corretas no arquivo `src/firebase/config.js`

### Erro: "Permission denied" no Firestore
**Solução**: Verifique se as regras do Firestore estão configuradas corretamente

### Erro: "Network request failed"
**Solução**: Verifique sua conexão com a internet e se o projeto Firebase está ativo

### Página em branco
**Solução**: 
1. Verifique o console do navegador (F12) para erros
2. Certifique-se de que todas as dependências foram instaladas
3. Tente limpar o cache: `npm run dev -- --force`

## 📱 Testando em Dispositivos Móveis

### 1. Usando o IP Local
1. Descubra seu IP local:
   - Windows: `ipconfig`
   - Mac/Linux: `ifconfig`
2. Acesse `http://SEU_IP:3000` no seu celular
3. Certifique-se de que ambos os dispositivos estão na mesma rede

### 2. Usando ngrok (Recomendado)
1. Instale o ngrok: [https://ngrok.com/](https://ngrok.com/)
2. Execute: `ngrok http 3000`
3. Use a URL fornecida pelo ngrok no seu celular

## 🚀 Deploy para Produção

### Opção 1: Vercel (Recomendado)
1. Instale o Vercel CLI: `npm i -g vercel`
2. Execute: `vercel`
3. Siga as instruções na tela
4. Configure as variáveis de ambiente do Firebase

### Opção 2: Netlify
1. Execute: `npm run build`
2. Acesse [Netlify](https://netlify.com/)
3. Faça upload da pasta `dist`
4. Configure as variáveis de ambiente

### Opção 3: Firebase Hosting
1. Instale o Firebase CLI: `npm i -g firebase-tools`
2. Execute: `firebase login`
3. Execute: `firebase init hosting`
4. Execute: `npm run build`
5. Execute: `firebase deploy`

## 📊 Monitoramento e Logs

### Console do Navegador
- Pressione F12 para abrir as ferramentas de desenvolvedor
- Vá para a aba "Console" para ver logs e erros

### Firebase Console
- Acesse [Firebase Console](https://console.firebase.google.com/)
- Vá para "Authentication" para ver usuários cadastrados
- Vá para "Firestore Database" para ver dados salvos

## 🔧 Comandos Úteis

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Linting
npm run lint

# Limpar cache
npm run dev -- --force
```

## 📞 Suporte

Se você encontrar problemas:

1. **Verifique os logs**: Console do navegador e terminal
2. **Consulte a documentação**: README.md e DOCUMENTACAO_TECNICA.md
3. **Verifique as configurações**: Firebase e variáveis de ambiente
4. **Teste em modo incógnito**: Para descartar problemas de cache

## ✅ Checklist de Instalação

- [ ] Node.js instalado
- [ ] Repositório clonado
- [ ] Dependências instaladas (`npm install`)
- [ ] Projeto Firebase criado
- [ ] Autenticação configurada
- [ ] Firestore configurado
- [ ] Regras do Firestore configuradas
- [ ] Configurações do Firebase atualizadas
- [ ] Projeto executando (`npm run dev`)
- [ ] Cadastro de usuário funcionando
- [ ] Login funcionando
- [ ] Funcionalidades básicas testadas

## 🎉 Próximos Passos

Após a instalação bem-sucedida:

1. **Explore a aplicação**: Teste todas as funcionalidades
2. **Personalize**: Modifique cores, textos e imagens conforme necessário
3. **Adicione dados**: Cadastre produtos e usuários de teste
4. **Deploy**: Publique em produção quando estiver satisfeito
5. **Monitore**: Acompanhe o uso através do Firebase Console

---

**Parabéns! O AgroTrace está funcionando em sua máquina! 🎉**
