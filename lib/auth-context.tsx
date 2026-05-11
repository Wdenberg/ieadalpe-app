import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { usePathname, useRouter, useSegments } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useSecureToken } from '@/hooks/use-secure-token';
import type { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  userRole: 'admin' | 'obreiro' | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'obreiro' | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();
  const { saveAccessToken, saveRefreshToken, clearTokens } = useSecureToken();
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pathname = usePathname();

  /**
   * Configurar refresh automático de tokens
   */
  const setupTokenRefresh = (session: Session) => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    // Calcular tempo até expiração (com margem de 5 minutos)
    const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
    const now = Date.now();
    const timeUntilExpiry = expiresAt - now - 5 * 60 * 1000; // 5 minutos antes

    if (timeUntilExpiry > 0) {
      refreshTimerRef.current = setTimeout(async () => {
        try {
          const { data, error } = await supabase.auth.refreshSession();
          if (error) {
            console.error('Erro ao renovar token:', error);
            await signOut();
          } else if (data.session) {
            setSession(data.session);
            await saveAccessToken(data.session.access_token);
            if (data.session.refresh_token) {
              await saveRefreshToken(data.session.refresh_token);
            }
            setupTokenRefresh(data.session);
          }
        } catch (err) {
          console.error('Erro ao renovar sessão:', err);
        }
      }, Math.max(timeUntilExpiry, 1000));
    }
  };

  /**
   * Obter role do usuário a partir de claims customizados
   */
  const getUserRole = (user: User): 'admin' | 'obreiro' | null => {
    const role = user.user_metadata?.role || user.app_metadata?.role;
    if (role === 'admin' || role === 'obreiro') {
      return role;
    }
    return null;
  };

  /**
   * Inicializar autenticação
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Obter sessão inicial
        const { data: { session: initialSession } } = await supabase.auth.getSession();

        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
          setUserRole(getUserRole(initialSession.user));

          // Salvar tokens de forma segura
          await saveAccessToken(initialSession.access_token);
          if (initialSession.refresh_token) {
            await saveRefreshToken(initialSession.refresh_token);
          }

          // Configurar refresh automático
          setupTokenRefresh(initialSession);
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        setUserRole(getUserRole(newSession.user));

        // Salvar tokens
        await saveAccessToken(newSession.access_token);
        if (newSession.refresh_token) {
          await saveRefreshToken(newSession.refresh_token);
        }

        // Configurar refresh automático
        setupTokenRefresh(newSession);
      } else {
        setUserRole(null);
        await clearTokens();
        if (refreshTimerRef.current) {
          clearTimeout(refreshTimerRef.current);
        }
      }
    });

    return () => {
      subscription?.unsubscribe();
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [saveAccessToken, saveRefreshToken, clearTokens]);

  /**
   * Proteção de rotas
   */
  useEffect(() => {
    if (loading) return;

    // 1. Checa se o usuário está na tela inicial (animação)
    // O pathname '/' é exatamente a sua app/index.tsx
    const isIndexPage = pathname === '/';

    // 2. Checa se está dentro do grupo de autenticação
    const inAuthGroup = segments[0] === 'auth';

    // Se estiver na tela de animação, SAIA do useEffect e não redirecione!
    if (isIndexPage) return;

    if (!session && !inAuthGroup) {
      router.replace('/auth/login');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, loading, segments, router]);

  /**
   * Fazer logout
   */
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setUserRole(null);
      await clearTokens();

      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }

      router.replace('/auth/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, userRole, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
