import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getAnonymousUserId } from '@/lib/supabase';

// Definir a interface do contexto de autenticação
interface AuthContextType {
  session: Session | null;
  user: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  userId: string | null;
}

// Criar o contexto com um valor padrão
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para usar o contexto de autenticação
// Deve ser uma função nomeada para compatibilidade com o Fast Refresh
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

// Definir as props do provedor
interface AuthProviderProps {
  children: ReactNode;
}

// Componente provedor
export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(() => {
    // Verificar se há um ID de usuário no localStorage ou usar anônimo
    const savedUserId = localStorage.getItem('user_id');
    if (!savedUserId) {
      const anonymousId = getAnonymousUserId();
      localStorage.setItem('user_id', anonymousId);
      return anonymousId;
    }
    return savedUserId;
  });
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Verificar se o usuário é admin (ajuste conforme sua lógica)
        if (session?.user?.email === 'admin@example.com') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        throw error;
      }

      navigate('/admin');
    } catch (error) {
      console.error('Erro de login:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message);
        throw error;
      }
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signIn,
        signOut,
        isAdmin,
        userId
      }}
    >
      {children}
    </AuthContext.Provider>
  );
} 