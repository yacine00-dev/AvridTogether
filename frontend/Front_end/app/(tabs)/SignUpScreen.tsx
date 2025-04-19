import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://votre-api.com',
  timeout: 10000,
  headers: {'Content-Type': 'application/json'}
});

const SignUpScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [documentType, setDocumentType] = useState<'id' | 'license' | null>(null);
  const [documentFile, setDocumentFile] = useState(null);

  const renderDocumentTypeSelector = () => (
    <View style={styles.documentTypeContainer}>
      <TouchableOpacity
        style={[
          styles.documentTypeButton, 
          documentType === 'id' && styles.documentTypeSelected
        ]}
        onPress={() => setDocumentType('id')}
      >
        <Text style={styles.documentTypeText}>ID Card</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.documentTypeButton, 
          documentType === 'license' && styles.documentTypeSelected
        ]}
        onPress={() => setDocumentType('license')}
      >
        <Text style={styles.documentTypeText}>Driver's License</Text>
      </TouchableOpacity>
    </View>
  );

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;

    if (!name.trim()) errors.name = 'Name is required';
    if (!phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(phone)) {
      errors.phone = 'Invalid phone number';
    }
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
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    if (!documentType) errors.documentType = 'Document type is required';
    if (!documentFile) errors.document = 'Document file is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDocumentPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      });
      
      if (!result.canceled && result.assets) {
        setDocumentFile(result.assets[0]); 
      }
    } catch (err) {
      console.error('Document picker error:', err);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleSignUp = async () => {
    if (!validateForm() || !documentFile) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('phone', phone);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('documentType', documentType);
      formData.append('document', {
        uri: documentFile.uri,
        name: documentFile.name || 'document.pdf',
        type: documentFile.mimeType || 'application/pdf',
      });

     
      const response = await api.post('/signup', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Success', 'Registration successful!');
      navigation.navigate('SignInScreen');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/logo-light.png')}
            style={styles.logo}
          />
          <Text style={styles.subtitle}>Drive Together, Save Together.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Create Account</Text>
          
          {/* Name Input */}
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={[styles.input, formErrors.name && styles.inputError]}
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          {formErrors.name && <Text style={styles.errorText}>{formErrors.name}</Text>}

          {/* Phone Input */}
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={[styles.input, formErrors.phone && styles.inputError]}
            placeholder="Enter phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          {formErrors.phone && <Text style={styles.errorText}>{formErrors.phone}</Text>}

          {/* Email Input */}
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={[styles.input, formErrors.email && styles.inputError]}
            placeholder="Enter email"
            value={email}
            onChangeText={setEmail}
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
              onChangeText={setPassword}
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

          {/* Confirm Password Input */}
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={[styles.input, formErrors.confirmPassword && styles.inputError]}
            placeholder="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={true}
            autoCapitalize="none"
          />
          
          {formErrors.confirmPassword && <Text style={styles.errorText}>{formErrors.confirmPassword}</Text>}

           {/* Document Upload Section */}
          <Text style={styles.label}>Identity Verification</Text>
          
          {renderDocumentTypeSelector()}
          {formErrors.documentType && 
            <Text style={styles.errorText}>{formErrors.documentType}</Text>}

          <TouchableOpacity
            style={[styles.documentButton, formErrors.document && styles.inputError]}
            onPress={handleDocumentPick}
            disabled={!documentType}
          >
            <Text style={styles.documentButtonText}>
              {documentFile ? documentFile.name : 'Select document...'}
            </Text>
            {documentType && (
              <Text style={styles.documentTypeHint}>
                ({documentType === 'id' ? 'ID Card' : 'Driver\'s License'} PDF)
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.primaryButtonText}>SIGN UP</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Already have an account?{' '}
            <Text 
              style={styles.footerLink}
              onPress={() => navigation.replace('SignInScreen')}
            >
              Sign In
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};


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
  },
  documentButton: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  documentButtonText: {
    color: '#666',
    fontSize: 16,
  },
  documentTypeContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  documentTypeButton: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
  },
  documentTypeSelected: {
    borderColor: '#052659',
    backgroundColor: '#05265920',
  },
  documentTypeText: {
    color: '#052659',
    fontWeight: '500',
  },
  documentTypeHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  }
  

});


export default SignUpScreen;