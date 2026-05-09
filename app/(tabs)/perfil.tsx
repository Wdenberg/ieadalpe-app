import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  LogOut, Pencil, Camera, Trash2, MapPin,
  Phone, Mail, Hash, Calendar, ChevronRight,
  User
} from 'lucide-react-native';
import { decode } from 'base64-arraybuffer';

import { ScreenContainer } from '@/components/screen-container';
import { useAuth } from '@/lib/auth-context';
import { useColors } from '@/hooks/use-colors';
import { supabase } from '@/lib/supabase';
import { formatarTelefone } from '@/lib/formatterPhone';

// --- Types ---
type Funcao = "Pastor" | "Evangelista" | "Presbítero" | "Presbitero";

// --- Components Auxiliares ---
const InfoRow = ({ label, value, icon: Icon }: { label: string; value?: string; icon: any }) => (
  <View className="flex-row items-center py-4 border-b border-border/50">
    <View className="bg-primary/5 p-2.5 rounded-xl mr-4">
      <Icon size={20} color="#1e3a8a" />
    </View>
    <View className="flex-1">
      <Text className="text-[10px] text-muted uppercase font-bold tracking-widest">{label}</Text>
      <Text className="text-base text-foreground font-semibold leading-5">{value || '---'}</Text>
    </View>
  </View>
);

