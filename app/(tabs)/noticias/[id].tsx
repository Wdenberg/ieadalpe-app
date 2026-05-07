import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  Text,
  View,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Clock, User, Tag } from 'lucide-react-native';

interface NoticiaDetalhada {
  id: string;
  titulo: string;
  resumo?: string;
  conteudo: string;
  imagem_url?: string;
  autor_nome?: string;
  created_at: string;
  update_at?: string;
  categoria?: string;
}

export default function NoticiaDetalheScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [noticia, setNoticia] = useState<NoticiaDetalhada | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNoticia = async () => {
      if (!id) return;
      try {
        const { data, error: fetchError } = await supabase
          .from('noticias')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        setNoticia(data);
      } catch (err) {
        setError('Não foi possível carregar esta notícia.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNoticia();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (error || !noticia) {
    return (
      <ScreenContainer className="p-6 items-center justify-center">
        <Text className="text-lg font-bold text-red-500 mb-4">{error || 'Notícia não encontrada'}</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-primary rounded-2xl px-8 py-4 shadow-md"
        >
          <Text className="text-white font-bold">Voltar para Início</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-0 bg-background">
      <StatusBar barStyle="light-content" />

      {/* BOTÃO VOLTAR FLUTUANTE */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{ top: 50, left: 20, zIndex: 10 }}
        className="absolute bg-black/30 p-2 rounded-full backdrop-blur-md"
      >
        <ArrowLeft size={24} color="white" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* IMAGEM DE CAPA */}
        {noticia.imagem_url ? (
          <Image
            source={{ uri: noticia.imagem_url }}
            className="w-full h-80 bg-muted"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-40 bg-primary justify-end p-6">
            <Text className="text-white/60 font-bold tracking-tighter">IEADALPE NOTÍCIAS</Text>
          </View>
        )}

        <View className="px-6 -mt-8 bg-background rounded-t-[40px] pt-8 pb-20">

          {/* CATEGORIA E DATA */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center bg-primary/10 px-3 py-1 rounded-full">
              <Tag size={12} color={colors.primary} />
              <Text className="text-[10px] font-black text-primary uppercase ml-1 tracking-widest">
                {noticia.categoria || 'Geral'}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Clock size={14} color={colors.muted} />
              <Text className="text-xs text-muted ml-1">
                {formatDate(noticia.created_at)}
              </Text>
            </View>
          </View>

          {/* TÍTULO */}
          <Text className="text-3xl font-extrabold text-foreground leading-[38px] mb-4">
            {noticia.titulo}
          </Text>

          {/* AUTOR */}
          <View className="flex-row items-center mb-8 border-b border-border pb-6">
            <View className="w-10 h-10 bg-muted rounded-full items-center justify-center mr-3">
              <User size={20} color={colors.primary} />
            </View>
            <View>
              <Text className="text-xs text-muted">Publicado por</Text>
              <Text className="text-sm font-bold text-foreground">{noticia.autor_nome || 'Redação IEADALPE'}</Text>
            </View>
          </View>

          {/* RESUMO (Lead) */}
          {noticia.resumo && (
            <Text className="text-lg font-semibold text-primary/80 italic leading-7 mb-8">
              {noticia.resumo}
            </Text>
          )}

          {/* CORPO DO TEXTO */}
          <Text className="text-base text-foreground/80 leading-7 tracking-wide text-justify">
            {noticia.conteudo}
          </Text>

          {/* RODAPÉ / ATUALIZAÇÃO */}
          {noticia.update_at && (
            <View className="mt-10 p-4 bg-muted/30 rounded-2xl border border-border">
              <Text className="text-[10px] text-muted text-center italic">
                Última atualização em {formatDate(noticia.update_at)}
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-10 py-4 items-center rounded-2xl border border-primary/20"
          >
            <Text className="text-primary font-bold">Voltar para a lista</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </ScreenContainer>
  );
}