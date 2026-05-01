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
import { useState, useEffect, useMemo} from 'react';
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
interface ItemEscala {
  area: string
  created_at: string
  culto_codigo: string 
  culto_descricao: string 
  data: string
  dia_semana: string 
  escala_id: string
  funcao: string 
  horario: string 
  id: string
  igreja: string 
  obreiro_id: string 
  obreiro_nome: string 
  obreiro_titulo: string
  observacoes: string 
  pastor_area: string 
  setor: string 
}

type FilterType = 'todas' | 'atual'  | 'passadas';

export default function EscalasScreen() {
  const colors = useColors();
  const { user } = useAuth();

  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('todas');
  const [minhasEscalas, setMinhasEscalas] = useState<ItemEscala[]>([]);

  const {
    isDownloading,
    downloadProgress,
    downloadDocument,
  } = useDocumentDownload();

  const filtros: { value: FilterType; label: string; icon: string }[] = [
    { value: 'todas', label: 'Todas', icon: '📋' },
    { value: 'atual', label: 'Atuais', icon: '🔥' },
    { value: 'passadas', label: 'Antigas', icon: '📁' },
  ];

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
    const fetchMinhasEscalas = async () => {
     
      if (!user) return;
      const hoje = new Date().toISOString().split('T')[0];

      // buscar obreiro
      const { data: obreiro } = await supabase
        .from('obreiros')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!obreiro) return;

      // Minhas Escalas
      const { data, error } = await supabase
        .from('escalas_itens')
        .select('*')
        .eq('obreiro_id', obreiro.id)
        .gte('data', hoje)
        .order('data', { ascending: true })
        .order('horario', {ascending: true});
    
      if (error) {
        console.error(error);
        return;
      }
      
      setMinhasEscalas(data);
    };
    
    fetchEscalas();
    fetchMinhasEscalas();
    
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
    const today = new Date().toISOString().split('T')[0];

    let result = escalas;


    if (filterType === 'atual' ) {
      result = result.filter(e => e.atual);
    }else if (filterType === 'passadas') {
      result = result.filter(e => e.data_fim < today);
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
         <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
          >
            <View className="flex-row gap-3">

              {filtros.map((item) => {
                const active = filterType === item.value;

                return (
                  <TouchableOpacity
                    key={item.value}
                    onPress={() => setFilterType(item.value)}
                    activeOpacity={0.8}
                    className={cn(
                      'px-5 py-3 rounded-full border',
                      active
                        ? 'bg-primary border-primary'
                        : 'bg-surface border-border'
                    )}
                  >
                    <Text
                      className={cn(
                        'text-sm font-bold',
                        active
                          ? 'text-white'
                          : 'text-foreground'
                      )}
                    >
                      {item.icon} {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}

            </View>
          </ScrollView>
          
          <View className="bg-surface rounded-xl p-4 border border-border mb-4">
            <Text className="text-lg font-bold text-primary mb-3">
              📅 Minhas Próximas Escalas
            </Text>

            {minhasEscalas.length > 0 ? (
              minhasEscalas.map((item) => (
                <View
                  key={item.id}
                  className="border-b border-border py-3"
                >
                  <Text className="font-semibold text-foreground">
                    {new Date(item.data).toLocaleDateString('pt-BR')} - {item.horario}
                  </Text>

                  <Text className="text-primary font-bold">
                    {item.area}
                  </Text>

                  <Text className="text-muted">
                    {item.pastor_area}
                  </Text>

                  <Text className="text-foreground">
                    {item.igreja}
                  </Text>

                  <Text className="text-sm text-muted">
                    {item.culto_descricao}
                  </Text>
                </View>
              ))
            ) : (
              <Text className="text-muted">
                Nenhuma escala futura encontrada
              </Text>
            )}
          </View>

          {/* Lista */}
          {filteredEscalas.length > 0 ? (
            <View className="gap-4">
              {filteredEscalas.map((escala) => (
                <View
                  key={escala.id}
                  className="bg-surface rounded-lg p-4 border border-border"
                >
                  <Text className="text-base font-bold text-foreground">
                    {escala.nome.toLocaleUpperCase()}
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

          {}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}