const EscalaMiniCard = ({ item, onPress }: { item: any; onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    className="bg-surface rounded-2xl p-4 border border-border mb-3 flex-row items-center"
  >
    <View className="bg-primary/10 h-12 w-12 rounded-xl items-center justify-center mr-4">
      <Text className="text-primary font-bold text-xs">
        {new Date(item.data).getDate()}
      </Text>
      <Text className="text-primary font-bold text-[8px] uppercase">
        {new Date(item.data).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
      </Text>
    </View>
    <View className="flex-1">
      <Text className="text-sm font-bold text-foreground" numberOfLines={1}>{item.culto_descricao}</Text>
      <Text className="text-xs text-muted" numberOfLines={1}>{item.igreja}</Text>
    </View>
    <ChevronRight size={16} color="#cbd5e1" />
  </TouchableOpacity>
);

export default function PerfilScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [obreiro, setObreiro] = useState<any>(null);
  const [escalas, setEscalas] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data: obreiroData } = await supabase
        .from('obreiros')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (obreiroData) {
        let displayUrl = null;
        if (obreiroData.foto_url) {
          const path = obreiroData.foto_url.replace('private://', '');
          const { data } = await supabase.storage.from('media-private').createSignedUrl(path, 3600);
          displayUrl = data?.signedUrl;
        }
        setObreiro({ ...obreiroData, displayUrl });

        const { data: escalasData } = await supabase
          .from('escalas_itens')
          .select('*')
          .eq('obreiro_id', obreiroData.id)
          .gte('data', new Date().toISOString().split('T')[0])
          .order('data', { ascending: true })
          .limit(3);

        setEscalas(escalasData || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpdatePhoto = async () => {

    if (!user || !obreiro) {
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      setUploading(true);

      const asset = result.assets[0];

      const response = await fetch(asset.uri);

      const arrayBuffer = await response.arrayBuffer();

      const filePath = `obreiros/${user.id}/${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('media-private')
        .upload(filePath, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      const photoUrl = `private://${filePath}`;

      const { error: updateError } = await supabase
        .from('obreiros')
        .update({
          foto_url: photoUrl,
        })
        .eq('id', obreiro.id);

      if (updateError) {
        throw updateError;
      }

      const { data } = await supabase.storage
        .from('media-private')
        .createSignedUrl(filePath, 3600);

      setObreiro((prev: any) => ({
        ...prev,
        foto_url: photoUrl,
        displayUrl: data?.signedUrl,
      }));

      Alert.alert('Sucesso', 'Foto atualizada!');
    } catch (err) {
      console.error('UPLOAD ERROR:', err);

      Alert.alert(
        'Erro',
        err instanceof Error
          ? err.message
          : 'Falha ao carregar imagem.'
      );
    } finally {
      setUploading(false);
    }
  };

  const getTitulo = (f: Funcao) => {
    const map = { Pastor: "Pr.", Evangelista: "Ev.", Presbítero: "Pb.", Presbitero: "Pb." };
    return map[f] || "";
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-0 bg-background">
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HEADER COM AVATAR */}
        <View className="bg-primary pt-16 pb-12 px-6 items-center rounded-b-[50px] shadow-2xl">
          <View className="relative">
            <View className="p-1.5 bg-white/30 rounded-full">
              {uploading ? (
                <View className="w-32 h-32 rounded-full bg-surface items-center justify-center">
                  <ActivityIndicator color={colors.primary} />
                </View>
              ) : obreiro?.displayUrl ? (
                <Image source={{ uri: obreiro.displayUrl }} className="w-32 h-32 rounded-full bg-muted border-4 border-white/20" />
              ) : (
                <View className="w-32 h-32 bg-surface rounded-full items-center justify-center border-4 border-white/20">
                  <User size={50} color={colors.primary} />
                </View>
              )}
            </View>

            <TouchableOpacity
              onPress={handleUpdatePhoto}
              className="absolute bottom-1 right-1 bg-white p-2.5 rounded-full shadow-xl active:scale-90 transition-all"
            >
              <Camera size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <Text className="text-2xl font-black text-white mt-5 text-center leading-tight">
            {getTitulo(obreiro?.funcao)} {obreiro?.nome}
          </Text>
          <View className="bg-white/20 px-4 py-1 rounded-full mt-2">
            <Text className="text-white text-[10px] font-black uppercase tracking-widest">
              {obreiro?.funcao}
            </Text>
          </View>
        </View>

        {/* CONTEÚDO */}
        <View className="px-6 -mt-8">
          <View className="bg-background rounded-[32px] p-6 shadow-sm border border-border/40">

            <Text className="text-lg font-black text-foreground mb-2">Informações Pessoais</Text>

            <InfoRow label="Matrícula" value={obreiro?.matricula} icon={Hash} />
            <InfoRow label="E-mail" value={user?.email} icon={Mail} />
            <InfoRow label="Telefone" value={obreiro?.telefone && formatarTelefone(obreiro.telefone)} icon={Phone} />
            <InfoRow label="Congregação" value={`${obreiro?.setor} - ${obreiro?.congregacao}`} icon={MapPin} />
            <InfoRow label="Data de Nascimento" value={obreiro?.data_nascimento && new Date(obreiro.data_nascimento).toLocaleDateString('pt-BR')} icon={Calendar} />

            {/* ESCALAS RECENTES */}
            <View className="mt-8">
              <View className="flex-row justify-between items-end mb-4">
                <Text className="text-lg font-black text-foreground">Agenda Recente</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/escalas')}>
                  <Text className="text-xs font-bold text-primary">Ver todas</Text>
                </TouchableOpacity>
              </View>

              {escalas.length > 0 ? (
                escalas.map(item => (
                  <EscalaMiniCard key={item.id} item={item} onPress={() => router.push(`/(tabs)/escalas`)} />
                ))
              ) : (
                <View className="bg-muted/20 rounded-2xl p-6 items-center border border-dashed border-border">
                  <Text className="text-muted text-xs italic">Nenhuma escala para os próximos dias.</Text>
                </View>
              )}
            </View>

            {/* BOTÕES DE AÇÃO */}
            <View className="mt-10 gap-4 pb-10">
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/perfil/editar')}
                className="flex-row items-center justify-center bg-primary h-14 rounded-2xl shadow-lg shadow-primary/30"
              >
                <Pencil size={20} color="white" />
                <Text className="ml-3 font-black text-white uppercase tracking-widest text-xs">Editar Dados</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={signOut}
                className="flex-row items-center justify-center h-14 rounded-2xl border border-red-100"
              >
                <LogOut size={20} color="#ef4444" />
                <Text className="ml-3 font-bold text-red-500 text-xs uppercase tracking-widest">Encerrar Sessão</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}