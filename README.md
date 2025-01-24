# UniTask 📚✅

## Visão Geral
UniTask é uma plataforma web de produtividade acadêmica que combina gerenciamento de tarefas, controle de presença em aulas, técnica Pomodoro e organização de notas. Desenvolvida especialmente para estudantes universitários, a plataforma oferece uma solução integrada para gerenciar todas as atividades acadêmicas em um único lugar.

## 🚀 Funcionalidades Principais

### 📋 Gerenciamento de Tarefas
- Quadro Kanban personalizável
- Organização por drag and drop
- Sistema de tags para categorização
- Definição de prazos e prioridades
- Integração com Google Calendar

### ⏱️ Sistema Pomodoro
- Timer configurável para sessões de estudo
- Intervalos curtos e longos personalizáveis
- Histórico de sessões de estudo
- Notificações de início/fim de sessões

### 📝 Caderno Virtual
- Editor de texto rico
- Organização por tópicos/matérias
- Suporte a imagens e links
- Sistema de busca e filtros

### 📅 Controle de Presença
- Registro de presenças por disciplina
- Cálculo automático de porcentagem de faltas
- Alertas de limite de faltas
- Diferentes tipos de aula (teórica/prática)

## 🛠️ Tecnologias Utilizadas

### Frontend
- React 18
- Vite
- TailwindCSS
- Radix UI
- DND Kit (Drag and Drop)
- TipTap (Editor)

### Backend/Serviços
- Firebase (Firestore)
- Google Calendar API
- Clerk (Autenticação)

## 🚀 Começando

### Pré-requisitos
- Node.js (versão 18 ou superior)
- NPM ou Yarn
- Conta Firebase
- Conta Google Cloud Platform
- Conta Clerk

## 📁 Estrutura do Projeto
src/
├── components/ # Componentes reutilizáveis
├── contexts/ # Contextos React
├── hooks/ # Hooks personalizados
├── lib/ # Utilitários
├── pages/ # Páginas da aplicação
└── styles/ # Estilos globais

## 🔐 Segurança

O projeto implementa regras de segurança rigorosas no Firestore:
- Autenticação obrigatória para todas as operações
- Acesso restrito aos dados do próprio usuário
- Validação de dados em todas as operações
- Proteção contra modificações não autorizadas

## 📱 Recursos da Interface

- Design responsivo
- Tema claro/escuro
- Interface drag and drop intuitiva
- Notificações em tempo real
- Atalhos de teclado