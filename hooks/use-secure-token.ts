import * as SecureStore from 'expo-secure-store';
import { useCallback } from 'react';

const TOKEN_KEY = 'supabase_token';
const REFRESH_TOKEN_KEY = 'supabase_refresh_token';

export function useSecureToken() {
  /**
   * Salvar token de acesso de forma segura
   */
  const saveAccessToken = useCallback(async (token: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
      console.error('Erro ao salvar token de acesso:', error);
      throw new Error('Falha ao salvar token de acesso');
    }
  }, []);

  /**
   * Obter token de acesso armazenado
   */
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
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
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Erro ao salvar token de refresh:', error);
      throw new Error('Falha ao salvar token de refresh');
    }
  }, []);

  /**
   * Obter token de refresh armazenado
   */
  const getRefreshToken = useCallback(async (): Promise<string | null> => {
    try {
      const token = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
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
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Erro ao limpar tokens:', error);
      throw new Error('Falha ao limpar tokens');
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
