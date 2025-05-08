import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
  Pressable,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Star, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const API_BASE = 'http://10.0.2.2:8000/api/';
const MEDIA_BASE = 'http://10.0.2.2:8000';
const PRIMARY_COLOR = '#191970';

interface UserProfileData {
  id: number;
  email: string;
  username: string;
  user_pic: string | null;
  phone_number: string;
  type_user: string;
  age: number;
  ppermis_ic: string | null;
}

interface UserProfile {
  user: UserProfileData;
}

interface Comment {
  title: string;
  rating: number;
  comment: string;
  author_comment: string;
  received_user: number;
  author_pic?: string | null;
}

const CommentScreen = () => {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    const getToken = async () => {
      const token = await SecureStore.getItemAsync('auth_token');
      setAuthToken(token);
    };
    getToken();
  }, []);

  const getImageUrl = (path: string | null): string | undefined => {
    if (!path) return undefined;
    if (path.startsWith('http')) return path;
    return `${MEDIA_BASE}${path}`;
  };

  const fetchUserProfile = async (username: string): Promise<string | null> => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (!token) return null;

      const response = await axios.get<UserProfile>(
        `${API_BASE}user/${username}/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      console.log('Réponse du profil:', JSON.stringify(response.data, null, 2));
      if (response.data?.user?.user_pic) {
        const imageUrl = getImageUrl(response.data.user.user_pic);
        console.log('URL finale de l\'image:', imageUrl);
        return response.data.user.user_pic;
      }
      return null;
    } catch (err) {
      console.error(`Erreur lors de la récupération du profil de ${username}:`, err);
      return null;
    }
  };

  const fetchComments = async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (!token) {
        console.log('Pas de token trouvé');
        throw new Error('Token d\'authentification non trouvé');
      }

      console.log('Tentative de récupération des commentaires...');
      const response = await axios.get<Comment[]>(
        `${API_BASE}user/mycomments`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('Réponse reçue:', JSON.stringify(response.data, null, 2));
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Format de données invalide');
      }

      const commentsWithProfiles = await Promise.all(
        response.data.map(async (comment) => {
          const userPic = await fetchUserProfile(comment.author_comment);
          return {
            ...comment,
            author_pic: userPic
          };
        })
      );

      setComments(commentsWithProfiles);
      setError(null);
    } catch (err: any) {
      console.error('Erreur détaillée:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || err.message || "Impossible de charger les commentaires";
      setError(errorMessage);
      Alert.alert(
        "Erreur",
        errorMessage,
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchComments();
    setRefreshing(false);
  };

  const renderStars = (rating: number) => (
    <View style={styles.starsContainer}>
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          size={16}
          color={index < rating ? '#FFD700' : '#ccc'}
          fill={index < rating ? '#FFD700' : 'none'}
        />
      ))}
    </View>
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="black" />
        </Pressable>
        <Text style={styles.title}>Mes Commentaires Reçus</Text>
        <View style={styles.headerRight} />
      </View>
      <ScrollView
        style={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[PRIMARY_COLOR]}
          />
        }
      >
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {comments.length === 0 && !error ? (
          <Text style={styles.noComments}>Aucun commentaire pour le moment</Text>
        ) : (
          comments.map((comment, index) => (
            <View key={index} style={styles.commentCard}>
              <View style={styles.commentHeader}>
                <Image
                  source={
                    comment.author_pic
                      ? { 
                          uri: `${MEDIA_BASE}${comment.author_pic}`,
                          cache: 'reload',
                          headers: {
                            'Authorization': `Bearer ${authToken}`
                          }
                        }
                      : require('../../assets/images/photo_profil.jpg')
                  }
                  defaultSource={require('../../assets/images/photo_profil.jpg')}
                  style={styles.authorImage}
                  onError={(error) => {
                    console.error('Erreur de chargement de l\'image:', error.nativeEvent.error);
                  }}
                />
                <View style={styles.authorInfo}>
                  <Text style={styles.authorName}>{comment.author_comment}</Text>
                  <Text style={styles.commentTitle}>{comment.title}</Text>
                </View>
              </View>
              {renderStars(comment.rating)}
              <Text style={styles.commentText}>{comment.comment}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerRight: {
    width: 24, // Pour équilibrer avec le bouton de retour
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    flex: 1,
    textAlign: 'center',
  },
  commentCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  commentDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  commentText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
  },
  noComments: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
  commentTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    fontStyle: 'italic',
  },
});

export default CommentScreen; 