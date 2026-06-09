import { supabase } from '@/lib/supabase';

export interface EscalaResumo {
  id: string;
  nome: string;
  data_inicio: string;
  data_fim: string;
  atual: boolean;
}

export interface NoticiaResumo {
  id: string;
  autor_nome: string;
  titulo: string;
  resumo?: string;
  imagem_url?: string;
  created_at: string;
}

export interface ObreiroData {
  id: string;
  nome: string;
  funcao: string;
  foto_url: string | null;
}

export interface DashboardData {
  obreiro: ObreiroData | null;
  escalas: EscalaResumo[];
  noticias: NoticiaResumo[];
}

export const dashboardService = {
  async getDashboardData(userId: string): Promise<DashboardData> {
    // 🔥 Correção do fuso horário para a data local
    const hojeDate = new Date();
    const ano = hojeDate.getFullYear();
    const mes = String(hojeDate.getMonth() + 1).padStart(2, '0');
    const dia = String(hojeDate.getDate()).padStart(2, '0');
    const hojeLocal = `${ano}-${mes}-${dia}`;

    try {
      // 1. Buscar Obreiro
      const { data: obreiroData, error: obreiroError } = await supabase
        .from('obreiros')
        .select('id, nome, funcao, foto_url')
        .eq('user_id', userId)
        .single();

      if (obreiroError && obreiroError.code !== 'PGRST116') {
        throw obreiroError;
      }

      let obreiro: ObreiroData | null = null;

      if (obreiroData) {
        let finalUrl = null;
        if (obreiroData.foto_url) {
          const path = obreiroData.foto_url.replace('private://', '').trim();
          const { data: signedData } = await supabase.storage
            .from('media-private')
            .createSignedUrl(path, 3600);
          finalUrl = signedData?.signedUrl;
        }
        obreiro = { ...obreiroData, foto_url: finalUrl ?? null };
      }

      // 2. Buscar Próximas Escalas
      const { data: escalasData, error: escalasError } = await supabase
        .from('cultos_escalas')
        .select('*')
        .gte('data_fim', hojeLocal)
        .order('data_inicio', { ascending: true })
        .limit(2);

      if (escalasError) throw escalasError;

      // 3. Buscar Últimas Notícias
      const { data: noticiasData, error: noticiasError } = await supabase
        .from('noticias')
        .select('id, autor_nome, titulo, resumo, imagem_url, created_at')
        .order('created_at', { ascending: false })
        .limit(2);

      if (noticiasError) throw noticiasError;

      return {
        obreiro,
        escalas: (escalasData as EscalaResumo[]) || [],
        noticias: (noticiasData as NoticiaResumo[]) || [],
      };
    } catch (error) {
      console.error('Erro no DashboardService:', error);
      throw error;
    }
  }
};