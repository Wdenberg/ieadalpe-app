import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useAuth } from '@/lib/auth-context';
import { EscalaCard } from '@/components/escala-card';
import { NoticiaCard } from '@/components/noticia-card';
import { useColors } from '@/hooks/use-colors';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Toggle } from '@/components/toggle';


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
}

export default function DashboardScreen() {
  const router = useRouter();
  const colors = useColors();
  const { user, signOut } = useAuth();
  const [obreiro, setObreiro] = useState<ObreiroData | null>(null);
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const ToDay = new Date().toISOString().split('T')[0];
      try {
        // Fetch obreiro data
        const { data: obreiroData } = await supabase
          .from('obreiros')
          .select('id, nome, funcao')
          .eq('user_id', user.id)
          .single();

        if (obreiroData) {
          setObreiro(obreiroData);
        }

        // Fetch próximas escalas (próximos 5 cultos)
        const { data: escalasData } = await supabase
          .from('cultos_escalas')
          .select('*')
          .gte('data_fim', ToDay)
          .order('data_inicio', { ascending: true })
          .limit(2);
        if (escalasData) {
          setEscalas(escalasData);
        }

        // Fetch últimas notícias (3 mais recentes)
        const { data: noticiasData } = await supabase
          .from('noticias')
          .select('id, autor_nome, titulo, resumo, imagem_url,  created_at')
          .order('created_at', { ascending: false })
          .limit(3);

        if (noticiasData) {
          setNoticias(noticiasData);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

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
        <View className="bg-primary px-6 py-8 gap-4">

          <View className="flex-row justify-between items-start">

            {/* Infos usuário */}
            <View>
              <Text className="text-sm text-surface/80 font-medium">
                Bem-vindo,
              </Text>

              <Text className="font-bold text-surface mt-1">
                {obreiro?.nome || 'Obreiro'}
              </Text>

              <Text className="text-sm text-surface/70 mt-1">
                {obreiro?.funcao}
              </Text>
            </View>

            {/* Ações */}
            <View className="items-end gap-2">
              <Toggle />
            </View>

          </View>

        </View>

        {/* Main Content */}
        <View className="px-6 py-6 gap-8">
          {/* Próximas Escalas */}
          <View className="gap-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-xl font-bold text-foreground">Próximas Escalas</Text>
              <Link href="/(tabs)/escalas" asChild>
                <TouchableOpacity>
                  <Text className="text-primary font-semibold text-sm">Ver todas</Text>
                </TouchableOpacity>
              </Link>
            </View>

            {escalas.length > 0 ? (
              <View>
                {escalas.slice(0, 2).map((escala) => (
                  <EscalaCard
                    key={escala.id}
                    nome={escala.nome.toUpperCase()}
                    data_inicio={escala.data_inicio}
                    data_fim={escala.data_fim}
                    atual={escala.atual}
                    
                    onPress={() => router.push('/(tabs)/escalas')}
                  />
                ))}
              </View>
            ) : (
              <View className="bg-surface rounded-lg p-4 border border-border">
                <Text className="text-muted text-center">Nenhuma escala próxima</Text>
              </View>
            )}
          </View>

          {/* Documentos Restritos */}
          <View className="gap-3">
            <Text className="text-xl font-bold text-foreground">Documentos Restritos</Text>
            <Link href="/(tabs)/documentos" asChild>
              <TouchableOpacity
                className="bg-secondary rounded-lg p-4 items-center"
              >
                <Text className="text-foreground font-bold text-base">📄 Acessar Documentos</Text>
                <Text className="text-foreground/70 text-xs mt-1">
                  Escalas, manuais e comunicados
                </Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Avisos e Notícias */}
          <View className="gap-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-xl font-bold text-foreground">Avisos e Notícias</Text>
              <Link href="/(tabs)/noticias" asChild>
                <TouchableOpacity>
                  <Text className="text-primary font-semibold text-sm">Ver todas</Text>
                </TouchableOpacity>
              </Link>
            </View>

            {noticias.length > 0 ? (
              <View>
                {noticias.slice(0, 2).map((noticia) => (
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
            ) : (
              <View className="bg-surface rounded-lg p-4 border border-border">
                <Text className="text-muted text-center">Nenhuma notícia no momento</Text>
              </View>
            )}
          </View>


        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
