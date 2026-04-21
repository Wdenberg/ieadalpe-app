# 📱 IEADALPE App

Aplicativo móvel nativo (iOS/Android) para a **Igreja Evangélica Assembleia de Deus em Abreu e Lima (IEADALPE)**, desenvolvido com **React Native**, **Expo**, **TypeScript** e **Supabase**.

O app conecta-se a uma infraestrutura backend robusta com PostgreSQL, Edge Functions em Deno e RLS (Row Level Security) ativado, proporcionando uma experiência segura e integrada para membros e obreiros da comunidade.

---

## 🎯 Objetivo

Criar uma plataforma móvel que facilite a comunicação, organização e acesso a informações para obreiros e membros da IEADALPE, incluindo:

- **Autenticação segura** com Supabase
- **Dashboard personalizado** com próximas escalas e avisos
- **Acesso a documentos restritos** com URLs assinadas
- **Assistente de IA** para consultas sobre escalas e documentos
- **Sistema de notícias e avisos** da igreja
- **Perfil de obreiro** com histórico de escalas

---

## 🏗️ Arquitetura Técnica

### Stack Tecnológico

| Componente | Tecnologia | Versão |
|-----------|-----------|--------|
| **Framework Mobile** | React Native | 0.81.5 |
| **Plataforma** | Expo | 54 |
| **Linguagem** | TypeScript | 5.9 |
| **Styling** | NativeWind (Tailwind CSS) | 4.2.1 |
| **Roteamento** | Expo Router | 6 |
| **Backend** | Supabase (PostgreSQL + Edge Functions) | - |
| **Autenticação** | Supabase Auth | - |
| **Banco de Dados** | PostgreSQL | - |
| **Armazenamento** | Supabase Storage (S3-compatible) | - |
| **Animações** | React Native Reanimated | 4.1.6 |
| **Gestos** | React Native Gesture Handler | 2.28.0 |
| **Ícones** | Expo Vector Icons (Material Icons) | 15.0.3 |

### Estrutura do Banco de Dados

O app integra-se com as seguintes tabelas Supabase:

| Tabela | Descrição | Uso |
|--------|-----------|-----|
| `profiles` | Dados de usuários autenticados | Autenticação e perfil |
| `obreiros` | Informações de obreiros | Dashboard, perfil, escalas |
| `cultos_escalas` | Escalas de cultos | Listagem de próximas escalas |
| `noticias` | Avisos e notícias da igreja | Feed de notícias |
| `solicitacoes_obreiros` | Solicitações de obreiros | Gerenciamento de requisições |
| `logs_acesso` | Logs de acesso ao app | Auditoria e segurança |

---

## 🎨 Design System

### Paleta de Cores Eclesiástica

A paleta foi escolhida para refletir a identidade visual da IEADALPE:

| Cor | Hex | Uso |
|-----|-----|-----|
| **Vinho (Primary)** | `#8B3A3A` | Botões, headers, destaques |
| **Dourado (Tertiary)** | `#D4AF37` | Acentos, badges, destaque especial |
| **Verde (Secondary)** | `#2D5016` | Elementos secundários, confirmações |
| **Bege (Background)** | `#F5F1E8` | Fundo claro, cards |
| **Cinza Claro (Surface)** | `#FFFFFF` | Cards, superfícies |
| **Cinza Escuro (Foreground)** | `#11181C` | Texto principal |
| **Cinza Muted** | `#687076` | Texto secundário |

### Tipografia

- **Títulos**: Playfair Display (serif elegante)
- **Corpo**: Inter (sans-serif moderna)
- **Monospace**: Courier New (código)

### Componentes Reutilizáveis

```
components/
├── screen-container.tsx      # Wrapper com SafeArea
├── themed-view.tsx           # View com tema automático
├── haptic-tab.tsx            # Tab com feedback háptico
├── escala-card.tsx           # Card de escala de culto
├── noticia-card.tsx          # Card de notícia
└── ui/
    └── icon-symbol.tsx       # Mapeamento de ícones
```

---

## 📱 Estrutura de Telas

### Navegação Principal (Tab Bar)

O app possui 5 abas principais:

1. **Home (Dashboard)** - Tela inicial com resumo
2. **Escalas** - Lista de escalas de cultos
3. **Documentos** - Acesso a arquivos restritos
4. **Notícias** - Avisos e comunicados
5. **Perfil** - Dados do obreiro e configurações

