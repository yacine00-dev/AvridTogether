import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';

const SignUpScreen: React.FC = () => {
  const router = useRouter();
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [documentType, setDocumentType] = useState<'id'|'license'|null>(null);
  const [documentFile, setDocumentFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs: Record<string,string> = {};
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name.trim()) errs.name = 'Name is required';
    if (!phone.trim()) errs.phone = 'Phone number is required';
    if (!age.trim() || isNaN(+age) || +age < 16 || +age > 100) errs.age = 'Valid age 16–100 required';
    if (!emailRx.test(email)) errs.email = 'Invalid email';
    if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!documentType) errs.documentType = 'Select document type';
    if (!documentFile || documentFile.canceled) errs.document = 'Image upload required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
  
      if (!result.canceled) {
        setDocumentFile({
          canceled: false,
          assets: [{
            uri: result.assets[0].uri,
            name: `image_${Date.now()}.jpg`, // Nom par défaut
            mimeType: 'image/jpeg', // Type MIME par défaut
          }]
        });
      }
    } catch {
      Alert.alert('Error', 'Could not pick image');
    }
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append('username', name);
      fd.append('phone_number', phone);
      fd.append('age', age);
      fd.append('email', email);
      fd.append('password', password);
      fd.append('type_user', documentType === 'license' ? 'conducteur' : 'clien');

      if (documentFile && !documentFile.canceled) {
        fd.append('ppermis_ic', {
          uri: documentFile.assets[0].uri,
          name: documentFile.assets[0].name,
          type: documentFile.assets[0].mimeType
        } as any);
      }

      console.log('FormData contents:', {
        username: name,
        phone_number: phone,
        age: age,
        email: email,
        type_user: documentType === 'license' ? 'conducteur' : 'clien',
        hasDocument: !!(documentFile && !documentFile.canceled)
      });

      // 1. Inscription
      const response = await axios.post(
        'https://testat-hsrz.onrender.com/api/user/register',
        fd,
        { 
          headers: { 
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json'
          } 
        }
      );

      console.log('Registration response:', response.data);

      if (!response.data?.access) {
        throw new Error('Invalid server response - No access token');
      }

      // 2. Décodage du token pour obtenir l'ID utilisateur
      const decodedToken = jwtDecode<{ user_id: number }>(response.data.access);
      const userId = decodedToken.user_id;

      // 3. Récupération des données utilisateur complètes
      const userResponse = await axios.get(`https://testat-hsrz.onrender.com/api/user/id/${userId}/`, {
        headers: { Authorization: `Bearer ${response.data.access}` }
      });

      // 4. Login avec le token et les données utilisateur
      await SecureStore.setItemAsync('refresh_token', response.data.refresh);
      await login(response.data.access, userResponse.data);

      //Alert.alert('Success', 'Account created successfully');
      router.replace('/acceuille/acceuille');
    } catch (error: any) {
      console.error('Registration error:', error.response?.data || error.message);
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        console.log('Error response:', {
          status,
          data,
          headers: error.response.headers
        });
        
        switch (status) {
          case 400:
            errorMessage = data.detail || 'Invalid request data';
            break;
          case 401:
            errorMessage = 'Authentication failed';
            break;
          case 403:
            errorMessage = 'Access forbidden';
            break;
          case 500:
            errorMessage = 'Server error - Please try again later';
            break;
          default:
            errorMessage = data.detail || `Error ${status}: Unknown error`;
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.header}>
          <Image source={require('@/assets/images/logo-light.png')} style={s.logo}/>
          <Text style={s.subtitle}>Drive Together, Save Together.</Text>
        </View>
        <View style={s.form}>
          <Text style={s.title}>Create Account</Text>

          {/* Name */}
          <TextInput
            style={[s.input, errors.name && s.errInput]}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
          />
          {errors.name && <Text style={s.errText}>{errors.name}</Text>}

          {/* Phone */}
          <TextInput
            style={[s.input, errors.phone && s.errInput]}
            placeholder="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          {errors.phone && <Text style={s.errText}>{errors.phone}</Text>}

          {/* Age */}
          <TextInput
            style={[s.input, errors.age && s.errInput]}
            placeholder="Age"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
          />
          {errors.age && <Text style={s.errText}>{errors.age}</Text>}

          {/* Email */}
          <TextInput
            style={[s.input, errors.email && s.errInput]}
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={s.errText}>{errors.email}</Text>}

          {/* Password */}
          <View style={s.passContainer}>
            <TextInput
              style={[s.input, errors.password && s.errInput]}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={s.eye}>
              <MaterialIcons
                name={showPassword ? 'visibility-off' : 'visibility'}
                size={24}
                color="#666"
              />
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={s.errText}>{errors.password}</Text>}

          {/* Confirm Password */}
          <TextInput
            style={[s.input, errors.confirmPassword && s.errInput]}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
          />
          {errors.confirmPassword && <Text style={s.errText}>{errors.confirmPassword}</Text>}

          {/* Document Type */}
          <View style={s.docTypeContainer}>
            <TouchableOpacity style={[s.docBtn, documentType === 'id' && s.docSel]} onPress={() => setDocumentType('id')}>
              <Text>ID Card</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.docBtn, documentType === 'license' && s.docSel]} onPress={() => setDocumentType('license')}>
              <Text>Driver's License</Text>
            </TouchableOpacity>
          </View>
          {errors.documentType && <Text style={s.errText}>{errors.documentType}</Text>}

          {/* Document Picker */}
          <TouchableOpacity style={[s.docBtn, errors.document && s.errInput]} onPress={pickImage} disabled={!documentType}>
            <Text>{documentFile?.assets?.[0]?.name || 'Select Image...'}</Text>
          </TouchableOpacity>
          {errors.document && <Text style={s.errText}>{errors.document}</Text>}

          {/* Submit */}
          <TouchableOpacity style={s.btn} onPress={handleSignUp} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff"/> : <Text style={s.btnText}>SIGN UP</Text>}
          </TouchableOpacity>

          <Text style={s.footerText}>
            Have an account?{' '}
            <Text style={s.link} onPress={() => router.replace('/login')}>Sign In</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
  scroll: { padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: { width: 120, height: 54, tintColor: '#052659' },
  subtitle: { fontSize: 16, color: '#001123', marginBottom: 16 },
  form: {},
  title: { fontSize: 24, fontWeight: '600', color: '#1A1A1A', marginBottom: 24 },
  input: { height: 50, borderWidth: 1, borderColor: '#E0E0E0', backgroundColor: '#F6F6F6', borderRadius: 8, paddingHorizontal: 16, marginBottom: 12, fontSize: 16 },
  errInput: { borderColor: '#FF0000', backgroundColor: '#FFF0F0' },
  errText: { color: '#FF0000', marginBottom: 8, fontSize: 12 },
  passContainer: { position: 'relative' },
  eye: { position: 'absolute', right: 12, top: 13, zIndex: 1 },
  docTypeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 12 },
  docBtn: { flex: 1, height: 40, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginHorizontal: 4, backgroundColor: '#F6F6F6' },
  docSel: { borderColor: '#052659', backgroundColor: '#05265920' },
  btn: { backgroundColor: '#052659', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  footerText: { textAlign: 'center', marginTop: 16, color: '#666' },
  link: { color: '#1877F2', fontWeight: '500' },
});

export default SignUpScreen;
