# UniTask 📚✅

## Visão Geral
UniTask é uma plataforma web de produtividade acadêmica que combina gerenciamento de tarefas, controle de presença em aulas, técnica Pomodoro, organização de notas, flashcards e calendário acadêmico. Desenvolvida especialmente para estudantes universitários, a plataforma oferece uma solução integrada para gerenciar todas as atividades acadêmicas em um único lugar.

## 🚀 Funcionalidades Principais

### 📋 Gerenciamento de Tarefas
- Organização por drag and drop
- Sistema de tags para categorização
- Definição de prazos e prioridades
- Integração com Google Calendar

### ⏱️ Sistema Pomodoro
- Timer configurável para sessões de estudo
- Intervalos curtos e longos personalizáveis
- Histórico de sessões de estudo
- Notificações de início/fim de sessões
- Relatórios e estatísticas de produtividade

### 📝 Caderno Virtual
- Editor de texto rico
- Organização por disciplinas/matérias
- Suporte a arquivos PDF e imagens
- Sistema de marcação e destaque
- Armazenamento de materiais acadêmicos

### 📅 Controle de Presença
- Registro de presenças por disciplina
- Cálculo automático de porcentagem de faltas
- Alertas de limite de faltas
- Diferentes tipos de aula (teórica/prática)
- Estatísticas de presença

### 🗂️ Flashcards
- Sistema de cartões de estudo
- Método spaced repetition (repetição espaçada)
- Geração automática de flashcards com IA
- Organização por disciplinas
- Modos de estudo e revisão

### 📆 Calendário Acadêmico
- Visualização de eventos e prazos
- Integração com Google Calendar
- Diferentes visualizações (dia, semana, mês)
- Organização por categorias de evento

## 🛠️ Tecnologias Utilizadas

### Frontend
- React 18
- Vite
- TailwindCSS
- Radix UI + shadcn/ui
- DND Kit (Drag and Drop)
- Framer Motion (Animações)

### Backend/Serviços
- Firebase (Firestore, Authentication, Analytics)
- Supabase (Armazenamento de arquivos)
- Google Calendar API
- API Express (servidor Node.js)
- Integração com serviços de IA para flashcards

## 🚀 Começando

### Pré-requisitos
- Node.js (versão 18 ou superior)
- NPM ou Yarn
- Conta Firebase
- Conta Google Cloud Platform
- Conta Supabase

## 📁 Estrutura do Projeto
src/
├── components/ # Componentes reutilizáveis
├── contexts/ # Contextos React
├── hooks/ # Hooks personalizados
├── lib/ # Utilitários
├── pages/ # Páginas da aplicação
├── services/ # Serviços e APIs
├── utils/ # Funções utilitárias
└── styles/ # Estilos globais

server/
├── api.js # API Express
├── controllers/ # Controladores da API
├── routes/ # Rotas da API
└── services/ # Serviços backend

## 🔐 Segurança

O projeto implementa regras de segurança rigorosas:
- Autenticação obrigatória para todas as operações
- Acesso restrito aos dados do próprio usuário
- Validação de dados em todas as operações
- Proteção contra modificações não autorizadas
- Redação de informações sensíveis em logs

## 📱 Recursos da Interface

- Design responsivo
- Tema claro/escuro
- Interface drag and drop intuitiva
- Notificações em tempo real
- Atalhos de teclado
- Animações suaves
- Componentes acessíveis