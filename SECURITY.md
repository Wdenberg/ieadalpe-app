# Segurança e RLS - IEADALPE App

## Visão Geral

Este documento descreve as implementações de segurança e Row Level Security (RLS) do aplicativo IEADALPE.

## 1. Autenticação e Autorização

### 1.1 Fluxo de Autenticação

```
Usuário → Login (email/CPF + senha) → Supabase Auth → JWT Token → App
                                                           ↓
                                                    SecureStore (iOS/Android)
```

### 1.2 Proteção de Rotas

- **Rotas Públicas**: `/auth/login`, `/auth/forgot-password`
- **Rotas Protegidas**: `/(tabs)/*` - Requer autenticação
- **Verificação**: `AuthProvider` valida sessão em tempo real

### 1.3 Roles de Usuário

```typescript
type UserRole = 'admin' | 'obreiro';

// Armazenado em user_metadata ou app_metadata do Supabase Auth
user.app_metadata.role === 'admin' // Acesso total
user.app_metadata.role === 'obreiro' // Acesso limitado
```

## 2. Row Level Security (RLS)

### 2.1 Políticas de RLS por Tabela

#### Tabela: `profiles`
```sql
-- Usuário pode ler apenas seu próprio perfil
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Usuário pode atualizar apenas seu próprio perfil
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);
```

#### Tabela: `obreiros`
```sql
-- Obreiro pode ler seus próprios dados
CREATE POLICY "Obreiros can read own data"
ON obreiros FOR SELECT
USING (auth.uid() = user_id);

-- Obreiro pode atualizar seus próprios dados
CREATE POLICY "Obreiros can update own data"
ON obreiros FOR UPDATE
USING (auth.uid() = user_id);

-- Admin pode ler todos os dados
CREATE POLICY "Admin can read all obreiros"
ON obreiros FOR SELECT
USING (
  auth.jwt() ->> 'role' = 'admin'
);
```

#### Tabela: `cultos_escalas`
```sql
-- Obreiro pode ler apenas suas escalas
CREATE POLICY "Obreiros can read own escalas"
ON cultos_escalas FOR SELECT
USING (
  obreiro_id IN (
    SELECT id FROM obreiros WHERE user_id = auth.uid()
  )
);

-- Obreiro pode atualizar confirmação de suas escalas
CREATE POLICY "Obreiros can update own escalas"
ON cultos_escalas FOR UPDATE
USING (
  obreiro_id IN (
    SELECT id FROM obreiros WHERE user_id = auth.uid()
  )
);
```

#### Tabela: `noticias`
```sql
-- Todos podem ler notícias (públicas)
CREATE POLICY "Anyone can read noticias"
ON noticias FOR SELECT
USING (true);

-- Apenas admin pode criar/atualizar/deletar
CREATE POLICY "Admin can manage noticias"
ON noticias FOR ALL
USING (auth.jwt() ->> 'role' = 'admin');
```

### 2.2 Verificação de RLS no Cliente

```typescript
// lib/supabase-queries.ts
export const obreiroQueries = {
  getObreiro: async (userId: string) => {
    // RLS garante que apenas o próprio usuário pode acessar
    return supabase
      .from('obreiros')
      .select('*')
      .eq('user_id', userId)
      .single();
  },
};
```

## 3. Armazenamento Seguro de Tokens

### 3.1 SecureStore (iOS/Android)

```typescript
// hooks/use-secure-token.ts
import * as SecureStore from 'expo-secure-store';

// Salvar token de forma segura
await SecureStore.setItemAsync('supabase_token', accessToken);

// Recuperar token
const token = await SecureStore.getItemAsync('supabase_token');

// Limpar ao fazer logout
await SecureStore.deleteItemAsync('supabase_token');
```

### 3.2 Ciclo de Vida do Token

1. **Login**: Token salvo em SecureStore
2. **Refresh Automático**: Token renovado 5 minutos antes da expiração
3. **Logout**: Token removido de SecureStore
4. **Expiração**: Sessão finalizada automaticamente

