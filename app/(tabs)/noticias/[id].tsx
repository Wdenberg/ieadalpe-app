import { ScrollView, Text, View, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface NoticiaDetalhada {
  id: string;
  titulo: string;
  resumo?: string;
  conteudo: string;
  imagem_url?: string;
  autor?: string;
  publicado_em: string;
  atualizado_em?: string;
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
        const { data: noticiaData, error: fetchError } = await supabase
          .from('noticias')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) {
          setError('Erro ao carregar notícia');
          console.error('Erro ao buscar notícia:', fetchError);
          return;
        }

        if (noticiaData) {
          setNoticia(noticiaData);
        }
      } catch (err) {
        setError('Erro ao carregar notícia');
        console.error('Erro:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNoticia();
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
        <Text className="text-lg font-bold text-error mb-4">
          {error || 'Notícia não encontrada'}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-primary rounded-lg px-6 py-3"
        >
          <Text className="text-surface font-bold">Voltar</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header com Botão Voltar */}
        <View className="bg-primary px-6 py-4 flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-surface/20 rounded-full p-2"
          >
            <Text className="text-surface font-bold text-lg">←</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-surface flex-1">Notícia</Text>
        </View>

        {/* Imagem Principal */}
        {noticia.imagem_url && (
          <Image
            source={{ uri: noticia.imagem_url }}
            className="w-full h-64"
            resizeMode="cover"
          />
        )}

        {/* Conteúdo */}
        <View className="px-6 py-6 gap-4">
          {/* Categoria e Data */}
          <View className="gap-2">
            {noticia.categoria && (
              <View className="flex-row items-center gap-2">
                <View className="bg-primary rounded-full px-3 py-1">
                  <Text className="text-xs font-bold text-surface">
                    {noticia.categoria}
                  </Text>
                </View>
              </View>
            )}
            <Text className="text-sm text-muted font-medium">
              {formatDate(noticia.publicado_em)}
            </Text>
          </View>

          {/* Título */}
          <Text className="text-2xl font-bold text-foreground leading-tight">
            {noticia.titulo}
          </Text>

          {/* Autor */}
          {noticia.autor && (
            <View className="bg-surface rounded-lg p-3 border border-border">
              <Text className="text-xs text-muted font-medium mb-1">Por</Text>
              <Text className="text-sm font-semibold text-foreground">
                {noticia.autor}
              </Text>
            </View>
          )}

          {/* Resumo */}
          {noticia.resumo && (
            <View className="bg-secondary/10 rounded-lg p-4 border border-secondary/20">
              <Text className="text-base font-semibold text-secondary mb-2">
                Resumo
              </Text>
              <Text className="text-sm text-foreground leading-relaxed">
                {noticia.resumo}
              </Text>
            </View>
          )}

          {/* Conteúdo Completo */}
          <View className="gap-3 py-4">
            <Text className="text-lg font-bold text-foreground">Conteúdo</Text>
            <Text className="text-base text-foreground leading-relaxed">
              {noticia.conteudo}
            </Text>
          </View>

          {/* Metadados */}
          <View className="bg-surface rounded-lg p-4 border border-border gap-3 mt-4">
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted font-medium">Publicado em</Text>
              <Text className="text-xs font-semibold text-foreground">
                {formatDate(noticia.publicado_em)}
              </Text>
            </View>

            {noticia.atualizado_em && (
              <View className="flex-row justify-between">
                <Text className="text-xs text-muted font-medium">Atualizado em</Text>
                <Text className="text-xs font-semibold text-foreground">
                  {formatDate(noticia.atualizado_em)}
                </Text>
              </View>
            )}

            <View className="flex-row justify-between">
              <Text className="text-xs text-muted font-medium">ID da Notícia</Text>
              <Text className="text-xs font-mono text-foreground">{noticia.id}</Text>
            </View>
          </View>

          {/* Botão Voltar */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-secondary rounded-lg p-4 items-center mt-4 mb-6"
          >
            <Text className="text-foreground font-bold">Voltar para Notícias</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
