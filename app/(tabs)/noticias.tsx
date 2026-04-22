import { ScrollView, Text, View, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { NoticiaCard } from '@/components/noticia-card';
import { useColors } from '@/hooks/use-colors';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Noticia {
  id: string;
  titulo: string;
  resumo?: string;
  imagem_url?: string;
  created_at: string;
}

export default function NoticiasScreen() {
  const colors = useColors();
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        const { data: noticiasData } = await supabase
          .from('noticias')
          .select('id, titulo, resumo, imagem_url, created_at')
          .order('created_at', { ascending: false });

        
        if (noticiasData) {
          setNoticias(noticiasData);
        }
      } catch (error) {
        console.error('Erro ao carregar notícias:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNoticias();
  }, []);

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="bg-primary px-6 py-6">
          <Text className="text-2xl font-bold text-surface">Avisos e Notícias</Text>
          <Text className="text-sm text-surface/70 mt-1">
            {noticias.length} notícia{noticias.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Content */}
        <View className="px-6 py-6">
          {noticias.length > 0 ? (
            <View>
              {noticias.map((noticia) => (
                <NoticiaCard
                  key={noticia.id}
                  titulo={noticia.titulo}
                  resumo={noticia.resumo}
                  imagemUrl={noticia.imagem_url}
                  data={noticia.created_at}
                />
              ))}
            </View>
          ) : (
            <View className="bg-surface rounded-lg p-6 border border-border items-center">
              <Text className="text-muted text-center text-base">
                Nenhuma notícia no momento.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
