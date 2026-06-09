import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";


interface Noticia {
  id: string;
  autor_nome: string;
  titulo: string;
  resumo?: string;
  imagem_url?: string;
  created_at: string;
}

export const noticiasService = {
  async getTodas() {
    const { data, error } = await supabase
      .from('noticias')
      .select('id, autor_nome, titulo, resumo, imagem_url, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  inscreverEmNovasNoticias(onNewNoticias: (noticia: Noticia) => void): RealtimeChannel{
    return supabase.channel('noticias_realtime').on(
      'postgres_changes',
      {event: 'INSERT', schema: 'public', table: 'noticias'},
      (payload) =>{
        const newNotocia = payload.new as Noticia;
        onNewNoticias(newNotocia)
      }
    ).subscribe((status, err) =>{
      if(err) console.error('Erro no Realtime de Noticias', err)
    })
  }
};