## 4. Refresh Automático de Tokens

### 4.1 Implementação

```typescript
// lib/auth-context.tsx
const setupTokenRefresh = (session: Session) => {
  const expiresAt = session.expires_at * 1000;
  const now = Date.now();
  const timeUntilExpiry = expiresAt - now - 5 * 60 * 1000; // 5 min antes

  setTimeout(async () => {
    const { data } = await supabase.auth.refreshSession();
    if (data.session) {
      // Salvar novo token
      await saveAccessToken(data.session.access_token);
      // Configurar novo refresh
      setupTokenRefresh(data.session);
    }
  }, timeUntilExpiry);
};
```

## 5. Auditoria de Login

### 5.1 Log de Acesso

```typescript
// app/auth/login.tsx
const handleLogin = async () => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (!error) {
    // Disparar Edge Function para registrar login
    await supabase.functions.invoke('log-obreiro-login', {
      body: { action: 'login' },
    });
  }
};
```

### 5.2 Dados Registrados

- Timestamp do login
- IP do usuário
- Tipo de autenticação (email/biometria)
- User ID
- Plataforma (iOS/Android/Web)

## 6. URLs Assinadas para Documentos

### 6.1 Fluxo de Acesso a Documentos

```
Usuário → Clica em "Baixar" → Edge Function get-signed-url
                                      ↓
                              Valida permissões (RLS)
                                      ↓
                              Gera URL assinada (TTL 1h)
                                      ↓
                              Retorna URL → Download
```

### 6.2 Implementação

```typescript
// lib/supabase-queries.ts
export const documentosQueries = {
  getSignedUrl: async (caminhoDocumento: string, ttl: number = 3600) => {
    return supabase.functions.invoke('get-signed-url', {
      body: {
        path: caminhoDocumento,
        ttl: ttl, // 1 hora
      },
    });
  },
};
```

## 7. Proteção por Função (Role-Based Access Control)

### 7.1 Verificação de Role

```typescript
// Componentes podem verificar role do usuário
const { userRole } = useAuth();

if (userRole === 'admin') {
  // Mostrar opções de admin
} else if (userRole === 'obreiro') {
  // Mostrar opções de obreiro
}
```

### 7.2 Proteção de Endpoints

```typescript
// Edge Functions verificam role
const { data: { user } } = await supabase.auth.getUser();
const role = user?.app_metadata?.role;

if (role !== 'admin') {
  throw new Error('Acesso negado');
}
```

## 8. Boas Práticas de Segurança

### 8.1 Checklist de Segurança

- ✅ Tokens armazenados em SecureStore
- ✅ RLS ativado em todas as tabelas
- ✅ Refresh automático de tokens
- ✅ Auditoria de login
- ✅ URLs assinadas com TTL
- ✅ Proteção de rotas por autenticação
- ✅ Validação de role em Edge Functions
- ✅ HTTPS em todas as comunicações

### 8.2 Recomendações

1. **Nunca** armazene tokens em AsyncStorage
2. **Sempre** valide permissões no servidor (Edge Functions)
3. **Configure** RLS em todas as tabelas
4. **Implemente** auditoria de ações críticas
5. **Use** HTTPS para todas as comunicações
6. **Rotacione** secrets regularmente
7. **Monitore** logs de acesso

## 9. Testando Segurança

### 9.1 Testes de RLS

```bash
# Testar acesso não autorizado
curl -H "Authorization: Bearer INVALID_TOKEN" \
  https://api.supabase.com/rest/v1/obreiros

# Esperado: 401 Unauthorized
```

### 9.2 Testes de URLs Assinadas

```bash
# Testar URL expirada
curl https://storage.supabase.com/file?token=abc&expires=PAST_TIME

# Esperado: 403 Forbidden
```

## 10. Referências

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/)
- [OWASP Mobile Security](https://owasp.org/www-project-mobile-security/)
