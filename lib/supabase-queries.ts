import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

/**
 * Queries para tabela profiles com RLS
 */
export const profileQueries = {
  /**
   * Obter perfil do usuário autenticado (RLS garante acesso apenas ao próprio perfil)
   */
  getProfile: async (userId: string) => {
    return supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
  },

  /**
   * Atualizar perfil do usuário (RLS garante acesso apenas ao próprio perfil)
   */
  updateProfile: async (userId: string, updates: Partial<Database['public']['Tables']['profiles']['Update']>) => {
    return supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
  },
};

/**
 * Queries para tabela obreiros com RLS
 */
export const obreiroQueries = {
  /**
   * Obter dados do obreiro autenticado (RLS garante acesso apenas ao próprio obreiro)
   */
  getObreiro: async (userId: string) => {
    return supabase
      .from('obreiros')
      .select('*')
      .eq('user_id', userId)
      .single();
  },

  /**
   * Atualizar dados do obreiro (RLS garante acesso apenas ao próprio obreiro)
   */
  updateObreiro: async (obreiroId: string, updates: Partial<Database['public']['Tables']['obreiros']['Update']>) => {
    return supabase
      .from('obreiros')
      .update(updates)
      .eq('id', obreiroId)
      .select()
      .single();
  },

  /**
   * Listar obreiros (com RLS, apenas admin pode ver todos)
   */
  listObreiros: async () => {
    return supabase
      .from('obreiros')
      .select('*')
      .order('nome', { ascending: true });
  },
};

/**
 * Queries para tabela cultos_escalas com RLS
 */
export const escalasQueries = {
  /**
   * Obter escalas do obreiro autenticado (RLS garante acesso apenas às próprias escalas)
   */
  getMinhasEscalas: async (obreiroId: string) => {
    return supabase
      .from('cultos_escalas')
      .select('*')
      .eq('obreiro_id', obreiroId)
      .order('data_culto', { ascending: true });
  },

  /**
   * Obter próximas escalas (próximos 30 dias)
   */
  getProximasEscalas: async (obreiroId: string, dias: number = 30) => {
    const hoje = new Date().toISOString().split('T')[0];
    const futuro = new Date(Date.now() + dias * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return supabase
      .from('cultos_escalas')
      .select('*')
      .eq('obreiro_id', obreiroId)
      .gte('data_culto', hoje)
      .lte('data_culto', futuro)
      .order('data_culto', { ascending: true });
  },

  /**
   * Confirmar presença em escala
   */
  confirmarEscala: async (escalaId: string) => {
    return supabase
      .from('cultos_escalas')
      .update({ confirmado: true })
      .eq('id', escalaId)
      .select()
      .single();
  },

  /**
   * Desconfirmar presença em escala
   */
  desconfirmarEscala: async (escalaId: string) => {
    return supabase
      .from('cultos_escalas')
      .update({ confirmado: false })
      .eq('id', escalaId)
      .select()
      .single();
  },

  /**
   * Obter detalhes de uma escala específica
   */
  getEscalaDetalhes: async (escalaId: string) => {
    return supabase
      .from('cultos_escalas')
      .select('*')
      .eq('id', escalaId)
      .single();
  },
};

/**
 * Queries para tabela noticias (públicas)
 */
export const noticiasQueries = {
  /**
   * Listar todas as notícias (públicas)
   */
  listNoticias: async (limite: number = 20, offset: number = 0) => {
    return supabase
      .from('noticias')
      .select('*')
      .order('publicado_em', { ascending: false })
      .range(offset, offset + limite - 1);
  },

  /**
   * Obter notícia específica
   */
  getNoticia: async (noticiaId: string) => {
    return supabase
      .from('noticias')
      .select('*')
      .eq('id', noticiaId)
      .single();
  },

  /**
   * Buscar notícias por título ou conteúdo
   */
  searchNoticias: async (termo: string) => {
    return supabase
      .from('noticias')
      .select('*')
      .or(`titulo.ilike.%${termo}%,conteudo.ilike.%${termo}%`)
      .order('publicado_em', { ascending: false });
  },

  /**
   * Obter últimas N notícias
   */
  getUltimasNoticias: async (limite: number = 5) => {
    return supabase
      .from('noticias')
      .select('*')
      .order('publicado_em', { ascending: false })
      .limit(limite);
  },
};

/**
 * Queries para documentos (com URLs assinadas)
 */
export const documentosQueries = {
  /**
   * Obter URL assinada para documento (via Edge Function)
   */
  getSignedUrl: async (caminhoDocumento: string, ttl: number = 3600) => {
    return supabase.functions.invoke('get-signed-url', {
      body: {
        path: caminhoDocumento,
        ttl: ttl,
      },
    });
  },

  /**
   * Registrar download de documento
   */
  registrarDownload: async (documentoId: string, obreiroId: string) => {
    return supabase
      .from('downloads_documentos')
      .insert({
        documento_id: documentoId,
        obreiro_id: obreiroId,
        data_download: new Date().toISOString(),
      });
  },
};

/**
 * Queries para auditoria
 */
export const auditoriaQueries = {
  /**
   * Registrar ação de auditoria
   */
  registrarAcao: async (acao: string, detalhes?: Record<string, any>) => {
    return supabase.functions.invoke('log-obreiro-login', {
      body: {
        action: acao,
        details: detalhes,
      },
    });
  },
};
