import { supabase } from "@/lib/supabase"; // Ajuste o caminho conforme seu projeto
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface Documento {
  id: string;
  titulo: string;
  tipo: string;
  arquivo_url: string;
  created_at: string;
  descricao?: string;
  visibilidade: string;
}

export interface CategoriaDocumento {
  categoria: string;
  docs: Documento[];
}

export const documentoService = {
  // --- BUSCA DE DADOS ---
  async getDocumentos(): Promise<Documento[]> {
    const { data, error } = await supabase
      .from('documentos')
      .select('id, titulo, tipo, arquivo_url, created_at, descricao, visibilidade')
      .in('visibilidade', ['obreiros', 'publico'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as Documento[]) || [];
  },

  // --- LÓGICA DE CATEGORIZAÇÃO ---
  categorizarDocumentos(documentos: Documento[]): CategoriaDocumento[] {
    return documentos.reduce((acc, doc) => {
      const existing = acc.find((item) => item.categoria === doc.tipo);
      if (existing) {
        existing.docs.push(doc);
      } else {
        acc.push({ categoria: doc.tipo, docs: [doc] });
      }
      return acc;
    }, [] as CategoriaDocumento[]);
  },

  // --- HELPERS (URL ASSINADA) ---
  async getSignedUrl(path: string): Promise<string | null> {
    const cleanPath = path.replace('private://', '').trim();
    const { data, error } = await supabase.storage
      .from('media-private')
      .createSignedUrl(cleanPath, 3600);

    if (error) {
      console.error('Erro ao gerar URL assinada:', error);
      return null;
    }
    return data?.signedUrl || null;
  },

  // --- NOTIFICAÇÕES & REALTIME ---
  inscreverEmNovosDocumentos(onNovoDocumento: (doc: Documento) => void): RealtimeChannel {
    return supabase
      .channel('documentos_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'documentos' },
        (payload) => {
          const novoDoc = payload.new as Documento;
          
          // O serviço filtra e só avisa a tela se for visível para obreiros/público
          if (['obreiros', 'publico'].includes(novoDoc.visibilidade)) {
            onNovoDocumento(novoDoc);
          }
        }
      )
      .subscribe((status, err) => {
        if (err) console.error('Erro de Conexão no Realtime de Documentos: ', err);
      });
  }
};