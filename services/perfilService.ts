import { supabase } from "@/lib/supabase"
import { aw } from "vitest/dist/chunks/reporters.nr4dxCkA.js";

export const perfilObreiroService ={
  async getPerfilCompleto(userId: String){
    const {data: obreiroData, error: obreiroError} = await supabase
    .from('obreiros').select('*').eq('user_id', userId).single();

    if(obreiroError) throw obreiroError;
    if(!obreiroData) return null;

    const photoPromise = obreiroData.foto_url ? 
    supabase.storage.from('media-private')
    .createSignedUrl(obreiroData.foto_url.replace('private://', ''), 3600) : Promise.resolve({data: null, error: null});

    const hoje = new Date().toISOString().split('T')[0];
    const escalasPromise = supabase
    .from('escalas_itens')
    .select('*')
    .eq('obreiro_id', obreiroData.id)
    .gte('data', hoje)
    .order('data', {ascending: true})
    .limit(3)

    const [photoResult, escalasResult] = await Promise.all([
      photoPromise,
      escalasPromise,
    ]);

    if(escalasResult.error) throw escalasResult.error;

    return{ 
      obreiro: {...obreiroData, displayUrl: photoResult.data?.signedUrl || null},
      escalas: escalasResult.data || [],
    };
  },

  async updatePhotoPerfil(userId: string, obreiroId: string, arrayBuffer: ArrayBuffer){
    const filePath = `obreiros/${userId}/${Date.now()}.jpg`;

    const {error: uploadError} = await supabase.storage
    .from('media-private')
    .upload(filePath, arrayBuffer, {
      contentType: 'image/jpeg',
      upsert: true
    });

    if(uploadError) throw uploadError;

    const photoUrl = `private://${filePath}`;

    const {error : updateError} = await supabase
    .from('obreiros')
    .update({foto_url: photoUrl})
    .eq('id', obreiroId);

    if(updateError) throw updateError;

    const {data: signedData, error: signedError} =await supabase.storage
    .from('media-private')
    .createSignedUrl(filePath, 3600);

    if(signedError) throw signedError;

    return{
      photoUrl,
      displayUrl: signedData.signedUrl || null
    };
  }

};