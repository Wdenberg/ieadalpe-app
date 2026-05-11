import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ScrollView,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { ScreenContainer } from '@/components/screen-container';
import { useAuth } from '@/lib/auth-context';
import { useColors } from '@/hooks/use-colors';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useDocumentDownload } from '@/hooks/use-document-download';
import { Search, Calendar, FileText, CheckCircle, Clock } from 'lucide-react-native';

// --- Tipagens ---
interface Escala {
  id: string;
  nome: string;
  data_inicio: string;
  data_fim: string;
  arquivo_url: string;
  atual: boolean;
  created_at: string;
}

interface ItemEscala {
  id: string;
  data: string;
  horario: string;
  igreja: string;
  culto_descricao: string;
  pastor_area: string;
}

type FilterType = 'todas' | 'atual' | 'passadas';

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

export default function EscalasScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const { isDownloading, downloadDocument } = useDocumentDownload();

  // Estados
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [minhasEscalas, setMinhasEscalas] = useState<ItemEscala[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('todas');

  // --- BUSCA DE DADOS ---
  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Buscar Escalas Gerais (PDFs)
      const { data: escalasGerais } = await supabase
        .from('cultos_escalas')
        .select('*')
        .order('created_at', { ascending: false });

      // 2. Buscar Obreiro Logado
      const { data: obreiro } = await supabase
        .from('obreiros')
        .select('id')
        .eq('user_id', user.id)
        .single();

      // 3. Buscar Minhas Escalas (Itens Individuais)
      if (obreiro) {
        const hoje = new Date().toISOString().split('T')[0];
        const { data: itens } = await supabase
          .from('escalas_itens')
          .select('*')
          .eq('obreiro_id', obreiro.id)
          .gte('data', hoje)
          .order('data', { ascending: true });

        setMinhasEscalas(itens || []);
      }

      setEscalas(escalasGerais || []);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // --- REALTIME & PERMISSÕES ---
  useEffect(() => {
    fetchData();

    // Permissões de Notificação
    const setupNotifications = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') await Notifications.requestPermissionsAsync();
    };
    setupNotifications();

    // Escutar novas escalas publicadas
    const channel = supabase
      .channel('public:cultos_escalas')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'cultos_escalas' },
        (payload) => {
          const novaEscala = payload.new as Escala;
          setEscalas(prev => [novaEscala, ...prev]);

          Notifications.scheduleNotificationAsync({
            content: {
              title: "📋 Nova Escala Publicada!",
              body: `A escala "${novaEscala.nome}" já está disponível.`,
            },
            trigger: null,
          });
        })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  // --- HANDLERS ---
  const handleDownload = async (escala: Escala) => {
    try {
      const cleanPath = escala.arquivo_url.replace('private://', '').trim();
      const nomeSeguro = escala.nome.replace(/\//g, '-');
      const { data, error } = await supabase.storage

        .from('media-private')
        .createSignedUrl(cleanPath, 3600);

      if (error || !data?.signedUrl) throw new Error('Erro ao gerar link');
      await downloadDocument(data.signedUrl, `${nomeSeguro}.pdf`);
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível baixar o arquivo.');
    }
  };

  const filteredEscalas = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return escalas.filter(e => {
      const matchesSearch = e.nome.toLowerCase().includes(searchText.toLowerCase());
      if (filterType === 'atual') return matchesSearch && e.atual;
      if (filterType === 'passadas') return matchesSearch && e.data_fim < today;
      return matchesSearch;
    });
  }, [escalas, filterType, searchText]);

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-0 bg-background">
      <ScrollView stickyHeaderIndices={[1]} showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchData}

          />
        }
      >

        {/* HEADER */}
        <View className="bg-primary pt-12 pb-10 px-6 rounded-b-[40px] shadow-lg">
          <Text className="text-3xl font-extrabold text-white">Escalas</Text>
          <Text className="text-white/80 mt-1">Confira suas escalas e baixe os editais</Text>
        </View>

        {/* BARRA DE BUSCA E FILTROS */}
        <View className="px-6 -mt-6">
          <View className="bg-surface p-4 rounded-3xl shadow-sm border border-border gap-4">
            <View className="flex-row items-center bg-background px-4 py-2 rounded-2xl border border-border">
              <Search size={20} color={colors.muted} />
              <TextInput
                className="flex-1 ml-2 text-foreground h-10"
                placeholder="Buscar escala..."
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor={colors.muted}
              />
            </View>

            <View className="flex-row gap-2">
              {['todas', 'atual', 'passadas'].map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setFilterType(type as FilterType)}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl border items-center",
                    filterType === type ? "bg-primary border-primary" : "bg-background border-border"
                  )}
                >
                  <Text className={cn("text-xs font-bold capitalize", filterType === type ? "text-white" : "text-muted")}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View className="px-6 py-6">
          {/* SEÇÃO: MINHAS ESCALAS INDIVIDUAIS */}
          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <Calendar size={20} color={colors.primary} />
              <Text className="text-lg font-bold text-foreground ml-2">Minha Agenda</Text>
            </View>

            {minhasEscalas.length > 0 ? (
              minhasEscalas.map(item => (
                <View key={item.id} className="bg-primary/5 border border-primary/10 rounded-2xl p-4 mb-3">
                  <View className="flex-row justify-between mb-2">
                    <Text className="font-bold text-primary">{new Date(item.data).toLocaleDateString('pt-BR')}</Text>
                    <View className="flex-row items-center">
                      <Clock size={14} color={colors.primary} />
                      <Text className="text-primary text-xs font-bold ml-1">{item.horario.substring(0, 5)}h</Text>
                    </View>
                  </View>
                  <Text className="text-foreground font-semibold">{item.igreja}</Text>
                  <Text className="text-muted text-xs mt-1">{item.culto_descricao}</Text>
                </View>
              ))
            ) : (
              <View className="p-8 items-center bg-surface rounded-2xl border border-dashed border-border">
                <Text className="text-muted text-sm italic">Nenhum compromisso agendado.</Text>
              </View>
            )}
          </View>

          {/* SEÇÃO: LISTA DE PDFS */}
          <View>
            <View className="flex-row items-center mb-4">
              <FileText size={20} color={colors.primary} />
              <Text className="text-lg font-bold text-foreground ml-2">Editais Disponíveis</Text>
            </View>

            {filteredEscalas.map((escala) => (
              <View key={escala.id} className="bg-surface rounded-2xl p-5 border border-border mb-4 shadow-sm">
                <View className="flex-row justify-between items-start">
                  <View className="flex-1 pr-4">
                    <Text className="text-base font-bold text-foreground leading-5">
                      {escala.nome.toUpperCase()}
                    </Text>
                    <Text className="text-xs text-muted mt-2">
                      Vigência: {new Date(escala.data_inicio).toLocaleDateString()} - {new Date(escala.data_fim).toLocaleDateString()}
                    </Text>
                  </View>
                  {escala.atual && (
                    <View className="bg-green-500/10 px-2 py-1 rounded-md">
                      <Text className="text-[10px] font-bold text-green-600">ATUAL</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  onPress={() => handleDownload(escala)}
                  disabled={isDownloading}
                  className={cn(
                    "mt-5 flex-row items-center justify-center py-3 rounded-xl",
                    isDownloading ? "bg-muted" : "bg-primary"
                  )}
                >
                  {isDownloading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <CheckCircle size={18} color="white" />
                      <Text className="text-white font-bold ml-2">Baixar PDF</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}