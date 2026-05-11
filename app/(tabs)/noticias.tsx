import { ScrollView, Text, View, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { NoticiaCard } from '@/components/noticia-card';
import { useColors } from '@/hooks/use-colors';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import * as Notifications from 'expo-notifications'; // Importar para a notificação local

interface Noticia {
  id: string;
  autor_nome: string;
  titulo: string;
  resumo?: string;
  imagem_url?: string;
  created_at: string;
}

// Configuração das Notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});


export default function NoticiasScreen() {
  const router = useRouter();
  const colors = useColors();
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);


  // --- BUSCA DE DADOS ---
  const fetchNoticias = useCallback(async () => {
    try {
      const { data: noticiasData } = await supabase
        .from('noticias')
        .select('id, autor_nome, titulo, resumo, imagem_url, created_at')
        .order('created_at', { ascending: false });

      if (noticiasData) {
        setNoticias(noticiasData);
      }
    } catch (error) {
      console.error('Erro ao carregar notícias:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- REALTIME ---
  useEffect(() => {

    fetchNoticias();

    // Criar o canal para escutar novas notícias
    const channel = supabase
      .channel('noticias_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'noticias' },
        (payload) => {
          const novaNoticia = payload.new as Noticia;

          // 1. Adiciona no topo da lista atual sem precisar de refresh
          setNoticias((prev) => [novaNoticia, ...prev]);

          // 2. Dispara a notificação local (Banner)
          Notifications.scheduleNotificationAsync({
            content: {
              title: "🆕 Notícia da IEADALPE",
              body: novaNoticia.titulo,
              data: { noticiaId: novaNoticia.id }, // Dados extras caso queira abrir ao clicar
            },
            trigger: null, // dispara imediatamente
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNoticias]);

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-0 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchNoticias}

          />
        }
      >

        {/* Header Refatorado */}
        <View className="bg-primary pt-12 pb-10 px-6 rounded-b-[40px] shadow-lg items-center">
          <Text className="text-3xl font-extrabold text-white">Avisos</Text>
          <Text className="text-white/80 mt-1">
            Fique por dentro das últimas atualizações
          </Text>

          <View className="bg-white/20 px-4 py-1 rounded-full mt-4">
            <Text className="text-white font-bold text-xs">
              {noticias.length} {noticias.length === 1 ? 'NOTÍCIA' : 'NOTÍCIAS'}
            </Text>
          </View>
        </View>

        {/* Lista de Notícias */}
        <View className="px-6 py-6">
          {noticias.length > 0 ? (
            <View className="gap-2">
              {noticias.map((noticia) => (
                <NoticiaCard
                  key={noticia.id}
                  titulo={noticia.titulo}
                  autor_nome={noticia.autor_nome || 'IEADALPE'}
                  resumo={noticia.resumo}
                  imagemUrl={noticia.imagem_url}
                  data={noticia.created_at}
                  onPress={() => router.push(`/(tabs)/noticias/${noticia.id}`)}
                />
              ))}
            </View>
          ) : (
            <View className="bg-surface rounded-3xl p-10 border border-dashed border-border items-center mt-10">
              <Text className="text-muted text-center text-base italic">
                Nenhuma notícia publicada ainda.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}