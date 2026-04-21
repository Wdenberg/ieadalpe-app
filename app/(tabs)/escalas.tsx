import { ScrollView, Text, View, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useAuth } from '@/lib/auth-context';
import { EscalaCard } from '@/components/escala-card';
import { useColors } from '@/hooks/use-colors';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Escala {
  id: string;
  data_culto: string;
  hora_inicio: string;
  tipo_culto: string;
  local: string;
  funcao_escala: string;
  confirmado: boolean;
}

export default function EscalasScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [loading, setLoading] = useState(true);

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
            {escalas.length} escala{escalas.length !== 1 ? 's' : ''} agendada{escalas.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Content */}
        <View className="px-6 py-6">
          {escalas.length > 0 ? (
            <View>
              {escalas.map((escala) => (
                <EscalaCard
                  key={escala.id}
                  data={escala.data_culto}
                  hora={escala.hora_inicio}
                  tipo={escala.tipo_culto}
                  funcao={escala.funcao_escala}
                  local={escala.local}
                  confirmado={escala.confirmado}
                />
              ))}
            </View>
          ) : (
            <View className="bg-surface rounded-lg p-6 border border-border items-center">
              <Text className="text-muted text-center text-base">
                Você não possui escalas agendadas no momento.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
