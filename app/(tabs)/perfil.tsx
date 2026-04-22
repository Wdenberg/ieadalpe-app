import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useAuth } from '@/lib/auth-context';
import { useColors } from '@/hooks/use-colors';
import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';

interface ObreiroData {
  id:string;
  matricula:string
  nome: string;
  foto_url?:string;
  funcao: string;
  telefone?: string;
  data_nascimento?: string;
  ultimo_acesso: string;
  anos_obreiro:string;
  congregacao:string;
  setor:string;

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
      // 1. Buscamos sem o .single() para evitar erro 406 se houver duplicidade
      const { data, error } = await supabase
        .from('obreiros')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro na query do Perfil:', error.message);
        return;
      }

      // 2. Verificamos se retornou ao menos um registro
      if (data && data.length > 0) {
        const obreiroData = data[0]; // Pegamos o primeiro obreiro encontrado
        
        setObreiro({
          id: obreiroData.id,
          matricula: obreiroData.matricula,
          nome: obreiroData.nome,
          funcao: obreiroData.funcao,
          setor: obreiroData.setor,
          congregacao: obreiroData.congregacao,
          telefone: obreiroData.telefone,
          data_nascimento: obreiroData.data_nascimento,
          foto_url: obreiroData.foto_url,
          ultimo_acesso: obreiroData.ultimo_acesso,
          anos_obreiro: String(obreiroData.anos_obreiro || 0),
        });
      } else {
        console.log('Nenhum obreiro vinculado a este user_id:', user.id);
      }
    } catch (error) {
      console.error('Erro geral:', error);
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
            {obreiro?.foto_url ? (
        <Image 
          source={{ uri: obreiro.foto_url }} 
          className="w-full h-full"
          resizeMode="cover"
        />
        ) : (
          <Text className="text-4xl">👤</Text>
        )}
          </View>
        </View>

        {/* Content */}
        <View className="px-6 py-6 gap-6">
          {/* Informações Pessoais */}
          <View className="gap-3">
            <Text className="text-lg font-bold text-foreground">Informações Pessoais</Text>

            <View className="bg-surface rounded-lg p-4 border border-border">
              <Text className="text-xs text-muted font-medium mb-1">Nome</Text>
              <Text className="ext-base text-foreground font-semibold mb-1">{obreiro?.nome ? obreiro?.nome : ' '}</Text>
              <Text className="text-xs text-muted font-medium mb-1">Função</Text>
              <Text className="ext-base text-foreground font-semibold mb-1">{obreiro?.funcao ? obreiro.funcao : ' '}</Text>
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
                    obreiro?.ultimo_acesso ? 'bg-tertiary' : 'bg-error'
                  }`}
                />
                <Text className="text-base text-foreground font-semibold">
                  {obreiro?.ultimo_acesso ? 'Ativo' : 'Inativo'}
                </Text>
              </View>
            </View>
          </View>

          {/* Ações */}
          <View className="gap-3">
            <Text className="text-lg font-bold text-foreground">Ações</Text>
            {/* 
            <TouchableOpacity disabled={true} className="bg-secondary rounded-lg p-4 items-center active:opacity-70 ">
              <Text className="text-foreground font-bold">Editar Perfil</Text>
            </TouchableOpacity>
            */}
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
