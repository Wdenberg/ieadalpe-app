import { useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { supabase } from '@/lib/supabase';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

export default function LoginScreen() {
  const router = useRouter();
  const colors = useColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      // Login bem-sucedido, redirecionar para dashboard
      router.replace('/(tabs)');
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        <View className="flex-1 justify-center px-6 gap-8">
          {/* Logo Section */}
          <View className="items-center gap-4">
            <View className="w-24 h-24 bg-primary rounded-full items-center justify-center">
              <Text className="text-4xl font-bold text-surface">✝</Text>
            </View>
            <Text className="text-3xl font-bold text-foreground text-center">IEADALPE</Text>
            <Text className="text-base text-muted text-center">
              Igreja Evangélica Assembleia de Deus
            </Text>
          </View>

          {/* Form Section */}
          <View className="gap-4">
            {/* Email Input */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Email ou CPF</Text>
              <TextInput
                className={cn(
                  'px-4 py-3 rounded-lg border text-foreground',
                  'bg-surface border-border'
                )}
                placeholder="seu@email.com"
                placeholderTextColor={colors.muted}
                value={email}
                onChangeText={setEmail}
                editable={!loading}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password Input */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Senha</Text>
              <TextInput
                className={cn(
                  'px-4 py-3 rounded-lg border text-foreground',
                  'bg-surface border-border'
                )}
                placeholder="••••••••"
                placeholderTextColor={colors.muted}
                value={password}
                onChangeText={setPassword}
                editable={!loading}
                secureTextEntry
              />
            </View>

            {/* Error Message */}
            {error && (
              <View className="bg-error/10 border border-error rounded-lg p-3">
                <Text className="text-error text-sm">{error}</Text>
              </View>
            )}

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading || !email || !password}
              className={cn(
                'py-3 rounded-lg items-center justify-center',
                loading || !email || !password ? 'bg-primary/50' : 'bg-primary'
              )}
            >
              {loading ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text className="text-surface font-semibold text-base">Entrar</Text>
              )}
            </TouchableOpacity>

            {/* Forgot Password Link */}
            <TouchableOpacity className="items-center py-2">
              <Text className="text-primary text-sm font-semibold">Esqueceu a senha?</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="items-center gap-2">
            <Text className="text-xs text-muted text-center">
              Apenas obreiros e membros autorizados podem acessar este aplicativo.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