### Fluxo de Autenticação

```
Splash Screen
    ↓
Login (email/CPF + senha)
    ↓
[Validação Supabase]
    ↓
Dashboard (se autenticado)
    ↓
Tab Navigation (5 abas)
```

### Telas Implementadas

#### 1. **Login** (`app/auth/login.tsx`)
- Email/CPF e senha
- Validação com Supabase Auth
- Proteção de rotas baseada em `has_role`
- Disparo de `log-obreiro-login` para auditoria

#### 2. **Dashboard** (`app/(tabs)/index.tsx`)
- Saudação personalizada com nome do obreiro
- Resumo do perfil (foto, nome, função)
- Próximas 3 escalas com cards
- Seção de documentos restritos
- Últimas 2 notícias
- Botão de acesso ao Assistente de IA

#### 3. **Escalas** (`app/(tabs)/escalas.tsx`)
- Lista completa de escalas do obreiro
- Ordenação por data
- Cards com: data, hora, tipo de culto, local, função
- Status de confirmação

#### 4. **Documentos** (`app/(tabs)/documentos.tsx`)
- Lista categorizada de documentos
- Categorias: Manuais, Escalas Impressas, Comunicados
- Integração com Edge Function `get-signed-url`
- URLs temporárias com TTL de 1 hora
- Aviso de segurança

#### 5. **Notícias** (`app/(tabs)/noticias.tsx`)
- Feed de notícias e avisos
- Cards com imagem, título, resumo e data
- Ordenação por data (mais recentes primeiro)

#### 6. **Perfil** (`app/(tabs)/perfil.tsx`)
- Dados pessoais do obreiro
- Email, telefone, data de nascimento
- Status (ativo/inativo)
- Botão de logout
- Versão do app

#### 7. **Assistente** (`app/(tabs)/assistente.tsx`)
- Interface de chat simples
- Histórico de conversas
- Entrada de texto com limite de 200 caracteres
- Placeholder para integração com IA

---

## 🔐 Segurança e Autenticação

### Autenticação Supabase

```typescript
// Cliente Supabase configurado em lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);
```

### Proteção de Rotas

O app implementa proteção de rotas baseada no contexto de autenticação:

```typescript
// lib/auth-context.tsx
- Verifica se usuário está autenticado
- Redireciona para login se não autenticado
- Valida role do usuário (admin/obreiro)
- Persiste sessão com AsyncStorage
```

### RLS (Row Level Security)

Todas as queries respeitam as políticas RLS do Supabase:

- Usuários só podem ver seus próprios dados
- Obreiros só acessam escalas atribuídas a eles
- Documentos restritos requerem URLs assinadas

### Auditoria

Todas as ações de login disparam a função `log-obreiro-login`:

```sql
-- Registra: IP, timestamp, user_id, status
INSERT INTO logs_acesso (user_id, ip_address, timestamp, acao)
VALUES (user_id, ip, now(), 'login');
```

---

## 🚀 Como Começar

### Pré-requisitos

- **Node.js** 18+ e npm/pnpm
- **Expo CLI** instalado globalmente
- **Supabase** project configurado
- **Android Studio** (para emulador Android) ou **Xcode** (para iOS)

### Instalação

1. **Clone o repositório**
   ```bash
   git clone <repo-url>
   cd ieadalpe-app
   ```

2. **Instale as dependências**
   ```bash
   pnpm install
   ```

