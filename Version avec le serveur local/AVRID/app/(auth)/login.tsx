import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import * as SecureStore from 'expo-secure-store';

WebBrowser.maybeCompleteAuthSession();

type FormErrors = {
  email?: string;
  password?: string;
  general?: string;
};

interface User {
  id: number;
  username: string;
  email: string;
  user_pic: string | null;
  phone_number: string | null;
  type_user: 'conducteur' | 'clien';
  ppermis_ic: string | null;
  age: number | null;
}

interface DecodedToken {
  user_id: number;
  exp: number;
  iat: number;
  jti: string;
  token_type: string;
}

const SignInScreen: React.FC = () => {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: 'VOTRE_ID_CLIENT_GOOGLE',
    iosClientId: 'VOTRE_ID_CLIENT_IOS',
    androidClientId: 'VOTRE_ID_CLIENT_ANDROID',
  });

  const validateForm = () => {
    const errors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      errors.email = 'Invalid email format';
    }
    if (!password.trim()) {
      errors.password = 'Password is required';
    } else if (password.length < 4) {
      errors.password = 'Password must be at least 4 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      // 1. Authentification
      const response = await axios.post('http://10.0.2.2:8000/api/token/', {
        email,
        password
      });

      // 2. Décodage du token
      const decodedToken = jwtDecode<{ user_id: number }>(response.data.access);
      const userId = decodedToken.user_id;

      // 3. Récupération des données utilisateur avec l'ID
      const userResponse = await axios.get(`http://10.0.2.2:8000/api/user/id/${userId}/`, {
        headers: { Authorization: `Bearer ${response.data.access}` }
      });

      // 4. Login avec le token et les données utilisateur
      await SecureStore.setItemAsync('refresh_token', response.data.refresh);
      await login(response.data.access, userResponse.data);
      
      router.replace('/(tabs)/home');
    } catch (error: any) {
      let errorMessage = 'An error occurred';
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        switch (status) {
          case 400:
            errorMessage = data.detail || 'Invalid request - Please check your credentials';
            break;
          case 401:
            errorMessage = 'Invalid email or password';
            break;
          case 403:
            errorMessage = 'Access forbidden';
            break;
          case 404:
            errorMessage = 'User not found';
            break;
          case 500:
            errorMessage = 'Server error - Please try again later';
            break;
          default:
            errorMessage = `Error ${status}: ${data.detail || 'Unknown error'}`;
        }
      } else if (error.request) {
        errorMessage = 'Network error - Please check your connection';
      } else if (error.message) {
        errorMessage = error.message;
      }
  
      Alert.alert('Login Error', errorMessage);
      console.error('Login error details:', error);
      
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(v => !v);
  const handleForgotPassword = () => {
    // TODO: implémenter la fonctionnalité de mot de passe oublié
  };

  useEffect(() => {
    if (user) {
      console.log('Utilisateur connecté :', user.user.username);
    }
    if (response?.type === 'success' && response.authentication) {
      handleSocialLoginSuccess('google', response.authentication.accessToken);
    }
  }, [response]);

  const handleSocialLogin = async (provider: string) => {
    if (provider === 'google') {
      await promptAsync();
    }
  };

  const handleSocialLoginSuccess = async (provider: string, providerToken: string) => {
    try {
      /*const res = await axios.post('http://10.0.2.2:8000/api/auth/social-login', { provider, token: providerToken });
      const token = res.data.access;
      //await login(token);
      router.replace('/(tabs)/home');*/
    } catch {
      Alert.alert('Error', 'Social login failed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Image source={require('@/assets/images/logo-light.png')} style={styles.logo} />
          <Text style={styles.subtitle}>Drive Together, Save Together.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Sign In</Text>

          <Text style={styles.label}>Email address</Text>
          <TextInput
            style={[styles.input, formErrors.email && styles.inputError]}
            placeholder="Enter email"
            value={email}
            onChangeText={t => {
              setEmail(t);
              setFormErrors(e => ({ ...e, email: '' }));
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {formErrors.email && <Text style={styles.errorText}>{formErrors.email}</Text>}

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={[styles.input, formErrors.password && styles.inputError]}
              placeholder="Enter password"
              value={password}
              onChangeText={t => {
                setPassword(t);
                setFormErrors(e => ({ ...e, password: '' }));
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.eyeIcon} onPress={togglePasswordVisibility}>
              <MaterialIcons
                name={showPassword ? 'visibility-off' : 'visibility'}
                size={24}
                color="#666"
              />
            </TouchableOpacity>
          </View>
          {formErrors.password && <Text style={styles.errorText}>{formErrors.password}</Text>}
          {formErrors.general && <Text style={styles.generalErrorText}>{formErrors.general}</Text>}

          <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordLink}>
            <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryButton} onPress={handleSignIn} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>CONTINUE</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.separatorContainer}>
          <View style={styles.line} />
          <Text style={styles.separatorText}>Or</Text>
          <View style={styles.line} />
        </View>

        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => handleSocialLogin('google')}
          disabled={!request}
        >
          <Icon name="google" size={20} color="#DB4437" />
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Don't have an account?{' '}
            <Text style={styles.footerLink} onPress={() => router.push('/(auth)/signup')}>
              Sign Up
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
  scrollContent: { flexGrow: 1, padding: 24 },
  header: { alignItems: 'center', marginBottom: 48 },
  logo: { width: 120, height: 54, tintColor: '#052659' },
  subtitle: { fontSize: 16, color: '#001123' },
  form: { marginBottom: 32 },
  sectionTitle: { fontSize: 24, fontWeight: '600', marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  input: {
    height: 50,
    borderWidth: 1,
    backgroundColor: '#F6F6F6',
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    paddingRight: 40,
  },
  inputError: { borderColor: '#FF0000', backgroundColor: '#FFF0F0' },
  errorText: { color: '#FF0000', fontSize: 12, marginBottom: 8, marginTop: -8 },
  generalErrorText: { color: '#FF0000', textAlign: 'center', marginVertical: 10 },
  forgotPasswordLink: { alignSelf: 'flex-end', marginVertical: 10 },
  forgotPasswordText: { fontSize: 14, textDecorationLine: 'underline' },
  primaryButton: { backgroundColor: '#052659', height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  passwordInputContainer: { position: 'relative', marginBottom: 16 },
  eyeIcon: { position: 'absolute', right: 15, top: 13, zIndex: 1 },
  separatorContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: '#D0D3D4' },
  separatorText: { marginHorizontal: 10, color: '#566573', fontSize: 14 },
  socialButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 50, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8 },
  socialButtonText: { fontSize: 16, fontWeight: '500', color: '#1A1A1A' },
  footer: { alignItems: 'center' },
  footerText: { color: '#666', fontSize: 14 },
  footerLink: { color: '#1877F2', fontWeight: '500' },
});

export default SignInScreen;