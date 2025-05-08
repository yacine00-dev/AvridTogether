import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import * as ImagePicker from 'expo-image-picker';

const API_BASE = 'https://testat-hsrz.onrender.com/api/';
const PRIMARY_COLOR = '#191970';

// Configuration globale d'axios
axios.defaults.timeout = 30000; // 30 secondes
axios.defaults.maxContentLength = 50 * 1024 * 1024; // 50MB max

interface UserData {
  id: number;
  email: string;
  username: string;
  phone_number: string | null;
  type_user: 'conducteur' | 'clien';
  age: number;
  ppermis_ic: string | null;
  user_pic: string | null;
}

interface UpdateData {
  email: string;
  username: string;
  age: number;
  type_user: 'conducteur' | 'clien';
  phone_number?: string | null;
}

// Ajout d'une fonction pour vérifier si l'URL est valide
const isValidImageUrl = (url: string) => {
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('file://');
};

const EditProfileScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const userData: UserData = JSON.parse(params.userData as string);

  const [username, setUsername] = useState(userData.username);
  const [email, setEmail] = useState(userData.email);
  const [phoneNumber, setPhoneNumber] = useState(userData.phone_number || '');
  const [age, setAge] = useState(userData.age.toString());
  const [loading, setLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(userData.user_pic);
  const [permisImage, setPermisImage] = useState<string | null>(userData.ppermis_ic);

  const pickImage = async (type: 'profile' | 'permis') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        // Get file extension
        const fileExtension = uri.split('.').pop()?.toLowerCase() || 'jpg';
        // Get file name from uri
        const fileName = uri.split('/').pop() || `image_${Date.now()}.${fileExtension}`;
        
        if (type === 'profile') {
          setProfilePicture(uri);
        } else {
          setPermisImage(uri);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
    }
  };

  const createFormDataEntry = (uri: string, fieldName: string) => {
    if (!uri || uri.startsWith('http')) return null;
    
    // Remove file:// prefix for iOS
    const fileUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
    const fileExtension = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${fieldName}_${Date.now()}.${fileExtension}`;

    return {
      uri: fileUri,
      type: `image/${fileExtension}`,
      name: fileName
    };
  };

  const handleSubmit = async () => {
    if (!username || !email || !age) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (!token) throw new Error('Token d\'authentification non trouvé');

      const formData = new FormData();
      
      // Ajouter les données de base
      formData.append('email', email);
      formData.append('username', username);
      formData.append('age', age.toString());
      formData.append('type_user', userData.type_user);
      if (phoneNumber) {
        formData.append('phone_number', phoneNumber);
      }

      // Ajouter les images seulement si elles ont été modifiées et sont valides
      if (profilePicture && !profilePicture.startsWith('http')) {
        const fileUri = Platform.OS === 'ios' ? profilePicture.replace('file://', '') : profilePicture;
        console.log('Profile picture URI:', fileUri);
        if (isValidImageUrl(fileUri)) {
          const fileName = profilePicture.split('/').pop() || `profile_${Date.now()}.jpg`;
          formData.append('user_pic', {
            uri: fileUri,
            type: 'image/jpeg',
            name: fileName,
          } as any);
        }
      }

      if (permisImage && !permisImage.startsWith('http')) {
        // Ne pas traiter les chemins qui commencent par /backend/
        if (!permisImage.startsWith('/backend/')) {
          const fileUri = Platform.OS === 'ios' ? permisImage.replace('file://', '') : permisImage;
          console.log('Permis image URI:', fileUri);
          if (isValidImageUrl(fileUri)) {
            const fileName = permisImage.split('/').pop() || `permis_${Date.now()}.jpg`;
            formData.append('ppermis_ic', {
              uri: fileUri,
              type: 'image/jpeg',
              name: fileName,
            } as any);
          }
        }
      }

      console.log('API URL:', `${API_BASE}user/update`);
      console.log('Form data:', JSON.stringify(Array.from((formData as any).entries())));

      // Tentative avec axios
      try {
        const response = await axios.put(`${API_BASE}user/update`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
          },
          timeout: 10000, // 10 secondes timeout
        });

        console.log('Server response:', response.data);
        Alert.alert(
          'Succès',
          'Profil mis à jour avec succès',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } catch (axiosError) {
        console.error('Axios error:', axiosError);
        
        // Si axios échoue, essayer fetch
        try {
          const response = await fetch(`${API_BASE}user/update`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'multipart/form-data',
            },
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          console.log('Server response:', result);
          Alert.alert(
            'Succès',
            'Profil mis à jour avec succès',
            [{ text: 'OK', onPress: () => router.back() }]
          );
        } catch (fetchError) {
          console.error('Fetch error:', fetchError);
          throw new Error(fetchError instanceof Error ? fetchError.message : 'Erreur de connexion réseau');
        }
      }
    } catch (error: any) {
      console.error('Update error:', error);
      
      let errorMessage = 'Impossible de mettre à jour le profil. ';
      if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Erreur de connexion au serveur. Vérifiez votre connexion internet et que le serveur est accessible.';
      }

      Alert.alert('Erreur', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Modifier le profil</Text>

        <TextInput
          label="Nom d'utilisateur"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          mode="outlined"
          activeOutlineColor={PRIMARY_COLOR}
        />

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          mode="outlined"
          activeOutlineColor={PRIMARY_COLOR}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          label="Numéro de téléphone"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          style={styles.input}
          mode="outlined"
          activeOutlineColor={PRIMARY_COLOR}
          keyboardType="phone-pad"
        />

        <TextInput
          label="Âge"
          value={age}
          onChangeText={setAge}
          style={styles.input}
          mode="outlined"
          activeOutlineColor={PRIMARY_COLOR}
          keyboardType="numeric"
        />

        <View style={styles.imageButtonsContainer}>
          <Button
            mode="outlined"
            onPress={() => pickImage('profile')}
            style={styles.imageButton}
            icon="camera"
          >
            {profilePicture ? 'Changer la photo' : 'Ajouter une photo'}
          </Button>

          {userData.type_user === 'conducteur' && (
            <Button
              mode="outlined"
              onPress={() => pickImage('permis')}
              style={styles.imageButton}
              icon="card-account-details"
            >
              {permisImage ? 'Changer le permis' : 'Ajouter le permis'}
            </Button>
          )}
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
          loading={loading}
          disabled={loading}
        >
          Enregistrer les modifications
        </Button>

        <Button
          mode="outlined"
          onPress={() => router.back()}
          style={styles.cancelButton}
          disabled={loading}
        >
          Annuler
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  imageButtonsContainer: {
    flexDirection: 'column',
    gap: 10,
    marginBottom: 20,
  },
  imageButton: {
    marginVertical: 5,
    borderColor: PRIMARY_COLOR,
  },
  submitButton: {
    marginBottom: 10,
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 6,
  },
  cancelButton: {
    borderColor: PRIMARY_COLOR,
  },
});

export default EditProfileScreen; 