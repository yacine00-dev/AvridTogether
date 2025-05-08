// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios, { AxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

interface UserData {
  id: number;
  username: string;
  email: string;
  user_pic: string | null;
  phone_number: string | null;
  type_user: 'conducteur' | 'clien';
  ppermis_ic: string | null;
  age: number;
}

interface User {
  user: UserData;
  token: string;
}

interface DecodedToken {
  user_id: number;
  exp: number;
  iat: number;
  jti: string;
  token_type: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
}

interface AuthContextType extends AuthState {
  login: (token: string, userData: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const api = axios.create({
  baseURL: 'http://10.0.2.2:8000/api/',
  timeout: 10000,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  });

  // Ajout d'un intercepteur de requête pour s'assurer que le token est toujours présent
  api.interceptors.request.use(
    async (config) => {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Intercepteur de réponse pour gérer les erreurs d'authentification
  api.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
      if (error.response?.status === 401) {
        // Token expiré ou invalide
        await SecureStore.deleteItemAsync('auth_token');
        setState({ isAuthenticated: false, isLoading: false, user: null });
        router.replace('/login');
      }
      return Promise.reject(error);
    }
  );

  const loadUser = async (token: string) => {
    try {
      console.log('Loading user data with token...');
      const decodedToken = jwtDecode<DecodedToken>(token);
      const userId = decodedToken.user_id;
      console.log('Decoded token, user_id:', userId);

      const response = await api.get<UserData>(`user/id/${userId}/`);
      console.log('User data response:', response.data);
      if (!response.data || !response.data.username) {
        console.log('Invalid user data received');
        return null;
      }
      return { user: response.data, token: token };
    } catch (error) {
      console.error('Erreur de chargement utilisateur:', error);
      throw error;
    }
  };

  const initializeAuth = async () => {
    try {
      console.log('Initializing auth...');
      const token = await SecureStore.getItemAsync('auth_token');
      if (!token) {
        console.log('No token found, user is not authenticated');
        setState(s => ({ ...s, isLoading: false }));
        return;
      }

      console.log('Token found, loading user data...');
      const user = await loadUser(token);
      console.log('User data loaded:', user);
      if (user) {
        setState({
          isAuthenticated: true,
          isLoading: false,
          user: user
        });
      } else {
        console.log('No user data returned from loadUser');
        await SecureStore.deleteItemAsync('auth_token');
        setState({ isAuthenticated: false, isLoading: false, user: null });
      }
    } catch (error) {
      console.error('Erreur d\'initialisation:', error);
      await SecureStore.deleteItemAsync('auth_token');
      setState({ isAuthenticated: false, isLoading: false, user: null });
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const login = async (token: string, userData: User) => {
    try {
      await SecureStore.setItemAsync('auth_token', token);
      setState({
        isAuthenticated: true,
        isLoading: false,
        user: userData,
      });
    } catch (error) {
      console.error('Erreur de login:', error);
      await logout();
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      const refreshToken = await SecureStore.getItemAsync('refresh_token');
      if (token && refreshToken) {
        // Suppression du token côté serveur
        const response = await api.post('user/logout/', {
          refresh: refreshToken
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          validateStatus: (status) => {
            return status >= 200 && status < 300 || status === 205; // Accepter le code 205 comme succès
          }
        });
        
        // Si on arrive ici, la déconnexion a réussi
        console.log('Logout successful:', response.status);

        // Nettoyage local après la déconnexion réussie
        await SecureStore.deleteItemAsync('auth_token');
        await SecureStore.deleteItemAsync('refresh_token');
        setState({ isAuthenticated: false, isLoading: false, user: null });
        
        // Redirection après le nettoyage
        router.replace('/login');
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // En cas d'erreur, on nettoie quand même
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('refresh_token');
      setState({ isAuthenticated: false, isLoading: false, user: null });
      router.replace('/login');
    }
  };

  const refreshUser = async () => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token && state.user) {
      try {
        const user = await loadUser(token);
        setState(s => ({ ...s, user }));
      } catch (error) {
        console.error('Échec de l\'actualisation:', error);
        await logout();
      }
    }
  };

  const updateUser = (userData: Partial<User>) => {
    console.log('Updating user data:', userData);
    setState(s => {
      if (!s.user) return s;
      const updatedUser = { ...s.user, ...userData };
      console.log('Updated user state:', updatedUser);
      return {
        ...s,
        user: updatedUser as User
      };
    });
  };

  const checkAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (!token) {
        router.replace('/login');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Erreur de vérification d\'authentification:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      ...state, 
      login, 
      logout, 
      updateUser,
      refreshUser,
      checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};