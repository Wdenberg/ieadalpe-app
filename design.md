# Design System - IEADALPE App

## Visão Geral
Aplicativo móvel para a Igreja Evangélica Assembleia de Deus em Abreu e Lima (IEADALPE), desenvolvido com foco em gestão de obreiros, escalas de culto e documentos restritos. O design segue padrões iOS HIG com orientação de retrato (9:16) e uso com uma mão.

---

## Paleta de Cores Eclesiástica

| Token | Cor | Uso |
|-------|-----|-----|
| **Primary (Vinho)** | `#8B3A3A` | Botões principais, destaques, CTA |
| **Secondary (Dourado)** | `#D4AF37` | Acentos, ícones especiais, destaque |
| **Tertiary (Verde)** | `#2D5016` | Sucesso, confirmações, status positivo |
| **Background (Bege)** | `#F5F1E8` | Fundo principal da app |
| **Surface (Branco)** | `#FFFFFF` | Cards, superfícies elevadas |
| **Text Primary** | `#1A1A1A` | Títulos, texto principal |
| **Text Secondary** | `#666666` | Subtítulos, texto secundário |
| **Border** | `#E5E0D5` | Divisores, bordas |

---

## Tipografia

- **Títulos (H1-H3):** Playfair Display, 28-32px (bold)
- **Subtítulos:** Playfair Display, 18-20px (semibold)
- **Corpo:** Inter, 14-16px (regular)
- **Labels:** Inter, 12-14px (medium)

---

## Telas Principais

### 1. **Login Screen**
- Campo de email/CPF
- Campo de senha
- Botão "Entrar" (primário)
- Link "Esqueceu a senha?"
- Logo IEADALPE centralizado
- Suporte para autenticação com biometria (Face ID/Fingerprint)

### 2. **Dashboard do Obreiro** (Tela Principal)
Conteúdo:
- Saudação personalizada ("Bem-vindo, [Nome]")
- Card de perfil resumido (foto, nome, função)
- Seção "Próximas Escalas" (lista com 3-5 próximos cultos)
- Seção "Documentos Restritos" (botão de download)
- Seção "Avisos/Notícias" (últimas 3 notícias)

### 3. **Tela de Escalas**
- Lista completa de escalas (cultos_escalas)
- Filtros: por data, por tipo de culto
- Card de escala com: data, hora, tipo, local, função do obreiro
- Botão de detalhes para ver mais informações

### 4. **Tela de Documentos**
- Lista de documentos disponíveis (com acesso via URL assinada)
- Categorias: Manuais, Escalas Impressas, Comunicados
- Botão de download que chama Edge Function `get-signed-url`
- Visualização de PDF inline

### 5. **Tela de Perfil**
- Dados do obreiro (nome, email, telefone, função)
- Foto de perfil
- Histórico de escalas (últimas 10)
- Botão de editar perfil
- Botão de logout

### 6. **Assistente do Obreiro** (IA)
- Chat interface simples
- Consultas sobre escalas, documentos, avisos
- Integração com Edge Functions para dados privados
- Histórico de conversa

### 7. **Tela de Notícias**
- Lista de notícias (tabela noticias)
- Card com: imagem, título, resumo, data
- Botão de ler completo
- Detalhe da notícia com conteúdo completo

---

## Fluxos de Usuário Principais

### Fluxo 1: Login
1. Usuário abre app → Tela de Login
2. Insere email/CPF e senha
3. Clica "Entrar"
4. Sistema valida com Supabase (SDK)
5. Log de acesso disparado (log-obreiro-login)
6. Redirecionado para Dashboard
7. Proteção de rota: se não autenticado, volta para Login

### Fluxo 2: Visualizar Escalas
1. Dashboard → Tapa em "Próximas Escalas" ou aba "Escalas"
2. Lista de escalas carrega (cultos_escalas)
3. Usuário tapa em escala específica
4. Detalhe da escala abre (data, hora, local, função)
5. Opção de adicionar ao calendário

### Fluxo 3: Download de Documento
1. Dashboard → Tapa em "Documentos Restritos"
2. Lista de documentos carrega
3. Usuário tapa em documento
4. Sistema chama Edge Function `get-signed-url`
5. URL temporária (TTL 1h) retorna
6. Documento abre em visualizador PDF
7. Opção de download para galeria

### Fluxo 4: Usar Assistente do Obreiro
1. Dashboard → Tapa em "Assistente" (ícone de chat)
2. Chat interface abre
3. Usuário digita pergunta (ex: "Qual minha próxima escala?")
4. Assistente chama Edge Functions para consultar dados
5. Resposta formatada retorna
6. Histórico de conversa persiste

---

## Componentes Reutilizáveis

| Componente | Uso |
|------------|-----|
| **Card** | Escalas, notícias, documentos |
| **Button** | Ações primárias (entrar, confirmar, download) |
| **Input** | Email, senha, busca |
| **ListItem** | Escalas, documentos, notícias |
| **Avatar** | Foto de perfil do obreiro |
| **Badge** | Status de escala (próxima, passada, confirmada) |
| **Modal** | Confirmações, detalhes |
| **Loader** | Carregamento de dados |
| **Toast** | Notificações (sucesso, erro) |

---

## Navegação

**Tab Bar (Bottom Navigation):**
1. Home (Dashboard)
2. Escalas
3. Documentos
4. Notícias
5. Perfil

**Estrutura de Rotas (Expo Router):**
```
app/
  _layout.tsx (Root + Providers)
  (tabs)/
    _layout.tsx (Tab Navigation)
    index.tsx (Dashboard)
    escalas.tsx (Escalas)
    documentos.tsx (Documentos)
    noticias.tsx (Notícias)
    perfil.tsx (Perfil)
  auth/
    login.tsx (Login)
    forgot-password.tsx (Recuperar Senha)
  assistente/
    [id].tsx (Chat do Assistente)
```

---

## Especificações de Segurança

1. **Autenticação:** Supabase SDK com proteção por `has_role`
2. **Armazenamento Local:** AsyncStorage para tokens (com refresh automático)
3. **URLs Assinadas:** Edge Function `get-signed-url` com TTL 1h para documentos
4. **Auditoria:** Função `log-obreiro-login` dispara em cada login
5. **Biometria:** Face ID/Fingerprint como autenticação secundária

---

## Especificações de Acessibilidade

- Contraste mínimo WCAG AA (4.5:1 para texto)
- Tamanho de toque mínimo: 44x44pt
- Suporte a leitura de tela (VoiceOver/TalkBack)
- Fontes legíveis em tamanhos pequenos
- Sem dependência exclusiva de cor para comunicar informação

---

## Próximas Fases (Não Prioritárias)

- Notificações push para escalas
- Sincronização offline com dados em cache
- Integração com calendário do dispositivo
- Relatórios de presença
- Edição de perfil
