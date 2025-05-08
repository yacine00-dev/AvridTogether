import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { Button } from "react-native-paper";
import { useAuth } from '../../context/AuthContext';
import { Redirect, useRouter } from "expo-router";
import axios from 'axios';
import { Star } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';

const API_BASE = 'http://10.0.2.2:8000/api/';
const MEDIA_BASE = 'http://10.0.2.2:8000';
const PRIMARY_COLOR = '#191970';

interface UserProfile {
  user: {
    id: number;
    email: string;
    username: string;
    phone_number: string | null;
    type_user: 'conducteur' | 'clien';
    age: number;
    ppermis_ic: string | null;
    user_pic: string | null;
  };
}

interface Comment {
  id: number;
  rating: number;
  comment: string;
  author_comment: {
    username: string;
    user_pic: string | null;
  };
  created_at: string;
}

const ProfileScreen = () => {
  const { user: authUser, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [averageRating, setAverageRating] = useState(0);

  const fetchProfile = async () => {
    if (!authUser?.user?.username) {
      setError("Utilisateur non identifié");
      return;
    }

    setProfileLoading(true);
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (!token) {
        throw new Error('Token d\'authentification non trouvé');
      }

      const response = await axios.get<UserProfile>(
        `${API_BASE}user/${authUser.user.username}/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setProfile(response.data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération du profil:', err);
      setError("Impossible de charger le profil");
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchComments = async () => {
    if (!authUser?.user?.username) return;

    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (!token) throw new Error('Token d\'authentification non trouvé');

      const response = await axios.get<Comment[]>(
        `${API_BASE}user/comments/${authUser.user.username}/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setComments(response.data);
      
      if (response.data.length > 0) {
        const totalRating = response.data.reduce((sum, comment) => sum + comment.rating, 0);
        setAverageRating(totalRating / response.data.length);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des commentaires:', err);
    }
  };

  useEffect(() => {
    if (authUser?.user?.username) {
      fetchProfile();
      fetchComments();
    }
  }, [authUser?.user?.username]);

  const onRefresh = () => {
    setRefreshing(true);
    Promise.all([fetchProfile(), fetchComments()]).finally(() => {
      setRefreshing(false);
    });
  };

  const handleLogout = async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      const refreshToken = await SecureStore.getItemAsync('refresh_token');
      
      if (token && refreshToken) {
        await axios.post(
          `${API_BASE}user/logout`,
          { refresh: refreshToken },
          { headers: { 'Authorization': `Bearer ${token}` }}
        );
      }
      await logout();
      router.replace('/login');
    } catch (error) {
      //console.error('Erreur lors de la déconnexion:', error);
      router.replace('/login');
    }
  };

  const handleDeleteAccount = async () => {
    if (!profile?.user?.username) {
      Alert.alert("Erreur", "Impossible de supprimer le compte : utilisateur non identifié");
      return;
    }

    Alert.alert(
      "Suppression du compte",
      "Voulez-vous vraiment supprimer votre compte ? Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive", 
          onPress: async () => {
            try {
              setProfileLoading(true);
              const token = await SecureStore.getItemAsync('auth_token');
              if (!token) throw new Error('Token d\'authentification non trouvé');

              await axios.delete(
                `${API_BASE}user/delete/${profile.user.username}/`,
                { headers: { 'Authorization': `Bearer ${token}` }}
              );

              await SecureStore.deleteItemAsync('auth_token');
              await logout();
              router.replace('/login');
            } catch (err) {
              //console.error('Erreur lors de la suppression du compte:', err);
              router.replace('/login');
              // Alert.alert(
              //   "Erreur",
              //   "Impossible de supprimer le compte. Veuillez réessayer plus tard."
              // );
            } finally {
              setProfileLoading(false);
              router.replace('/login');
            }
          }
        }
      ]
    );
  };

  const renderStars = (count: number) => (
    <View style={styles.starsContainer}>
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          size={16}
          color={index < count ? '#FFD700' : '#ccc'}
          fill={index < count ? '#FFD700' : 'none'}
        />
      ))}
    </View>
  );

  const getImageUrl = (path: string | null): string | undefined => {
    if (!path) return undefined;
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/\/+/g, '/').replace(/^\//, '');
    return `${MEDIA_BASE}/${cleanPath}`;
  };

  if (authLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  if (!authUser) {
    return <Redirect href="/login" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[PRIMARY_COLOR]}
          />
        }
      >
        {profileLoading && (
          <ActivityIndicator size="large" color={PRIMARY_COLOR} style={styles.loader} />
        )}

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        {profile && !profileLoading && (
          <>
            <View style={styles.header}>
              <Image
                source={
                  profile.user.user_pic
                    ? { uri: getImageUrl(profile.user.user_pic) }
                    : require('../../assets/images/photo_profil.jpg')
                }
                style={styles.profileImage}
                onError={(e) => {
                  console.error('Image loading error:', e.nativeEvent.error);
                  console.log('Attempted image URL:', profile.user.user_pic ? getImageUrl(profile.user.user_pic) : 'default image');
                }}
              />
              <View style={styles.userInfo}>
                <Text style={styles.name}>{profile.user.username}</Text>
                {profile.user.age && (
                  <Text style={styles.age}>{profile.user.age} ans</Text>
                )}
                <View style={styles.ratingContainer}>
                  {renderStars(Math.round(averageRating))}
                  <Text style={styles.ratingText}>
                    {averageRating.toFixed(1)} ({comments.length} avis)
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.infoContainer}>
              {profile.user.phone_number && (
                <Text style={styles.info}>📞 {profile.user.phone_number}</Text>
              )}
              <Text style={styles.info}>📧 {profile.user.email}</Text>
              <Text style={styles.info}>
                👤 {profile.user.type_user === 'conducteur' ? 'Conducteur' : 'Client'}
              </Text>
              {profile.user.ppermis_ic && (
                <View>
                  <Text style={styles.info}>📄 {profile.user.type_user === 'conducteur' ? 'Permis de conduire' : 'Carte d\'identité'}</Text>
                  <Image
                    source={{
                      uri: getImageUrl(profile.user.ppermis_ic) || ''
                    }}
                    style={styles.permisImage}
                    onError={(e) => {
                      console.error('Permis image loading error:', e.nativeEvent.error);
                      console.log('Attempted permis URL:', getImageUrl(profile.user.ppermis_ic));
                    }}
                  />
                </View>
              )}
            </View>

            <Button 
              mode="contained" 
              onPress={() => router.push({
                pathname: '../profile/edit' as any,
                params: { userData: JSON.stringify(profile.user) }
              })}
              style={[styles.button, { marginBottom: 15 }]}
              labelStyle={styles.buttonText}
              icon="account-edit"
            >
              Modifier le profil
            </Button>

            <Button 
              mode="contained" 
              onPress={() => router.push('/history')}
              style={styles.button}
              labelStyle={styles.buttonText}
              icon="history"
            >
              Historique
            </Button>

            <Button 
              mode="contained" 
              onPress={() => router.push('/commentaire/CommentScreen')}
              style={styles.button}
              labelStyle={styles.buttonText}
              icon="comment"
            >
              Voir mes commentaires
            </Button>

            <Button 
              mode="contained" 
              onPress={handleDeleteAccount}
              style={styles.deleteButton}
              labelStyle={styles.buttonText}
              disabled={profileLoading}
              icon="delete-forever"
            >
              {profileLoading ? 'Suppression...' : 'Supprimer le compte'}
            </Button>

            <Button 
              mode="contained" 
              onPress={handleLogout}
              style={styles.logoutButton}
              labelStyle={styles.buttonText}
              icon="logout"
            >
              Déconnexion
            </Button>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  scrollContent: { 
    padding: 20 
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loader: { 
    marginTop: 20 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  profileImage: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    marginRight: 15, 
    borderWidth: 1, 
    borderColor: PRIMARY_COLOR,
    marginTop: 15
  },
  userInfo: { 
    flex: 1 
  },
  name: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: PRIMARY_COLOR 
  },
  age: { 
    fontSize: 16, 
    color: 'gray', 
    marginTop: 4 
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  infoContainer: { 
    marginBottom: 20 
  },
  info: { 
    fontSize: 16, 
    color: '#333', 
    marginBottom: 8 
  },
  button: { 
    marginVertical: 6, 
    backgroundColor: PRIMARY_COLOR,
  },
  buttonText: { 
    color: '#fff' 
  },
  deleteButton: { 
    marginVertical: 6, 
    backgroundColor: '#ff3333',
  },
  logoutButton: { 
    marginVertical: 6, 
    backgroundColor: '#ff3333'
  },
  errorText: { 
    color: 'red', 
    textAlign: 'center', 
    marginVertical: 10 
  },
  permisImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginTop: 10,
    borderRadius: 8,
  },
});

export default ProfileScreen;