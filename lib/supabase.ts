import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl.trim(), supabaseAnonKey.trim());

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      obreiros: {
        Row: {
          id: string;
          user_id: string;
          nome: string;
          funcao: string;
          telefone: string | null;
          data_nascimento: string | null;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          nome: string;
          funcao: string;
          telefone?: string | null;
          data_nascimento?: string | null;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          nome?: string;
          funcao?: string;
          telefone?: string | null;
          data_nascimento?: string | null;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      cultos_escalas: {
        Row: {
          id: string;
          data_culto: string;
          hora_inicio: string;
          tipo_culto: string;
          local: string;
          obreiro_id: string;
          funcao_escala: string;
          confirmado: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          data_culto: string;
          hora_inicio: string;
          tipo_culto: string;
          local: string;
          obreiro_id: string;
          funcao_escala: string;
          confirmado?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          data_culto?: string;
          hora_inicio?: string;
          tipo_culto?: string;
          local?: string;
          obreiro_id?: string;
          funcao_escala?: string;
          confirmado?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      escalas_itens: {
          Row: {
            area: string | null
            created_at: string
            culto_codigo: string | null
            culto_descricao: string | null
            data: string
            dia_semana: string | null
            escala_id: string
            funcao: string | null
            horario: string | null
            id: string
            igreja: string | null
            obreiro_id: string | null
            obreiro_nome: string | null
            obreiro_titulo: string | null
            observacoes: string | null
            pastor_area: string | null
            setor: string | null
          }
          Insert: {
            area?: string | null
            created_at?: string
            culto_codigo?: string | null
            culto_descricao?: string | null
            data: string
            dia_semana?: string | null
            escala_id: string
            funcao?: string | null
            horario?: string | null
            id?: string
            igreja?: string | null
            obreiro_id?: string | null
            obreiro_nome?: string | null
            obreiro_titulo?: string | null
            observacoes?: string | null
            pastor_area?: string | null
            setor?: string | null
          }
          Update: {
            area?: string | null
            created_at?: string
            culto_codigo?: string | null
            culto_descricao?: string | null
            data?: string
            dia_semana?: string | null
            escala_id?: string
            funcao?: string | null
            horario?: string | null
            id?: string
            igreja?: string | null
            obreiro_id?: string | null
            obreiro_nome?: string | null
            obreiro_titulo?: string | null
            observacoes?: string | null
            pastor_area?: string | null
            setor?: string | null
          }
          Relationships: [
            {
              foreignKeyName: "escalas_itens_escala_id_fkey"
              columns: ["escala_id"]
              isOneToOne: false
              referencedRelation: "cultos_escalas"
              referencedColumns: ["id"]
            },
          ]
       }
      
      noticias: {
        Row: {
          id: string;
          titulo: string;
          conteudo: string;
          resumo: string | null;
          imagem_url: string | null;
          publicado_em: string;
          criado_em: string;
          atualizado_em: string;
        };
        Insert: {
          id?: string;
          titulo: string;
          conteudo: string;
          resumo?: string | null;
          imagem_url?: string | null;
          publicado_em?: string;
          criado_em?: string;
          atualizado_em?: string;
        };
        Update: {
          id?: string;
          titulo?: string;
          conteudo?: string;
          resumo?: string | null;
          imagem_url?: string | null;
          publicado_em?: string;
          criado_em?: string;
          atualizado_em?: string;
        };
      };
    };
  };
};

