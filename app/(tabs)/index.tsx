import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Image, StatusBar } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useAuth } from '@/lib/auth-context';
import { EscalaCard } from '@/components/escala-card';
import { NoticiaCard } from '@/components/noticia-card';
import { useColors } from '@/hooks/use-colors';
import { supabase } from '@/lib/supabase';
import { Bell, Calendar, FileText, ChevronRight, User as UserIcon } from 'lucide-react-native';

// --- Interfaces ---
interface Escala {
  id: string;
  nome: string;
  data_inicio: string;
  data_fim: string;
  atual: boolean;
}

interface Noticia {
  id: string;
  autor_nome: string;
  titulo: string;
  resumo?: string;
  imagem_url?: string;
  created_at: string;
}

interface ObreiroData {
  id: string;
  nome: string;
  funcao: string;
  foto_url: string | null;
}

export default function DashboardScreen() {
  const router = useRouter();
  const colors = useColors();
  const { user } = useAuth();

  const [obreiro, setObreiro] = useState<ObreiroData | null>(null);
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    const ToDay = new Date().toISOString().split('T')[0];

    try {
      // 1. Dados do Obreiro + Foto Assinada
      const { data: obreiroData } = await supabase
        .from('obreiros')
        .select('id, nome, funcao, foto_url')
        .eq('user_id', user.id)
        .single();

      if (obreiroData) {
        let finalUrl = null;
        if (obreiroData.foto_url) {
          const path = obreiroData.foto_url.replace('private://', '');
          const { data: signedData } = await supabase.storage
            .from('media-private')
            .createSignedUrl(path, 3600);
          finalUrl = signedData?.signedUrl;
        }
        setObreiro({ ...obreiroData, foto_url: finalUrl ?? null });
      }

      // 2. Próximas Escalas
      const { data: escalasData } = await supabase
        .from('cultos_escalas')
        .select('*')
        .gte('data_fim', ToDay)
        .order('data_inicio', { ascending: true })
        .limit(2);

      setEscalas(escalasData || []);

      // 3. Últimas Notícias
      const { data: noticiasData } = await supabase
        .from('noticias')
        .select('id, autor_nome, titulo, resumo, imagem_url, created_at')
        .order('created_at', { ascending: false })
        .limit(2);

      setNoticias(noticiasData || []);
    } catch (error) {
      console.error('Dashboard Error:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-0 bg-background">
      <StatusBar barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* --- HEADER MODERNIZADO --- */}
        <View className="bg-primary pt-16 pb-10 px-6 rounded-b-[50px] shadow-2xl">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-white/60 text-xs font-bold uppercase tracking-[2px]">Paz do Senhor,</Text>
              <Text className="text-white text-2xl font-black">{obreiro?.nome?.split(' ')[0] || 'Obreiro'}</Text>
              <View className="bg-white/20 self-start px-3 py-0.5 rounded-full mt-1">
                <Text className="text-white text-[10px] font-bold uppercase">{obreiro?.funcao || 'Membro'}</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => router.push('/(tabs)/perfil')}
              className="border-2 border-white/30 rounded-full p-1"
            >
              {obreiro?.foto_url ? (
                <Image source={{ uri: obreiro.foto_url }} className="w-14 h-14 rounded-full" />
              ) : (
                <View className="w-14 h-14 bg-white/20 rounded-full items-center justify-center">
                  <UserIcon size={24} color="white" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Cards de Resumo Rápidos */}
          <View className="flex-row gap-3 mt-8">
            <View className="flex-1 bg-white/10 rounded-2xl p-3 flex-row items-center">
              <Calendar size={18} color="white" />
              <View className="ml-3">
                <Text className="text-white font-bold">{escalas.length}</Text>
                <Text className="text-white/50 text-[8px] uppercase font-bold">Escalas</Text>
              </View>
            </View>
            <View className="flex-1 bg-white/10 rounded-2xl p-3 flex-row items-center">
              <Bell size={18} color="white" />
              <View className="ml-3">
                <Text className="text-white font-bold">{noticias.length}</Text>
                <Text className="text-white/50 text-[8px] uppercase font-bold">Avisos</Text>
              </View>
            </View>
          </View>
        </View>

        {/* --- CORPO --- */}
        <View className="px-6 mt-8 gap-8">

          {/* SEÇÃO: ESCALAS */}
          <View>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-black text-foreground tracking-tight">Suas Escalas</Text>
              <Link href="/(tabs)/escalas" asChild>
                <TouchableOpacity className="flex-row items-center">
                  <Text className="text-primary font-bold text-xs mr-1">Ver todas</Text>
                  <ChevronRight size={14} color={colors.primary} />
                </TouchableOpacity>
              </Link>
            </View>

            {escalas.length > 0 ? (
              <View className="gap-3">
                {escalas.map((escala) => (
                  <EscalaCard
                    key={escala.id}
                    nome={escala.nome?.toUpperCase()}
                    data_inicio={escala.data_inicio}
                    data_fim={escala.data_fim}
                    atual={escala.atual}
                    onPress={() => router.push('/(tabs)/escalas')}
                  />
                ))}
              </View>
            ) : (
              <View className="bg-surface rounded-3xl p-8 border border-dashed border-border items-center">
                <Text className="text-muted text-sm italic">Nenhuma escala agendada</Text>
              </View>
            )}
          </View>

          {/* SEÇÃO: DOCUMENTOS (Acesso Rápido) */}
          <View>
            <Text className="text-xl font-black text-foreground mb-4 tracking-tight">Atalhos</Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/documentos')}
              activeOpacity={0.8}
              className="bg-primary/5 rounded-[32px] p-6 border border-primary/10 flex-row items-center"
            >
              <View className="bg-primary p-4 rounded-2xl shadow-lg shadow-primary/40">
                <FileText size={24} color="white" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-foreground font-black text-lg">Documentos</Text>
                <Text className="text-muted text-xs">Escalas em PDF e comunicados</Text>
              </View>
              <ChevronRight size={20} color={colors.muted} />
            </TouchableOpacity>
          </View>

          {/* SEÇÃO: NOTÍCIAS */}
          <View>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-black text-foreground tracking-tight">Últimos Avisos</Text>
              <Link href="/(tabs)/noticias" asChild>
                <TouchableOpacity className="flex-row items-center">
                  <Text className="text-primary font-bold text-xs mr-1">Mais notícias</Text>
                  <ChevronRight size={14} color={colors.primary} />
                </TouchableOpacity>
              </Link>
            </View>

            <View className="gap-4">
              {noticias.map((noticia) => (
                <NoticiaCard
                  key={noticia.id}
                  titulo={noticia.titulo}
                  autor_nome={noticia.autor_nome}
                  resumo={noticia.resumo}
                  imagemUrl={noticia.imagem_url}
                  data={noticia.created_at}
                  onPress={() => router.push(`/(tabs)/noticias/${noticia.id}`)}
                />
              ))}
            </View>
          </View>

        </View>
      </ScrollView>
    </ScreenContainer>
  );
}