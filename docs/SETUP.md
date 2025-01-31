# Setup do Projeto

## Pré-requisitos

- Node.js (v18 ou superior)
- npm ou yarn
- Git

## Instalação

1. Clone o repositório:
\`\`\`bash
git clone https://github.com/seu-usuario/unitask.git
cd unitask
\`\`\`

2. Instale as dependências do frontend:
\`\`\`bash
npm install
\`\`\`

3. Instale as dependências do backend:
\`\`\`bash
cd server
npm install
cd ..
\`\`\`

4. Configure as variáveis de ambiente:
- Copie o arquivo `.env.example` para `.env`
- Preencha as variáveis necessárias

## Executando o Projeto

1. Inicie o servidor de desenvolvimento do frontend:
\`\`\`bash
npm run dev
\`\`\`

2. Em outro terminal, inicie o servidor backend:
\`\`\`bash
cd server
npm run dev
\`\`\`

O frontend estará disponível em `http://localhost:5173` e o backend em `http://localhost:3000`.

## Scripts Disponíveis

### Frontend
- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Gera a build de produção
- `npm run preview`: Visualiza a build de produção localmente

### Backend
- `npm run start`: Inicia o servidor em modo produção
- `npm run dev`: Inicia o servidor em modo desenvolvimento com hot-reload

## Estrutura do Projeto

\`\`\`
/
├── src/                    # Código fonte do frontend
│   ├── assets/            # Recursos estáticos
│   ├── components/        # Componentes React
│   ├── contexts/          # Contextos React
│   ├── hooks/             # Hooks personalizados
│   ├── layouts/           # Componentes de layout
│   ├── pages/             # Páginas da aplicação
│   ├── services/          # Serviços e integrações
│   ├── styles/            # Estilos globais
│   └── utils/             # Funções utilitárias
├── server/                # Código fonte do backend
│   ├── controllers/       # Controladores
│   ├── routes/            # Rotas da API
│   ├── middleware/        # Middlewares
│   ├── services/          # Serviços
│   └── utils/             # Funções utilitárias
└── docs/                  # Documentação
\`\`\`

## Convenções de Código

- Utilize ESLint e Prettier para manter a consistência do código
- Siga as convenções de nomenclatura:
  - Componentes: PascalCase
  - Funções e variáveis: camelCase
  - Constantes: UPPER_SNAKE_CASE
  - Arquivos de componente: PascalCase.jsx
  - Outros arquivos: camelCase.js

## Contribuindo

1. Crie uma branch para sua feature: `git checkout -b feature/nome-da-feature`
2. Faça commit das mudanças: `git commit -m 'feat: adiciona nova feature'`
3. Push para a branch: `git push origin feature/nome-da-feature`
4. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](../LICENSE) para mais detalhes. 