import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useAuth } from '@/lib/auth-context';
import { useColors } from '@/hooks/use-colors';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { formatarTelefone } from '@/lib/formatterPhone';

interface ObreiroData {
  id: string;
  nome: string;
  matricula:string;
  funcao: string;
  setor:string;
  congregacao:string;
  telefone?: string;
  data_nascimento?: string;
  foto_url?: string;
 
}

interface Escala {
  id: string;
  data_culto: string;
  hora_inicio: string;
  tipo_culto: string;
  funcao_escala: string;
  confirmado: boolean;
}
type Funcao = "Pastor" | "Evangelista" | "Presbítero" | "Presbitero";

export default function PerfilScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [obreiro, setObreiro] = useState<ObreiroData | null>(null);
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEscalas, setLoadingEscalas] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        // Fetch obreiro data
        const { data: obreiroData } = await supabase
          .from('obreiros')
          .select('id, nome, matricula, funcao, setor, congregacao, telefone, data_nascimento, foto_url')
          .eq('user_id', user.id)
          .single();

        if (obreiroData) {
          setObreiro(obreiroData);

          // Fetch últimas 10 escalas
          setLoadingEscalas(true);
          const { data: escalasData } = await supabase
            .from('cultos_escalas')
            .select('id, data_culto, hora_inicio, tipo_culto, funcao_escala, confirmado')
            .eq('obreiro_id', obreiroData.id)
            .order('data_culto', { ascending: false })
            .limit(10);

          if (escalasData) {
            setEscalas(escalasData);
          }
          setLoadingEscalas(false);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  function formateTitulo(funcao: Funcao){
    if(funcao === "Pastor"){
      return "Pr.";
    }
    if(funcao === "Evangelista"){
      return "Ev.";
    }
    if(funcao === "Presbítero" || funcao === "Presbitero"){
      return "Pb.";
    }
    return "";
  }
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const handleEditarPerfil = () => {
    router.push('/(tabs)/perfil/editar');
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
        {/* Header com Foto */}
        <View className="bg-primary px-6 py-8 items-center gap-4">
          {obreiro?.foto_url ? (
            <Image
              source={{ uri: obreiro.foto_url }}
              className="w-24 h-24 rounded-full bg-surface"
              resizeMode="cover"
            />
          ) : (
            <View className="w-24 h-24 bg-surface rounded-full items-center justify-center border-2 border-surface/50">
              <Text className="text-5xl">👤</Text>
            </View>
          )}
          <View className="items-center">
            <Text className="text-2xl font-bold text-surface">{obreiro?.funcao ? formateTitulo(obreiro?.funcao as Funcao) : ""} {obreiro?.nome}</Text>
            <Text className="text-sm text-surface/70 mt-1">{obreiro?.funcao}</Text>
          </View>

         
          
        </View>

        {/* Content */}
        <View className="px-6 py-6 gap-6">
          {/* Informações Pessoais */}
          <View className="gap-3">
            <Text className="text-lg font-bold text-foreground">Informações Pessoais</Text>

               {obreiro?.matricula && (
              <View className="bg-surface rounded-lg p-4 border border-border">
                <Text className="text-xs text-muted font-medium mb-1">Matricula</Text>
                <Text className="text-base text-foreground font-semibold">{obreiro.matricula}</Text>
              </View>
            )}
            
            {obreiro?.nome && (
              <View className="bg-surface rounded-lg p-4 border border-border">
                <Text className="text-xs text-muted font-medium mb-1">Nome</Text>
                <Text className="text-base text-foreground font-semibold">{obreiro.nome}</Text>
              </View>
            )}
          
            <View className="bg-surface rounded-lg p-4 border border-border">
              <Text className="text-xs text-muted font-medium mb-1">Email</Text>
              <Text className="text-base text-foreground font-semibold">{user?.email}</Text>
            </View>

            {obreiro?.setor && obreiro?.congregacao && (
              <View className="bg-surface rounded-lg p-4 border border-border flex-row justify-between">

                {/* Setor */}
                  <View className="flex-1">
                  <Text className="text-xs text-muted font-medium mb-1">Setor</Text>
                  <Text className="text-base text-foreground font-semibold">
                  {obreiro.setor}
                  </Text>
                </View>

                {/* Congreção */}
                <View className="flex-1">
                  <Text className="text-xs text-muted font-medium mb-1">Congregação</Text>
                  <Text className="text-base text-foreground font-semibold">
                  {obreiro.congregacao}
                  </Text>
                </View>

              </View>
            )}

            {obreiro?.telefone && (
              <View className="bg-surface rounded-lg p-4 border border-border">
                <Text className="text-xs text-muted font-medium mb-1">Telefone</Text>
                <Text className="text-base text-foreground font-semibold">{formatarTelefone(obreiro.telefone)}</Text>
              </View>
            )}

            {obreiro?.data_nascimento && (
              <View className="bg-surface rounded-lg p-4 border border-border">
                <Text className="text-xs text-muted font-medium mb-1">Data de Nascimento</Text>
                <Text className="text-base text-foreground font-semibold">
                  {formatDate(obreiro.data_nascimento)}
                </Text>
              </View>
            )}
          </View>

          {/* Histórico de Escalas */}
          <View className="gap-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-bold text-foreground">Últimas Escalas</Text>
              <Text className="text-xs text-muted font-medium">
                {escalas.length} escala{escalas.length !== 1 ? 's' : ''}
              </Text>
            </View>

            {loadingEscalas ? (
              <View className="items-center py-4">
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : escalas.length > 0 ? (
              <View className="gap-2">
                {escalas.map((escala) => (
                  <TouchableOpacity
                    key={escala.id}
                    onPress={() => router.push(`/(tabs)/escalas/${escala.id}`)}
                    className="bg-surface rounded-lg p-4 border border-border active:opacity-70"
                  >
                    <View className="flex-row justify-between items-start mb-2">
                      <View className="flex-1">
                        <Text className="text-sm font-bold text-foreground">
                          {escala.tipo_culto}
                        </Text>
                        <Text className="text-xs text-muted mt-1">
                          {formatDate(escala.data_culto)} às {formatTime(escala.hora_inicio)}
                        </Text>
                      </View>
                      <View
                        className={cn(
                          'rounded-full px-2 py-1',
                          escala.confirmado ? 'bg-success/20' : 'bg-warning/20'
                        )}
                      >
                        <Text
                          className={cn(
                            'text-xs font-semibold',
                            escala.confirmado ? 'text-success' : 'text-warning'
                          )}
                        >
                          {escala.confirmado ? '✓' : '⏳'}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-xs text-muted">
                      Função: {escala.funcao_escala}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View className="bg-surface rounded-lg p-4 border border-border items-center">
                <Text className="text-muted text-sm text-center">
                  Nenhuma escala no histórico
                </Text>
              </View>
            )}
          </View>

          {/* Ações */}
          <View className="gap-3">
            <Text className="text-lg font-bold text-foreground">Ações</Text>

            <TouchableOpacity
              onPress={handleEditarPerfil}
              className="bg-secondary rounded-lg p-4 items-center flex-row justify-center gap-2 active:opacity-70"
            >
              <Text className="text-lg">✏️</Text>
              <Text className="text-foreground font-bold">Editar Perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => signOut()}
              className="bg-error rounded-lg p-4 items-center flex-row justify-center gap-2 active:opacity-70"
            >
              <Text className="text-lg">🚪</Text>
              <Text className="text-surface font-bold">Sair da Conta</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="items-center gap-2 py-4 border-t border-border mt-4">
            <Text className="text-xs text-muted text-center">
              IEADALPE App v1.0.0
            </Text>
            <Text className="text-xs text-muted text-center">
              © 2024 Igreja Evangélica Assembleia de Deus
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
