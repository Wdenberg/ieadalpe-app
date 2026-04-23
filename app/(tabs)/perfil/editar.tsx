import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useAuth } from '@/lib/auth-context';
import { useColors } from '@/hooks/use-colors';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface ObreiroData {
  id: string;
  nome: string;
  funcao: string;
  telefone?: string;
  data_nascimento?: string;
}

export default function EditarPerfilScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user } = useAuth();
  const [obreiro, setObreiro] = useState<ObreiroData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form fields
  const [nome, setNome] = useState('');
  const [funcao, setFuncao] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');

  useEffect(() => {
    const fetchObreiro = async () => {
      if (!user) return;

      try {
        const { data: obreiroData } = await supabase
          .from('obreiros')
          .select('id, nome, funcao, telefone, data_nascimento')
          .eq('user_id', user.id)
          .single();

        if (obreiroData) {
          setObreiro(obreiroData);
          setNome(obreiroData.nome || '');
          setFuncao(obreiroData.funcao || '');
          setTelefone(obreiroData.telefone || '');
          setDataNascimento(obreiroData.data_nascimento || '');
        }
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
        setError('Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchObreiro();
  }, [user]);

  const handleSave = async () => {
    if (!obreiro) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: updateError } = await supabase
        .from('obreiros')
        .update({
          nome,
          funcao,
          telefone: telefone || null,
          data_nascimento: dataNascimento || null,
        })
        .eq('id', obreiro.id);

      if (updateError) {
        setError('Erro ao salvar perfil');
        console.error('Erro ao atualizar:', updateError);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (err) {
      console.error('Erro:', err);
      setError('Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
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
        <View className="bg-primary px-6 py-4 flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-surface/20 rounded-full p-2"
          >
            <Text className="text-surface font-bold text-lg">←</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-surface flex-1">Editar Perfil</Text>
        </View>

        {/* Content */}
        <View className="px-6 py-6 gap-4">
          {/* Error Message */}
          {error && (
            <View className="bg-error/10 border border-error rounded-lg p-3">
              <View className="flex-row justify-between items-start">
                <Text className="text-error text-sm flex-1">{error}</Text>
                <TouchableOpacity onPress={() => setError(null)}>
                  <Text className="text-error font-bold">✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Success Message */}
          {success && (
            <View className="bg-success/10 border border-success rounded-lg p-3">
              <Text className="text-success text-sm font-semibold">✓ Perfil atualizado com sucesso!</Text>
            </View>
          )}

          {/* Nome */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Nome Completo</Text>
            <TextInput
              className={cn(
                'px-4 py-3 rounded-lg border text-foreground bg-surface',
                'border-border'
              )}
              placeholder="Seu nome"
              placeholderTextColor={colors.muted}
              value={nome}
              onChangeText={setNome}
              editable={!saving}
            />
          </View>

          {/* Função */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Função</Text>
            <TextInput
              className={cn(
                'px-4 py-3 rounded-lg border text-foreground bg-surface',
                'border-border'
              )}
              placeholder="Ex: Diácono, Presbítero, Cantor"
              placeholderTextColor={colors.muted}
              value={funcao}
              onChangeText={setFuncao}
              editable={!saving}
            />
          </View>

          {/* Telefone */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Telefone</Text>
            <TextInput
              className={cn(
                'px-4 py-3 rounded-lg border text-foreground bg-surface',
                'border-border'
              )}
              placeholder="(XX) XXXXX-XXXX"
              placeholderTextColor={colors.muted}
              value={telefone}
              onChangeText={setTelefone}
              keyboardType="phone-pad"
              editable={!saving}
            />
          </View>

          {/* Data de Nascimento */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Data de Nascimento</Text>
            <TextInput
              className={cn(
                'px-4 py-3 rounded-lg border text-foreground bg-surface',
                'border-border'
              )}
              placeholder="DD/MM/YYYY"
              placeholderTextColor={colors.muted}
              value={dataNascimento}
              onChangeText={setDataNascimento}
              keyboardType="numeric"
              editable={!saving}
            />
          </View>

          {/* Info */}
          <View className="bg-primary/10 rounded-lg p-4 border border-primary gap-2 mt-4">
            <Text className="text-xs text-primary font-semibold">ℹ️ Informações</Text>
            <Text className="text-xs text-primary leading-relaxed">
              Você pode editar seus dados pessoais. O email não pode ser alterado nesta tela.
            </Text>
          </View>

          {/* Buttons */}
          <View className="gap-3 mt-6">
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              className={cn(
                'rounded-lg p-4 items-center flex-row justify-center gap-2',
                saving ? 'bg-success/50' : 'bg-success'
              )}
            >
              {saving ? (
                <>
                  <ActivityIndicator color={colors.surface} size="small" />
                  <Text className="text-surface font-bold">Salvando...</Text>
                </>
              ) : (
                <>
                  <Text className="text-lg">✓</Text>
                  <Text className="text-surface font-bold">Salvar Alterações</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              disabled={saving}
              className="bg-secondary rounded-lg p-4 items-center"
            >
              <Text className="text-foreground font-bold">Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