3. **Configure variáveis de ambiente**
   
   Crie um arquivo `.env.local` na raiz do projeto:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://seu-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
   ```

4. **Inicie o servidor de desenvolvimento**
   ```bash
   pnpm dev
   ```

   Isso iniciará:
   - Metro Bundler (porta 8081)
   - Backend API (porta 3000)

### Executar em Emulador/Dispositivo

#### Android
```bash
pnpm android
```

#### iOS
```bash
pnpm ios
```

#### Web (teste rápido)
```bash
pnpm dev:metro
# Acesse http://localhost:8081
```

### Gerar QR Code para Expo Go

```bash
pnpm qr
```

Escaneie o QR code com o app **Expo Go** no seu dispositivo para testar.

---

## 📦 Estrutura de Pastas

```
ieadalpe-app/
├── app/
│   ├── _layout.tsx              # Root layout com providers
│   ├── auth/
│   │   └── login.tsx            # Tela de login
│   ├── oauth/
│   │   └── callback.tsx         # Callback OAuth
│   └── (tabs)/
│       ├── _layout.tsx          # Tab bar layout
│       ├── index.tsx            # Dashboard
│       ├── escalas.tsx          # Escalas
│       ├── documentos.tsx       # Documentos
│       ├── noticias.tsx         # Notícias
│       ├── perfil.tsx           # Perfil
│       └── assistente.tsx       # Assistente IA
├── components/
│   ├── screen-container.tsx     # SafeArea wrapper
│   ├── themed-view.tsx          # View com tema
│   ├── haptic-tab.tsx           # Tab com feedback
│   ├── escala-card.tsx          # Card de escala
│   ├── noticia-card.tsx         # Card de notícia
│   └── ui/
│       └── icon-symbol.tsx      # Mapeamento de ícones
├── hooks/
│   ├── use-auth.ts              # Hook de autenticação
│   ├── use-colors.ts            # Hook de cores
│   ├── use-color-scheme.ts      # Hook de tema
│   └── use-supabase-auth.ts     # Hook Supabase
├── lib/
│   ├── supabase.ts              # Cliente Supabase
│   ├── auth-context.tsx         # Contexto de autenticação
│   ├── theme-provider.tsx       # Provider de tema
│   ├── utils.ts                 # Utilidades (cn)
│   └── _core/
│       ├── theme.ts             # Builder de tema
│       └── nativewind-pressable.ts
├── constants/
│   └── theme.ts                 # Exportação de tema
├── assets/
│   ├── images/
│   │   ├── icon.png             # App icon
│   │   ├── splash-icon.png      # Splash screen
│   │   ├── favicon.png          # Web favicon
│   │   ├── android-icon-foreground.png
│   │   ├── android-icon-background.png
│   │   └── android-icon-monochrome.png
│   └── fonts/
├── server/
│   ├── _core/
│   │   └── index.ts             # Backend server
│   ├── README.md                # Documentação backend
│   └── package.json
├── app.config.ts                # Configuração Expo
├── tailwind.config.js           # Configuração Tailwind
├── theme.config.js              # Paleta de cores
├── tsconfig.json                # Configuração TypeScript
├── package.json                 # Dependências
├── pnpm-lock.yaml               # Lock file
├── design.md                    # Especificações de design
├── todo.md                      # Checklist de features
└── README.md                    # Este arquivo
```

---

## 🔗 Integração com Supabase

### Variáveis de Ambiente Necessárias

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://seu-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima

# Opcional: Backend
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### Configuração de RLS

As tabelas devem ter as seguintes políticas RLS:

```sql
-- Exemplo: Política para tabela 'obreiros'
CREATE POLICY "Users can view their own obreiro data"
ON obreiros
FOR SELECT
USING (auth.uid() = user_id);

