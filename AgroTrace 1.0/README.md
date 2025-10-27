# AgroTrace - Sistema de Rastreabilidade Agrícola Sustentável

## 📋 Visão Geral

O AgroTrace é uma aplicação web que promove transparência e sustentabilidade na cadeia de suprimentos agrícolas, conectando diretamente produtores rurais e consumidores através de QR codes. O sistema permite que consumidores rastreiem a origem, uso de recursos e práticas sustentáveis de produtos agrícolas.

## 🎯 Objetivos

- **Para Consumidores**: Escanear QR codes para acessar informações detalhadas sobre origem, sustentabilidade e certificações dos produtos
- **Para Produtores**: Registrar produtos com dados como origem, uso de água e certificações, promovendo transparência
- **Benefícios**: Reduzir desperdício alimentar, elevar lucros dos produtores e incentivar práticas agrícolas sustentáveis

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca para interface de usuário
- **Vite** - Build tool e servidor de desenvolvimento
- **Tailwind CSS** - Framework CSS utilitário
- **React Router DOM** - Roteamento
- **Lucide React** - Ícones
- **React Hot Toast** - Notificações

### Backend
- **Firebase Authentication** - Autenticação de usuários
- **Firebase Firestore** - Banco de dados NoSQL
- **Firebase Storage** - Armazenamento de arquivos

## 📁 Estrutura do Projeto

```
agrotrace-web/
├── public/
├── src/
│   ├── components/
│   │   └── Layout.jsx              # Layout principal com sidebar
│   ├── contexts/
│   │   └── AuthContext.jsx         # Contexto de autenticação
│   ├── firebase/
│   │   └── config.js               # Configuração do Firebase
│   ├── pages/
│   │   ├── LoginPage.jsx           # Página de login/cadastro
│   │   ├── DashboardPage.jsx       # Dashboard principal
│   │   ├── ScanPage.jsx            # Scanner de QR Code
│   │   ├── ProductDetailsPage.jsx  # Detalhes do produto
│   │   ├── AddProductPage.jsx      # Cadastro de produtos (produtores)
│   │   ├── StockPage.jsx           # Gestão de estoque
│   │   ├── HistoryPage.jsx         # Histórico de produtos
│   │   └── ProfilePage.jsx         # Perfil do usuário
│   ├── App.jsx                     # Componente principal
│   ├── main.jsx                    # Ponto de entrada
│   └── index.css                   # Estilos globais e tema
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn
- Conta no Firebase

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd agrotrace-web
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Crie um novo projeto ou use um existente
3. Ative Authentication e Firestore Database
4. Copie as configurações do Firebase
5. Edite `src/firebase/config.js` com suas credenciais:

```javascript
const firebaseConfig = {
  apiKey: "sua-api-key",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "seu-sender-id",
  appId: "seu-app-id"
};
```

### 4. Configure as regras do Firestore

No Firebase Console, vá para Firestore Database > Rules e configure:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários podem ler/escrever seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Produtos são públicos para leitura, escritos apenas por produtores
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && 
        resource.data.producerId == request.auth.uid;
    }
    
    // Avaliações são públicas para leitura, escritas por usuários autenticados
    match /ratings/{ratingId} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.uid == resource.data.user_id;
    }
  }
}
```

### 5. Execute o projeto
```bash
npm run dev
```

O projeto estará disponível em `http://localhost:3000`

## 📱 Funcionalidades Implementadas

### 🔐 Autenticação
- Login e cadastro de usuários
- Diferenciação entre Consumidores e Produtores
- Gerenciamento de perfil e preferências

### 👥 Para Consumidores
- **Escanear QR Code**: Rastrear origem e sustentabilidade dos produtos
- **Histórico**: Ver produtos já rastreados e avaliados
- **Avaliação**: Avaliar produtos com sistema de estrelas
- **Compartilhamento**: Compartilhar informações de produtos

### 🌱 Para Produtores
- **Cadastro de Produtos**: Adicionar produtos com informações detalhadas
- **Gestão de Estoque**: Visualizar e gerenciar produtos cadastrados
- **Relatórios**: Acompanhar estatísticas de produtos

### 🎨 Interface
- Design responsivo e moderno
- Tema personalizado baseado no Figma fornecido
- Navegação intuitiva com sidebar
- Notificações toast para feedback

## 🗄️ Estrutura do Banco de Dados

### Coleção: `users`
```javascript
{
  name: string,
  email: string,
  type: 'consumer' | 'producer',
  location: string,
  preferences: {
    language: string,
    notifications: boolean,
    darkMode: boolean
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Coleção: `products`
```javascript
{
  name: string,
  origin: string,
  waterUsage: string,
  certifications: string[],
  description: string,
  environmentalImpact: string,
  harvestDate: string,
  batchNumber: string,
  producerId: string,
  producerName: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Coleção: `ratings`
```javascript
{
  product_id: string,
  user_id: string,
  rating: number (1-5),
  timestamp: string
}
```

## 🎨 Sistema de Design

O projeto utiliza um sistema de design personalizado baseado no CSS fornecido, com:

- **Cores**: Paleta verde para sustentabilidade
- **Tipografia**: Sistema de fontes responsivo
- **Componentes**: Cards, botões e inputs padronizados
- **Tema**: Suporte a modo claro/escuro
- **Responsividade**: Design mobile-first

## 🚀 Deploy

### Vercel (Recomendado)
1. Instale o Vercel CLI: `npm i -g vercel`
2. Execute: `vercel`
3. Configure as variáveis de ambiente do Firebase

### Netlify
1. Build do projeto: `npm run build`
2. Faça upload da pasta `dist` para o Netlify
3. Configure as variáveis de ambiente

## 📊 Casos de Uso Implementados

- **UC01**: Cadastro de Perfil
- **UC02**: Escanear QR Code
- **UC03**: Avaliar Produto
- **UC04**: Adicionar Produto
- **UC05**: Receber Notificações
- **UC06**: Editar Perfil
- **UC07**: Visualizar Dados de Sustentabilidade
- **UC08**: Compartilhar Produto
- **UC09**: Registrar Transações
- **UC10**: Consultar Histórico de Produtos
- **UC11**: Gerar Relatórios de Sustentabilidade
- **UC12**: Configurar Preferências de Notificação
- **UC13**: Consultar Certificações do Produto

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Visualiza build de produção
- `npm run lint` - Executa linter

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte, entre em contato através de:
- Email: suporte@agrotrace.com
- GitHub Issues: [Link para issues]

## 🎯 Próximos Passos

- [ ] Implementar scanner de QR Code real
- [ ] Adicionar relatórios avançados
- [ ] Integrar com APIs de certificação
- [ ] Implementar notificações push
- [ ] Adicionar testes automatizados
- [ ] Otimizar performance
- [ ] Adicionar PWA (Progressive Web App)

---

**Desenvolvido com ❤️ para promover sustentabilidade na agricultura**
