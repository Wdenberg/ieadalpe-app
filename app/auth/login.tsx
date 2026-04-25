import { useState, useEffect } from 'react';
import {Image, ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { supabase } from '@/lib/supabase';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';
import { useBiometricAuth } from '@/hooks/use-biometric-auth';
import logoIeadalpe from '@/assets/images/logo_igreja.png'

export default function LoginScreen() {
  const router = useRouter();
  const colors = useColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    isBiometricAvailable,
    biometricType,
    isAuthenticating,
    checkBiometricAvailability,
    authenticate,
  } = useBiometricAuth();

  useEffect(() => {
    checkBiometricAvailability();
  }, [checkBiometricAvailability]);

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

      // Disparar função de log de login
      try {
        await supabase.functions.invoke('log-obreiro-login', {
          body: { action: 'login' },
        });
      } catch (logError) {
        console.error('Erro ao registrar log de login:', logError);
        // Continuar mesmo se o log falhar
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

  const handleBiometricLogin = async () => {
    setError(null);
    const result = await authenticate();

    if (result.success) {
      // Se a autenticação biométrica foi bem-sucedida,
      // o usuário já deve estar autenticado no Supabase
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // Disparar função de log de login
        try {
          await supabase.functions.invoke('log-obreiro-login', {
            body: { action: 'biometric_login' },
          });
        } catch (logError) {
          console.error('Erro ao registrar log de login biométrico:', logError);
        }

        router.replace('/(tabs)');
      } else {
        setError('Sessão expirada. Por favor, faça login novamente.');
      }
    } else {
      setError(result.error || 'Falha na autenticação biométrica');
    }
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        <View className="flex-1 justify-center px-6 gap-8">
          {/* Logo Section */}
          <View className="items-center gap-4">
             <View className=" items-center justify-center overflow-hidden" style={{ width: 110, height: 110 }}>
              <Image
                source={logoIeadalpe}
                style={{ width: 99, height: 99 }}
                resizeMode="contain"
              ></Image>
            </View>
            <Text className="text-base text-muted text-center">
              Igreja Evangélica Assembleia de Deus
            </Text>
          </View>

          {/* Form Section */}
          <View className="gap-4">
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
                editable={!loading && !isAuthenticating}
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
                editable={!loading && !isAuthenticating}
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
              disabled={loading || isAuthenticating || !email || !password}
              className={cn(
                'py-3 rounded-lg items-center justify-center',
                loading || isAuthenticating || !email || !password ? 'bg-primary/50' : 'bg-primary'
              )}
            >
              {loading ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text className="py-2 text-surface font-semibold text-base">Entrar</Text>
              )}
            </TouchableOpacity>

            {/* Biometric Login Button */}
            {isBiometricAvailable && (
              <TouchableOpacity
                onPress={handleBiometricLogin}
                disabled={isAuthenticating || loading}
                className="py-3 rounded-lg items-center justify-center border-2 border-warning"
              >
                {isAuthenticating ? (
                  <ActivityIndicator color={colors.warning} />
                ) : (
                  <View className="flex-row items-center gap-2">
                    <Text className="text-2xl">{biometricType === 'Face ID' ? '👤' : '👆'}</Text>
                    <Text className="text-warning font-semibold text-base">
                      Entrar com {biometricType}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            {/* Forgot Password Link */}
            <TouchableOpacity
              onPress={() => router.push('/auth/forgot-password')}
              className="items-center py-2"
            >
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
