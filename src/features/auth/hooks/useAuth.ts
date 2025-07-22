import { useState, useEffect } from 'react';
import { AuthState, LoginCredentials, SignUpCredentials, UserProfile } from '../types';
import { baserow } from '../../../shared/services/baserowClient';

const USERS_TABLE_ID = '47'; // ID da tabela Usuários

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    profile: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('userProfile');
      if (storedUser) {
        setAuthState({
          profile: JSON.parse(storedUser),
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error("Falha ao carregar perfil do localStorage", error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const handleAuthAction = async (action: () => Promise<any>) => {
    setAuthError(null);
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      await action();
    } catch (error: any) {
      setAuthError(error.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const signUp = async (credentials: SignUpCredentials) => {
    await handleAuthAction(async () => {
      const { results: existingUsers } = await baserow.get(USERS_TABLE_ID, `?filter__field_email__equal=${credentials.email}`);
      if (existingUsers && existingUsers.length > 0) {
        throw new Error('Este e-mail já está cadastrado.');
      }
      
      await baserow.post(USERS_TABLE_ID, {
        nome: credentials.nome,
        empresa: credentials.empresa,
        email: credentials.email,
        senha_hash: credentials.password,
      });
    });
  };

  const signIn = async (credentials: LoginCredentials) => {
    await handleAuthAction(async () => {
      const params = `?filter__field_email__equal=${credentials.email}&filter__field_senha_hash__equal=${credentials.password}`;
      const { results } = await baserow.get(USERS_TABLE_ID, params);

      if (results && results.length > 0) {
        const user = results[0];
        const userProfile: UserProfile = {
          id: user.id,
          nome: user.nome,
          email: user.email,
          empresa: user.empresa,
          avatar_url: user.avatar_url || null,
        };
        
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        setAuthState({ profile: userProfile, isAuthenticated: true, isLoading: false });

      } else {
        throw new Error('E-mail ou senha inválidos.');
      }
    });
  };

  const signOut = () => {
    localStorage.removeItem('userProfile');
    setAuthState({ profile: null, isAuthenticated: false, isLoading: false });
  };

  return {
    ...authState,
    error: authError,
    signUp,
    signIn,
    signOut,
  };
};