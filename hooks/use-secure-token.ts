import * as SecureStore from 'expo-secure-store';
import { useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'supabase_token';
const REFRESH_TOKEN_KEY = 'supabase_refresh_token';

export function useSecureToken() {
  /**
   * Salvar token de acesso de forma segura
   */
  const saveAccessToken = useCallback(async (token: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem(TOKEN_KEY, token);
      } else {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      }
    } catch (error) {
      console.error('Erro ao salvar token de acesso:', error);
      // Nao lancar erro para nao quebrar o fluxo de autenticacao
    }
  }, []);

  /**
   * Obter token de acesso armazenado
   */
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      let token: string | null;
      if (Platform.OS === 'web') {
        token = await AsyncStorage.getItem(TOKEN_KEY);
      } else {
        token = await SecureStore.getItemAsync(TOKEN_KEY);
      }
      return token || null;
    } catch (error) {
      console.error('Erro ao obter token de acesso:', error);
      return null;
    }
  }, []);

  /**
   * Salvar token de refresh de forma segura
   */
  const saveRefreshToken = useCallback(async (token: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
      } else {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
      }
    } catch (error) {
      console.error('Erro ao salvar token de refresh:', error);
      // Nao lancar erro para nao quebrar o fluxo de autenticacao
    }
  }, []);

  /**
   * Obter token de refresh armazenado
   */
  const getRefreshToken = useCallback(async (): Promise<string | null> => {
    try {
      let token: string | null;
      if (Platform.OS === 'web') {
        token = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      } else {
        token = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      }
      return token || null;
    } catch (error) {
      console.error('Erro ao obter token de refresh:', error);
      return null;
    }
  }, []);

  /**
   * Limpar todos os tokens
   */
  const clearTokens = useCallback(async (): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.removeItem(TOKEN_KEY).catch(() => {
          // Ignorar erro se a chave nao existe
        });
        await AsyncStorage.removeItem(REFRESH_TOKEN_KEY).catch(() => {
          // Ignorar erro se a chave nao existe
        });
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {
          // Ignorar erro se a chave nao existe
        });
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY).catch(() => {
          // Ignorar erro se a chave nao existe
        });
      }
    } catch (error) {
      console.error('Erro ao limpar tokens:', error);
      // Nao lancar erro para nao quebrar o logout
    }
  }, []);

  /**
   * Verificar se token existe
   */
  const hasToken = useCallback(async (): Promise<boolean> => {
    const token = await getAccessToken();
    return !!token;
  }, [getAccessToken]);

  return {
    saveAccessToken,
    getAccessToken,
    saveRefreshToken,
    getRefreshToken,
    clearTokens,
    hasToken,
  };
}
