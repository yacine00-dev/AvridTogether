import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

type User = {
  id: number;
  name: string;
  email: string;
  bio?: string;
  photo?: string; // Propriété photo optionnelle
  phone?: string;
  age?: number;
  // Ajoutez d'autres champs selon vos besoins
};

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void; // Nouvelle fonction pour mettre à jour les données utilisateur
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        try {
          const response = await axios.get('https://votre-api.com/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Erreur lors de la récupération du profil', error);
          await SecureStore.deleteItemAsync('auth_token');
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (token: string) => {
    await SecureStore.setItemAsync('auth_token', token);
    try {
      const response = await axios.get('https://votre-api.com/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Erreur lors du login (récupération utilisateur)', error);
      throw new Error('Unable to fetch user profile');
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('auth_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Fonction pour mettre à jour les données utilisateur
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  return (
    <AuthContext.Provider
      value={{ 
        isAuthenticated, 
        isLoading, 
        user, 
        login, 
        logout,
        updateUser // Ajout de la nouvelle fonction
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};