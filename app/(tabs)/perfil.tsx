import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useAuth } from '@/lib/auth-context';
import { useColors } from '@/hooks/use-colors';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ObreiroData {
  nome: string;
  funcao: string;
  telefone?: string;
  data_nascimento?: string;
  ativo: boolean;
}

export default function PerfilScreen() {
  const colors = useColors();
  const { user, signOut } = useAuth();
  const [obreiro, setObreiro] = useState<ObreiroData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchObreiro = async () => {
      if (!user) return;

      try {
        const { data: obreiroData } = await supabase
          .from('obreiros')
          .select('nome, funcao, telefone, data_nascimento, ativo')
          .eq('user_id', user.id)
          .single();

        if (obreiroData) {
          setObreiro(obreiroData);
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchObreiro();
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
        <View className="bg-primary px-6 py-8 items-center gap-4">
          <View className="w-20 h-20 bg-surface rounded-full items-center justify-center">
            <Text className="text-4xl">👤</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-surface">{obreiro?.nome}</Text>
            <Text className="text-sm text-surface/70 mt-1">{obreiro?.funcao}</Text>
          </View>
        </View>

        {/* Content */}
        <View className="px-6 py-6 gap-6">
          {/* Informações Pessoais */}
          <View className="gap-3">
            <Text className="text-lg font-bold text-foreground">Informações Pessoais</Text>

            <View className="bg-surface rounded-lg p-4 border border-border">
              <Text className="text-xs text-muted font-medium mb-1">Email</Text>
              <Text className="text-base text-foreground font-semibold">{user?.email}</Text>
            </View>

            {obreiro?.telefone && (
              <View className="bg-surface rounded-lg p-4 border border-border">
                <Text className="text-xs text-muted font-medium mb-1">Telefone</Text>
                <Text className="text-base text-foreground font-semibold">{obreiro.telefone}</Text>
              </View>
            )}

            {obreiro?.data_nascimento && (
              <View className="bg-surface rounded-lg p-4 border border-border">
                <Text className="text-xs text-muted font-medium mb-1">Data de Nascimento</Text>
                <Text className="text-base text-foreground font-semibold">
                  {new Date(obreiro.data_nascimento).toLocaleDateString('pt-BR')}
                </Text>
              </View>
            )}

            <View className="bg-surface rounded-lg p-4 border border-border">
              <Text className="text-xs text-muted font-medium mb-1">Status</Text>
              <View className="flex-row items-center gap-2">
                <View
                  className={`w-3 h-3 rounded-full ${
                    obreiro?.ativo ? 'bg-tertiary' : 'bg-error'
                  }`}
                />
                <Text className="text-base text-foreground font-semibold">
                  {obreiro?.ativo ? 'Ativo' : 'Inativo'}
                </Text>
              </View>
            </View>
          </View>

          {/* Ações */}
          <View className="gap-3">
            <Text className="text-lg font-bold text-foreground">Ações</Text>

            <TouchableOpacity className="bg-secondary rounded-lg p-4 items-center active:opacity-70">
              <Text className="text-foreground font-bold">Editar Perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => signOut()}
              className="bg-error rounded-lg p-4 items-center active:opacity-70"
            >
              <Text className="text-surface font-bold">Sair da Conta</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="items-center gap-2 py-4">
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
