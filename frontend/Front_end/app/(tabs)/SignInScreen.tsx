import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image, Animated, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession(); {/*Nécessaire pour Expo Web */}

  {/*Configuration d'Axios*/}
const api = axios.create({
  baseURL: 'https: votre-api.com',
  timeout: 10000,
  headers: {'Content-Type': 'application/json'}
});

const SignInScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: 'VOTRE_ID_CLIENT_GOOGLE', 
    iosClientId: 'VOTRE_ID_CLIENT_IOS',  
    androidClientId: 'VOTRE_ID_CLIENT_ANDROID',  
  });
  
     {/*Validation du formulaire*/}
   const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      errors.email = 'Invalid email format';
    }

    if (!password.trim()) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

     {/*Soumission du formulaire*/}
   const handleSignIn = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await api.post('/login', {
        email,
        password
      });
      await AsyncStorage.setItem('authToken', data.token);
       {/* Gérer la réponse réussie*/}
      console.log('Login successful:', response.data);
      navigation.navigate('Home');

    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

    {/*Gestion des erreurs API*/}
  const handleApiError = (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          setFormErrors({ general: 'Invalid email or password' });
          break;
        case 500:
          Alert.alert('Error', 'Server error, please try again later');
          break;
        default:
          Alert.alert('Error', 'An unexpected error occurred');
      }
    } else if (error.request) {
      Alert.alert('Error', 'No response from server');
    } else {
      Alert.alert('Error', 'Request failed to send');
    }
  };

  const handleForgotPassword = () => {
      {/*Navigation vers l'écran de réinitialisation*/}
    navigation.navigate('ResetPassword');
      {/*Ou ouvrir un modal/API*/}
  };

    {/*Fonction pour basculer la visibilité*/}
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
       {/* Envoyez le token à votre backend pour vérification*/}
      handleSocialLoginSuccess('google', authentication.accessToken);
    }
  }, [response]);

  const handleSocialLogin = async (provider) => {
    if (provider === 'google') {
      await promptAsync();   {/*Démarre le flux d'authentification Google*/}
    } else {
      console.log('Fournisseur non pris en charge');
    }
  };

  const handleSocialLoginSuccess = async (provider, token) => {
    try {
        {/*Envoyez le token à votre backend pour vérification*/}
      const response = await axios.post('/auth/social-login', {
        provider,
        token,
      });

       {/* Gérer la réponse réussie*/}
      console.log('Connexion réussie :', response.data);
        navigation.navigate('Home');   {/*Redirigez l'utilisateur*/}
    } catch (error) {
      console.error('Erreur de connexion sociale :', error);
      Alert.alert('Erreur', 'La connexion sociale a échoué');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.header}>
        <Image
        source={require('@/assets/images/logo-light.png')}
        style={{
          width: 120,
          height: 54,
          tintColor: '#052659'
        }}
          />
          <Text style={styles.subtitle}>Drive Together, Save Together.</Text>
        </View>

        {/* Sign In Form */}
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Sign In</Text>
          <View style={{ height: 20 }} />

          {/* Email Input */}
          <Text style={styles.label}>Address email</Text>
          <TextInput
            style={[styles.input, formErrors.email && styles.inputError]}
            placeholder="Enter email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setFormErrors(prev => ({...prev, email: ''}));
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {formErrors.email && <Text style={styles.errorText}>{formErrors.email}</Text>}


          
           {/* Password Input */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={[styles.input, formErrors.password && styles.inputError]}
              placeholder="Enter password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setFormErrors(prev => ({...prev, password: ''}));
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />

          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={togglePasswordVisibility}
          >
            <MaterialIcons
              name={showPassword ? 'visibility-off' : 'visibility'}
              size={24}
              color="#666"
            />
          </TouchableOpacity>
          

          </View>
          {formErrors.password && <Text style={styles.errorText}>{formErrors.password}</Text>}

          {formErrors.general && (
            <Text style={styles.generalErrorText}>{formErrors.general}</Text>
          )}

          {/* Lien "Mot de passe oublié" */}
          <TouchableOpacity 
            onPress={handleForgotPassword}
            style={styles.forgotPasswordLink}
          >
            <Text style={styles.forgotPasswordText}>Forgot your password ?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.primaryButtonText}>CONTINUE</Text>
            )}
          </TouchableOpacity>
        </View>

        

          

          
        


        {/* Votre backend doit valider le token Google reçu */}

        {/* Social Sign In */}
        <Separator /> {/* Ligne "ou" ici */}

        {/* Bouton Google */}
        <TouchableOpacity 
          style={styles.socialButton}
          onPress={() => handleSocialLogin('google')}
          disabled={!request}
        >
          <Icon name="google" size={20} color="#DB4437" />
          <Text style={styles.socialButtonText}>Continue with google</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />

        {/* Sign Up Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Don't have an account?{' '}
            <Text 
              style={styles.footerLink}
              onPress={() => navigation.navigate('SignUpScreen')}
            >
              SignUp
          </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};





const Separator = () => (
  <View style={styles.separatorContainer}>
    <View style={styles.line} />
    <Text style={styles.separatorText}>Or</Text>
    <View style={styles.line} />
  </View>
);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#001123',
  },
  form: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 24,
  },
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
  primaryButton: {
    backgroundColor: '#052659',
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  socialContainer: {
    gap: 12,
    marginBottom: 32,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
  },
  footerLink: {
    color: '#1877F2',
    fontWeight: '500',
  },
  logo: {
    width: 120,
    height: 54,
    tintColor: '#052659'
  },
  label: {
    fontSize: 16,
    fontWeight: '600',  
    color: '#171718', 
    marginBottom: 8,  
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginVertical: 10,
  },
  forgotPasswordText: {
    color: '#3498DB',
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#D0D3D4',
  },
  separatorText: {
    marginHorizontal: 10,
    color: '#566573',
    fontSize: 14,
  },
  passwordInputContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
    zIndex: 1,
  },
  inputError: {
    borderColor: '#FF0000',
    backgroundColor: '#FFF0F0'
  },
  errorText: {
    color: '#FF0000',
    fontSize: 12,
    marginBottom: 8,
    marginTop: -8
  },
  generalErrorText: {
    color: '#FF0000',
    textAlign: 'center',
    marginVertical: 10
  }
  

});


export default SignInScreen;