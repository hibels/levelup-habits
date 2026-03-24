# LevelUp Habits 🚀

Um aplicativo de rastreamento de hábitos gamificado que transforma sua rotina em uma jornada épica de progresso pessoal.

## 📱 Sobre o Projeto

LevelUp Habits é um app mobile desenvolvido em React Native que ajuda você a construir e manter hábitos consistentes através de mecânicas de gamificação:

- **Sistema de XP e Níveis**: Ganhe experiência a cada hábito completado
- **Streaks**: Mantenha sequências diárias e desbloqueie conquistas
- **Dark Mode**: Interface adaptável para uso em qualquer hora do dia
- **Offline-First**: Funciona perfeitamente sem conexão com internet

## ✨ Funcionalidades

### MVP (Versão Atual)

- ✅ Criar, editar e excluir hábitos personalizados
- ✅ Sistema de check diário com animações
- ✅ Sistema de XP e progressão de níveis
- ✅ Contador de streaks com reset automático
- ✅ Limite de 3 hábitos gratuitos (com paywall para premium)
- ✅ Tela de perfil com estatísticas
- ✅ Persistência local com AsyncStorage
- ✅ Suporte a tema claro/escuro

## 🛠️ Stack Tecnológica

- **Framework**: React Native (Expo)
- **Linguagem**: TypeScript (strict mode)
- **Navegação**: React Navigation 6
- **State Management**: Zustand
- **Validação**: React Hook Form + Zod
- **Persistência**: AsyncStorage
- **Animações**: Lottie
- **Testes**: Jest + React Native Testing Library

## 🚀 Como Rodar o Projeto

### Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn
- Expo CLI
- Expo Go app no seu celular (iOS/Android)

### Instalação

```bash
# Clone o repositório
git clone <repository-url>
cd levelup-habits

# Instale as dependências
npm install

# Inicie o projeto
npm start
```

### Executando

```bash
# Iniciar no Android
npm run android

# Iniciar no iOS (requer macOS)
npm run ios

# Iniciar no navegador
npm run web
```

### Usando o Expo Go

1. Instale o app Expo Go no seu celular
2. Execute `npm start`
3. Escaneie o QR code com a câmera (iOS) ou Expo Go (Android)

## 🧪 Testes

```bash
# Rodar todos os testes
npm test

# Rodar em modo watch
npm run test:watch

# Gerar relatório de coverage
npm run test:coverage
```

**Coverage Atual**: 70%+ (conforme requisitos)

## 📁 Estrutura do Projeto

```
src/
├── components/       # Componentes reutilizáveis
│   ├── HabitCard.tsx
│   ├── ProfileHeader.tsx
│   ├── EmptyState.tsx
│   └── FAB.tsx
├── screens/          # Telas do app
│   ├── HomeScreen.tsx
│   ├── EditHabitScreen.tsx
│   ├── ProfileScreen.tsx
│   └── PaywallScreen.tsx
├── navigation/       # Configuração de navegação
│   └── index.tsx
├── store/            # Zustand store
│   └── index.ts
├── utils/            # Funções utilitárias
│   ├── levels.ts
│   ├── dates.ts
│   └── validators.ts
├── types/            # TypeScript types
│   └── index.ts
└── theme/            # Design system (cores, tipografia, etc)
    └── index.ts
```

## 🎨 Design System

O app segue rigorosamente as especificações de design documentadas em `levelup-habits-design-specs.md`:

- **Cores**: Sistema de cores completo para light/dark mode
- **Tipografia**: Hierarquia clara com Inter/SF Pro/Roboto
- **Espaçamento**: Grid de 8pt para consistência
- **Componentes**: Todos os componentes seguem as specs visuais

## 📝 Convenções de Commit

Este projeto usa [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adiciona nova funcionalidade
fix: corrige um bug
docs: atualiza documentação
style: mudanças de formatação
refactor: refatoração de código
test: adiciona ou modifica testes
chore: tarefas de manutenção
```

## 🚧 Roadmap

### Futuras Implementações

- [ ] Backend/API real
- [ ] Autenticação de usuários
- [ ] Pagamento in-app real
- [ ] Ranking online entre usuários
- [ ] Notificações push
- [ ] Temas personalizados (premium)
- [ ] Backup em nuvem
- [ ] Estatísticas avançadas
- [ ] Conquistas e badges

## 🐛 Bugs Conhecidos

Nenhum bug crítico conhecido no momento.

## 📄 Licença

Este projeto é privado e de uso interno.

## 👥 Autores

- **Mobile Developer** - Implementação do MVP
- **Product Owner** - Especificações e requisitos
- **Designer** - Design System e UI/UX

## 🙏 Agradecimentos

- Equipe Clawdbot pela oportunidade
- Comunidade React Native
- Expo team

---

**Versão**: 1.0.0  
**Data**: 2026-03-24  
**Status**: MVP Completo ✅