-- Exemplo: Política para tabela 'cultos_escalas'
CREATE POLICY "Users can view their own escalas"
ON cultos_escalas
FOR SELECT
USING (
  obreiro_id IN (
    SELECT id FROM obreiros WHERE user_id = auth.uid()
  )
);
```

### Edge Functions

O app utiliza as seguintes Edge Functions:

| Função | Endpoint | Descrição |
|--------|----------|-----------|
| `get-signed-url` | `/functions/v1/get-signed-url` | Gera URLs assinadas para documentos |
| `log-obreiro-login` | `/functions/v1/log-obreiro-login` | Registra login na auditoria |

---

## 🎯 Funcionalidades Implementadas

### ✅ Fase 1: Configuração Base
- [x] Design system com paleta eclesiástica
- [x] Fontes Playfair Display e Inter
- [x] Theme customizado com cores
- [x] Logo customizado

### ✅ Fase 2: Autenticação
- [x] Integração Supabase Auth
- [x] Tela de login
- [x] Proteção de rotas
- [x] Logout
- [ ] Autenticação biométrica
- [ ] Recuperação de senha

### ✅ Fase 3: Dashboard
- [x] Tela principal com saudação
- [x] Resumo de perfil
- [x] Próximas escalas
- [x] Documentos restritos
- [x] Avisos/Notícias

### ✅ Fase 4-7: Telas Principais
- [x] Escalas (lista completa)
- [x] Documentos (com categorias)
- [x] Notícias (feed)
- [x] Perfil (dados do obreiro)

### ✅ Fase 8: Assistente
- [x] Interface de chat
- [x] Histórico de conversa
- [ ] Integração com IA/LLM

### ✅ Fase 9: Navegação
- [x] Tab bar com 5 abas
- [x] Navegação entre telas
- [x] Ícones customizados
- [x] Componentes reutilizáveis

---

## 🚧 Funcionalidades Futuras

- [ ] **Autenticação Biométrica**: Face ID/Fingerprint
- [ ] **IA Assistente**: Integração com LLM para consultas
- [ ] **Download de Documentos**: Implementar download com URLs assinadas
- [ ] **Visualizador de PDF**: Integração com react-native-pdf
- [ ] **Notificações Push**: Expo Notifications
- [ ] **Sincronização Offline**: AsyncStorage + Supabase Sync
- [ ] **Edição de Perfil**: Formulário de atualização de dados
- [ ] **Filtros de Escalas**: Por data, tipo de culto, local
- [ ] **Detalhes de Notícia**: Página completa com conteúdo
- [ ] **Histórico de Escalas**: Últimas 10 escalas realizadas

---

## 🧪 Testes

### Executar Testes Unitários

```bash
pnpm test
```

### Testes de Integração

```bash
pnpm test:integration
```

### Cobertura de Testes

```bash
pnpm test:coverage
```

---

## 📊 Performance

### Otimizações Implementadas

- **Lazy Loading**: Telas carregadas sob demanda via Expo Router
- **Memoização**: Componentes otimizados com `React.memo`
- **FlatList**: Usado para listas em vez de ScrollView + map
- **Image Caching**: Expo Image com cache automático
- **Code Splitting**: Bundles separados por rota

### Métricas

- **Bundle Size**: ~2.5 MB (Android), ~3.2 MB (iOS)
- **Startup Time**: ~2-3 segundos
- **Memory**: ~80-120 MB em repouso

---

## 🐛 Troubleshooting

### Problema: "Cannot find module '@supabase/supabase-js'"

**Solução**: Reinstale as dependências
```bash
pnpm install
pnpm dev
```

### Problema: "EXPO_PUBLIC_SUPABASE_URL is not defined"

**Solução**: Configure as variáveis de ambiente no arquivo `.env.local`

### Problema: "Metro bundler error"

**Solução**: Limpe o cache e reinicie
```bash
pnpm dev --clear
```

### Problema: "Erro de autenticação no login"

**Solução**: Verifique:
1. Variáveis de ambiente corretas
2. Supabase project ativo
3. Email/CPF e senha corretos

---

## 📚 Recursos e Documentação

- **Expo**: https://docs.expo.dev
- **React Native**: https://reactnative.dev
- **Supabase**: https://supabase.com/docs
- **NativeWind**: https://www.nativewind.dev
- **Expo Router**: https://docs.expo.dev/routing/introduction/
- **TypeScript**: https://www.typescriptlang.org/docs/

---

## 🤝 Contribuindo

Para contribuir com o projeto:

1. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
2. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
3. Push para a branch (`git push origin feature/AmazingFeature`)
4. Abra um Pull Request

---

## 📄 Licença

Este projeto é propriedade da **Igreja Evangélica Assembleia de Deus em Abreu e Lima (IEADALPE)**.

Todos os direitos reservados © 2024 IEADALPE.

---

## 📞 Suporte

Para dúvidas, sugestões ou reportar bugs:

- **Email**: suporte@ieadalpe.com.br
- **WhatsApp**: (81) 9999-9999
- **GitHub Issues**: [Abrir issue](https://github.com/ieadalpe/app/issues)

---

## ✨ Créditos

**Desenvolvido com ❤️ para a comunidade IEADALPE**

- **Framework**: React Native + Expo
- **Backend**: Supabase
- **Design**: Paleta eclesiástica customizada
- **Ícones**: Material Icons (Expo Vector Icons)

---

**Versão**: 1.0.0  
**Última atualização**: 21 de Abril de 2026  
**Status**: Em desenvolvimento ativo
