// src/api.ts
import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getHost = () => {
  if (Platform.OS === 'android') return '10.0.2.2';           // AVD
  // en Expo Go, manifest.debuggerHost = "192.168.1.42:19000"
  const manifest = Constants.manifest as any;
  const debugHost = manifest?.debuggerHost?.split(':')[0];
  return debugHost || '10.0.2.2';                            // iOS Simulator
};

// Interface par défaut pour les réponses API
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class Api {
  private api;

  constructor() {
    this.api = axios.create({
      baseURL: 'https://testat-hsrz.onrender.com/',
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    });
  }

  // Méthode pour la connexion
  async login(email: string, password: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.post('/auth/login', {
        email,
        password,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Une erreur est survenue lors de la connexion',
      };
    }
  }

  // Méthode pour l'inscription
  async register(userData: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.post('/auth/register', userData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Une erreur est survenue lors de l\'inscription',
      };
    }
  }

  // Autres méthodes API...
}

// Export de l'instance API
const api = new Api();
export default api;
