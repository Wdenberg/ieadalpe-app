import { ScrollView, Text, View, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useAuth } from '@/lib/auth-context';
import { EscalaCard } from '@/components/escala-card';
import { useColors } from '@/hooks/use-colors';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface Escala {
  id: string;
  data_culto: string;
  hora_inicio: string;
  tipo_culto: string;
  local: string;
  funcao_escala: string;
  confirmado: boolean;
}

type FilterType = 'todas' | 'proximas' | 'passadas' | 'confirmadas' | 'pendentes';

export default function EscalasScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user } = useAuth();
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('todas');
  const [selectedTipoCulto, setSelectedTipoCulto] = useState<string | null>(null);

  useEffect(() => {
    const fetchEscalas = async () => {
      if (!user) return;

      try {
        // Get obreiro ID
        const { data: obreiroData } = await supabase
          .from('obreiros')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!obreiroData) return;

        // Fetch escalas
        const { data: escalasData } = await supabase
          .from('cultos_escalas')
          .select('*')
          .eq('obreiro_id', obreiroData.id)
          .order('data_culto', { ascending: true });

        if (escalasData) {
          setEscalas(escalasData);
        }
      } catch (error) {
        console.error('Erro ao carregar escalas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEscalas();
  }, [user]);

  // Get unique tipos de culto for filter
  const tiposCulto = useMemo(() => {
    return Array.from(new Set(escalas.map(e => e.tipo_culto))).sort();
  }, [escalas]);

  // Filter escalas based on criteria
  const filteredEscalas = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let filtered = escalas;

    // Filter by status
    if (filterType === 'proximas') {
      filtered = filtered.filter(e => new Date(e.data_culto) >= now);
    } else if (filterType === 'passadas') {
      filtered = filtered.filter(e => new Date(e.data_culto) < now);
    } else if (filterType === 'confirmadas') {
      filtered = filtered.filter(e => e.confirmado);
    } else if (filterType === 'pendentes') {
      filtered = filtered.filter(e => !e.confirmado);
    }

    // Filter by tipo de culto
    if (selectedTipoCulto) {
      filtered = filtered.filter(e => e.tipo_culto === selectedTipoCulto);
    }

    // Filter by search text
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(e =>
        e.tipo_culto.toLowerCase().includes(search) ||
        e.local.toLowerCase().includes(search) ||
        e.funcao_escala.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [escalas, filterType, selectedTipoCulto, searchText]);

  const handleSelectEscala = (escalaId: string) => {
    router.push(`/(tabs)/escalas/${escalaId}`);
  };

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
          <Text className="text-2xl font-bold text-surface">Minhas Escalas</Text>
          <Text className="text-sm text-surface/70 mt-1">
            {filteredEscalas.length} de {escalas.length} escala{escalas.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Content */}
        <View className="px-6 py-6 gap-4">
          {/* Search Bar */}
          <TextInput
            className={cn(
              'px-4 py-3 rounded-lg border text-foreground',
              'bg-surface border-border'
            )}
            placeholder="Buscar por tipo, local ou função..."
            placeholderTextColor={colors.muted}
            value={searchText}
            onChangeText={setSearchText}
          />

          {/* Filter Buttons */}
          <View className="gap-3">
            {/* Status Filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
              {(['todas', 'proximas', 'passadas', 'confirmadas', 'pendentes'] as FilterType[]).map((filter) => (
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
                      'font-semibold text-sm',
                      filterType === filter ? 'text-surface' : 'text-foreground'
                    )}
                  >
                    {filter === 'todas' && 'Todas'}
                    {filter === 'proximas' && 'Próximas'}
                    {filter === 'passadas' && 'Passadas'}
                    {filter === 'confirmadas' && '✓ Confirmadas'}
                    {filter === 'pendentes' && '⏳ Pendentes'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Tipo de Culto Filters */}
            {tiposCulto.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
                <TouchableOpacity
                  onPress={() => setSelectedTipoCulto(null)}
                  className={cn(
                    'px-4 py-2 rounded-full border',
                    selectedTipoCulto === null
                      ? 'bg-secondary border-secondary'
                      : 'bg-surface border-border'
                  )}
                >
                  <Text
                    className={cn(
                      'font-semibold text-sm',
                      selectedTipoCulto === null ? 'text-surface' : 'text-foreground'
                    )}
                  >
                    Todos os Tipos
                  </Text>
                </TouchableOpacity>

                {tiposCulto.map((tipo) => (
                  <TouchableOpacity
                    key={tipo}
                    onPress={() => setSelectedTipoCulto(tipo)}
                    className={cn(
                      'px-4 py-2 rounded-full border',
                      selectedTipoCulto === tipo
                        ? 'bg-secondary border-secondary'
                        : 'bg-surface border-border'
                    )}
                  >
                    <Text
                      className={cn(
                        'font-semibold text-sm',
                        selectedTipoCulto === tipo ? 'text-surface' : 'text-foreground'
                      )}
                    >
                      {tipo}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Escalas List */}
          {filteredEscalas.length > 0 ? (
            <View className="gap-3">
              {filteredEscalas.map((escala) => (
                <TouchableOpacity
                  key={escala.id}
                  onPress={() => handleSelectEscala(escala.id)}
                  activeOpacity={0.7}
                >
                  <EscalaCard
                    data={escala.data_culto}
                    hora={escala.hora_inicio}
                    tipo={escala.tipo_culto}
                    funcao={escala.funcao_escala}
                    local={escala.local}
                    confirmado={escala.confirmado}
                  />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="bg-surface rounded-lg p-6 border border-border items-center gap-2">
              <Text className="text-2xl">🔍</Text>
              <Text className="text-muted text-center text-base font-semibold">
                Nenhuma escala encontrada
              </Text>
              <Text className="text-muted text-center text-xs">
                {searchText || selectedTipoCulto
                  ? 'Tente ajustar seus filtros'
                  : 'Você não possui escalas agendadas no momento'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
