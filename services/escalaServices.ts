import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";


export interface Escala {
  id: string;
  nome: string;
  data_inicio: string;
  data_fim: string;
  arquivo_url: string;
  atual: boolean;
  created_at: string;
}

export interface ItemEscala {
  id: string;
  data: string;
  horario: string;
  igreja: string;
  culto_descricao: string;
  pastor_area: string;
  dia_semana: string;   // Adicionado com base no log
  funcao: string;       // Adicionado com base no log
  obreiro_nome: string; // Adicionado com base no log
}

interface DadosEscalasResponse {
  escalasGerais: Escala[];
  minhasEscalas: ItemEscala[]
}

export const escalaService = {
  async getDadosEscalas(userId: string): Promise<DadosEscalasResponse>{

    const escalasGeraisPromise =  supabase
    .from('cultos_escalas')
    .select('*')
    .order('created_at', {ascending: false})


    const obreiroPromise = supabase
    .from('obreiros')
    .select('id')
    .eq('user_id', userId)
    .single();

    const [escalasResul, obreiroResult] = await Promise.all([
      escalasGeraisPromise,
      obreiroPromise,
    ]);

    if(escalasResul.error) throw escalasResul.error;

    let minhasEscalas: ItemEscala[] = [];

    

    if(obreiroResult.data){
      const hojeDate = new Date();
      const ano = hojeDate.getFullYear();
      const mes = String(hojeDate.getMonth() +1).padStart(2, '0');
      const dia = String(hojeDate.getDate()).padStart(2, '0');

      const hoje = `${ano}-${mes}-${dia}`;


      

      const {data: itens, error: itensError} = await supabase
      .from('escalas_itens')
      .select('*')
      .eq('obreiro_id', obreiroResult.data.id)
     .gte('data', hoje)
      .order('data', {ascending: true});

      if(itensError) throw itensError;
      
      minhasEscalas = (itens as ItemEscala[]) || [];
    }
    
   return{
    escalasGerais: (escalasResul.data as Escala[]) || [],
    minhasEscalas,
   };
  },

  inscreverEmNovasEscalas(onNewEscala: (escala: Escala) => void): RealtimeChannel{
    return supabase
    .channel('public:cultos_escalas')
    .on(
      'postgres_changes',
      {event: 'INSERT', schema: 'public', table: 'cultos_escalas'},
      (payload) =>{
        onNewEscala(payload.new as Escala);
      }
    )
    .subscribe((status, err) =>{
      if(err) console.error('Erro de Conexão no Realtime de Escalas: ', err)
    });
  }
}