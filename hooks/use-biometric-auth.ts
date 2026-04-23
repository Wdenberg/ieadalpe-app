import { useState, useCallback } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
}

export function useBiometricAuth() {
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Verificar disponibilidade de autenticação biométrica
  const checkBiometricAvailability = useCallback(async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricAvailable(compatible);

      if (compatible) {
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('Face ID');
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('Fingerprint');
        } else {
          setBiometricType('Biometric');
        }
      }

      return compatible;
    } catch (error) {
      console.error('Erro ao verificar autenticação biométrica:', error);
      setIsBiometricAvailable(false);
      return false;
    }
  }, []);

  // Autenticar com biometria
  const authenticate = useCallback(async (): Promise<BiometricAuthResult> => {
    try {
      setIsAuthenticating(true);

      const isAvailable = await LocalAuthentication.hasHardwareAsync();
      if (!isAvailable) {
        return {
          success: false,
          error: 'Autenticação biométrica não disponível neste dispositivo',
        };
      }

      const result = await LocalAuthentication.authenticateAsync({
        fallbackLabel: 'Use sua senha',
        disableDeviceFallback: false,
      });

      if (result.success) {
        // Salvar que o usuário se autenticou com biometria
        await AsyncStorage.setItem('biometric_authenticated', 'true');
        return { success: true };
      } else {
        return {
          success: false,
          error: 'Autenticação biométrica falhou',
        };
      }
    } catch (error) {
      console.error('Erro na autenticação biométrica:', error);
      return {
        success: false,
        error: 'Erro ao tentar autenticar com biometria',
      };
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  // Verificar se o usuário já se autenticou com biometria
  const isBiometricAuthenticated = useCallback(async (): Promise<boolean> => {
    try {
      const authenticated = await AsyncStorage.getItem('biometric_authenticated');
      return authenticated === 'true';
    } catch (error) {
      console.error('Erro ao verificar autenticação biométrica:', error);
      return false;
    }
  }, []);

  // Limpar autenticação biométrica
  const clearBiometricAuth = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('biometric_authenticated');
    } catch (error) {
      console.error('Erro ao limpar autenticação biométrica:', error);
    }
  }, []);

  return {
    isBiometricAvailable,
    biometricType,
    isAuthenticating,
    checkBiometricAvailability,
    authenticate,
    isBiometricAuthenticated,
    clearBiometricAuth,
  };
}
