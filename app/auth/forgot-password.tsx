import { useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { supabase } from '@/lib/supabase';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const colors = useColors();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async () => {
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      if (!email.trim()) {
        setError('Por favor, insira seu email');
        setLoading(false);
        return;
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'ieadalpe://auth/reset-password',
      });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSuccess(true);
      setEmail('');
    } catch (err) {
      setError('Erro ao enviar email de recuperação. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        <View className="flex-1 justify-center px-6 gap-8">
          {/* Header */}
          <View className="items-center gap-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="self-start bg-primary/10 rounded-full p-2 mb-4"
            >
              <Text className="text-primary font-bold text-lg">←</Text>
            </TouchableOpacity>

            <View className="w-20 h-20 bg-primary rounded-full items-center justify-center">
              <Text className="text-3xl">🔐</Text>
            </View>
            <Text className="text-2xl font-bold text-foreground text-center">
              Recuperar Senha
            </Text>
            <Text className="text-sm text-muted text-center">
              Insira seu email para receber um link de recuperação de senha
            </Text>
          </View>

          {/* Form Section */}
          <View className="gap-4">
            {/* Success Message */}
            {success && (
              <View className="bg-success/10 border border-success rounded-lg p-4">
                <Text className="text-success font-semibold mb-2">✓ Email enviado com sucesso!</Text>
                <Text className="text-success text-sm">
                  Verifique seu email para receber o link de recuperação de senha. O link expira em 24 horas.
                </Text>
              </View>
            )}

            {/* Error Message */}
            {error && (
              <View className="bg-error/10 border border-error rounded-lg p-3">
                <Text className="text-error text-sm">{error}</Text>
              </View>
            )}

            {/* Email Input */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Email</Text>
              <TextInput
                className={cn(
                  'px-4 py-3 rounded-lg border text-foreground',
                  'bg-surface border-border'
                )}
                placeholder="seu@email.com"
                placeholderTextColor={colors.muted}
                value={email}
                onChangeText={setEmail}
                editable={!loading && !success}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Reset Button */}
            <TouchableOpacity
              onPress={handleResetPassword}
              disabled={loading || !email || success}
              className={cn(
                'py-3 rounded-lg items-center justify-center',
                loading || !email || success ? 'bg-primary/50' : 'bg-primary'
              )}
            >
              {loading ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text className="text-surface font-semibold text-base">
                  {success ? 'Email Enviado' : 'Enviar Link de Recuperação'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Back to Login */}
            {success && (
              <TouchableOpacity
                onPress={() => router.replace('/auth/login')}
                className="py-3 rounded-lg items-center justify-center border border-primary"
              >
                <Text className="text-primary font-semibold text-base">Voltar para Login</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Footer */}
          <View className="items-center gap-2">
            <Text className="text-xs text-muted text-center">
              Não recebeu o email? Verifique sua pasta de spam ou entre em contato com o suporte.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
