# IEADALPE App - TODO List

## Fase 1: Configuração Base
- [x] Configurar design system com paleta de cores eclesiástica (Vinho, Dourado, Verde, Bege)
- [x] Importar fontes Playfair Display e Inter
- [x] Atualizar theme.config.js com cores customizadas
- [x] Atualizar app.config.ts com nome e logo da IEADALPE

## Fase 2: Autenticação
- [x] Integrar SDK Supabase para login
- [x] Criar tela de Login com email/CPF e senha
- [x] Implementar proteção de rotas baseada em has_role (admin/obreiro)
- [x] Implementar autenticação com biometria (Face ID/Fingerprint)
- [x] Disparar função log-obreiro-login ao fazer login
- [x] Implementar logout
- [x] Criar tela de "Esqueceu a Senha"

## Fase 3: Dashboard do Obreiro
- [x] Criar tela Dashboard com saudação personalizada
- [x] Implementar card de perfil resumido (foto, nome, função)
- [x] Implementar seção "Próximas Escalas" (listar cultos_escalas)
- [x] Implementar seção "Documentos Restritos" com botão de download
- [x] Implementar seção "Avisos/Notícias" (últimas 3 notícias)
- [x] Conectar ao Supabase para buscar dados de obreiros

## Fase 4: Tela de Escalas
- [x] Criar tela de Escalas com lista completa
- [x] Implementar filtros (por data, por tipo de culto)
- [x] Criar card de escala com informações (data, hora, tipo, local, função)
- [x] Implementar detalhe de escala
- [x] Integrar com tabela cultos_escalas

## Fase 5: Tela de Documentos
- [x] Criar tela de Documentos com lista categorizada
- [x] Implementar integração com Edge Function get-signed-url
- [x] Implementar download de documentos
- [x] Implementar visualizador de PDF inline
- [x] Criar categorias: Manuais, Escalas Impressas, Comunicados

## Fase 6: Tela de Notícias
- [x] Criar tela de Notícias com lista
- [x] Implementar card de notícia (imagem, título, resumo, data)
- [ ] Implementar detalhe de notícia com conteúdo completo
- [x] Integrar com tabela noticias

## Fase 7: Tela de Perfil
- [x] Criar tela de Perfil com dados do obreiro
- [ ] Implementar exibição de foto de perfil
- [ ] Implementar histórico de escalas (últimas 10)
- [ ] Implementar botão de editar perfil
- [x] Implementar botão de logout

## Fase 8: Assistente do Obreiro (IA) - FUTURO
- [ ] Criar interface de chat simples
- [ ] Implementar integração com Edge Functions para consultas
- [ ] Implementar respostas sobre escalas, documentos, avisos
- [ ] Implementar histórico de conversa
- [ ] Integrar com LLM para processamento de linguagem natural

## Fase 9: Navegação e UI
- [x] Criar tab bar com 5 abas (Home, Escalas, Documentos, Notícias, Perfil)
- [x] Implementar navegação entre telas
- [x] Implementar ícones customizados para tabs
- [x] Criar componentes reutilizáveis (Card, Button, Input, Avatar, Badge, Modal, Loader, Toast)
- [x] Implementar feedback visual (press states, loading indicators)

## Fase 10: Integração Supabase
- [ ] Configurar cliente Supabase no app
- [ ] Implementar queries para tabela profiles
- [ ] Implementar queries para tabela obreiros
- [ ] Implementar queries para tabela cultos_escalas
- [ ] Implementar queries para tabela noticias
- [ ] Implementar RLS (Row Level Security) no cliente
- [ ] Testar autenticação e autorização

## Fase 11: Segurança e Auditoria
- [ ] Implementar proteção de rotas por função
- [ ] Implementar armazenamento seguro de tokens (SecureStore)
- [ ] Implementar refresh automático de tokens
- [ ] Implementar auditoria de login (log-obreiro-login)
- [ ] Testar segurança de URLs assinadas

## Fase 12: Testes e Polimento
- [ ] Testar fluxo de login
- [ ] Testar visualização de escalas
- [ ] Testar download de documentos
- [ ] Testar chat do assistente
- [ ] Testar em iOS e Android
- [ ] Testar modo escuro/claro
- [ ] Verificar acessibilidade (contraste, tamanho de toque)

## Fase 13: Entrega
- [ ] Criar checkpoint final
- [ ] Gerar APK/IPA para testes
- [ ] Documentar instruções de uso
- [ ] Entregar projeto ao usuário


## Fase 11: Novas Features Solicitadas
- [x] Criar tela NoticiaDetalhe com conteúdo completo
- [x] Implementar navegação para detalhe de notícia
- [x] Exibir imagem em tamanho maior
- [x] Mostrar conteúdo completo da notícia


## Fase 12: Atualização de Design - Paleta de Cores Oficial
- [x] Atualizar theme.config.js com cores oficiais (Vinho #5A0A0A, Bege #F4E6D2, Verde #2F6F55, Dourado #E8A430)
- [x] Atualizar tailwind.config.js com nova paleta
- [ ] Revisar e atualizar todas as telas com novas cores
- [ ] Testar consistência de cores em todos os componentes
- [x] Atualizar design.md com nova paleta
