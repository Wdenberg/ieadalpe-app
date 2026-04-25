import {
  ScrollView,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useAuth } from '@/lib/auth-context';
import { useColors } from '@/hooks/use-colors';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useDocumentDownload } from '@/hooks/use-document-download';

interface Escala {
  id: string;
  nome: string;
  data_inicio: string;
  data_fim: string;
  arquivo_url: string;
  atual: boolean;
  created_at: string;
}

type FilterType = 'todas' | 'atual' | 'passadas';

export default function EscalasScreen() {
  const colors = useColors();
  const { user } = useAuth();

  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('todas');

  const {
    isDownloading,
    downloadProgress,
    downloadDocument,
  } = useDocumentDownload();

  // 🔥 Buscar escalas
  useEffect(() => {
    const fetchEscalas = async () => {
      if (!user) return;

      try {
        
        const { data, error } = await supabase
          .from('cultos_escalas')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setEscalas(data || []);
      } catch (err) {
        console.error('Erro ao carregar escalas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEscalas();
  }, [user]);

  // 🔥 Gerar URL assinada
  const getSignedUrl = async (path: string) => {
    const cleanPath = path.replace('private://', '').trim();

    const { data, error } = await supabase.storage
      .from('media-private')
      .createSignedUrl(cleanPath, 60 * 60);

    if (error) {
      console.error('Erro ao gerar URL:', error);
      return null;
    }

    return data?.signedUrl;
  };

  // 🔥 Download
  const handleDownload = async (escala: Escala) => {
    const signedUrl = await getSignedUrl(escala.arquivo_url);

    if(!signedUrl) return;

    await downloadDocument(signedUrl, `${escala.nome}.pdf`);
  };

  // 🔥 Filtros
  const filteredEscalas = useMemo(() => {
    const now = new Date();

    let result = escalas;

    if (filterType === 'atual') {
      result = result.filter(e => new Date(e.data_inicio) >= now);
    } else if (filterType === 'passadas') {
      result = result.filter(e => new Date(e.data_fim) < now);
    }

    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      result = result.filter(e =>
        e.nome.toLowerCase().includes(search)
      );
    }

    return result;
  }, [escalas, filterType, searchText]);

  // 🔥 Loading
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
          <Text className="text-2xl font-bold text-surface">
            Escalas
          </Text>
          <Text className="text-sm text-surface/70 mt-1">
            {filteredEscalas.length} de {escalas.length}
          </Text>
        </View>

        <View className="px-6 py-6 gap-4">

          {/* Busca */}
          <TextInput
            className={cn(
              'px-4 py-3 rounded-lg border',
              'bg-surface border-border text-foreground'
            )}
            placeholder="Buscar escala..."
            placeholderTextColor={colors.muted}
            value={searchText}
            onChangeText={setSearchText}
          />

          {/* Filtros */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {(['todas', 'atual', 'passadas'] as FilterType[]).map((filter) => (
                <TouchableOpacity
                  key={filter}
                  onPress={() => setFilterType(filter)}
                  className={cn(
                    'px-4 py-2 rounded-full border',
                    filterType === filter
                      ? 'bg-primary border-primary'
                      : 'bg-surface border-border'
                  )}
                >
                  <Text
                    className={cn(
                      'text-sm font-semibold',
                      filterType === filter ? 'text-surface' : 'text-foreground'
                    )}
                  >
                    {filter === 'todas' && 'Todas'}
                    {filter === 'atual' && 'Atual'}
                    {filter === 'passadas' && 'Passadas'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Lista */}
          {filteredEscalas.length > 0 ? (
            <View className="gap-4">
              {filteredEscalas.map((escala) => (
                <View
                  key={escala.id}
                  className="bg-surface rounded-lg p-4 border border-border"
                >
                  <Text className="text-base font-bold text-foreground">
                    {escala.nome}
                  </Text>

                  <Text className="text-xs text-muted mt-2">
                    {new Date(escala.data_inicio).toLocaleDateString('pt-BR')} -{" "}
                    {new Date(escala.data_fim).toLocaleDateString('pt-BR')}
                  </Text>

                  {escala.atual && (
                    <Text className="text-xs text-success mt-1">
                      🔥 Escala Atual
                    </Text>
                  )}

                  {/* Botão Download */}
                  <TouchableOpacity
                    onPress={() => handleDownload(escala)}
                    className="mt-3 bg-success rounded-lg py-2 items-center"
                  >
                    {isDownloading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text className="text-surface font-semibold">
                        ⬇ Baixar PDF
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <View className="items-center mt-10">
              <Text className="text-muted">
                Nenhuma escala encontrada
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}