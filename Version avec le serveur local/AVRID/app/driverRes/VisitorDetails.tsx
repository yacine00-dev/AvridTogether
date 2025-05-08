import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import { SafeAreaView, StyleSheet, Text, View, Image, ScrollView, Platform, Alert, ActivityIndicator, TouchableOpacity } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import defaultProfilePic from '../../assets/images/photo_profil.jpg';

const COLORS = {
  primary: "#032354",
  secondary: "#4c78a5",
  text: "#666",
  border: "#eee",
  white: "#FFFFFF",
};

interface Visitor {
  id: number;
  username: string;
  email: string;
  phone_number: string | null;
  type_user: string;
  age: number;
  user_pic: string | null;
  rating: string;
}

interface Comment {
  id?: number;
  title: string;
  rating: number;
  comment: string;
  author_comment: string;
  received_user: number;
  created_at?: string;
  author_pic?: string | null;
}

export default function VisitorDetailsScreen() {
  const { visitorId } = useLocalSearchParams();
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const api = axios.create({
    baseURL: 'http://10.0.2.2:8000/api/',
    timeout: 10000,
  });

  const fetchUserProfile = async (username: string): Promise<string | null> => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (!token) return null;

      const response = await api.get(`user/${username}/`);
      if (response.data?.user?.user_pic) {
        return `http://10.0.2.2:8000${response.data.user.user_pic}`;
      }
      return null;
    } catch (error) {
      console.error(`Erreur lors de la récupération du profil de ${username}:`, error);
      return null;
    }
  };

  const fetchVisitorDetails = async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (!token) {
        Alert.alert("Erreur", "Vous devez être connecté pour voir les détails.");
        return;
      }

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const visitorResponse = await api.get(`user/id/${visitorId}/`);
      const visitorData = visitorResponse.data.user;
      console.log("Données du visiteur:", JSON.stringify(visitorData, null, 2));

      const commentsResponse = await api.get(`user/comments/${visitorData.username}/`);
      console.log("Comments response:", JSON.stringify(commentsResponse.data, null, 2));
      
      // Récupérer les photos de profil pour chaque auteur de commentaire
      const commentsWithProfiles = await Promise.all(
        commentsResponse.data.map(async (comment: Comment) => {
          const authorPic = await fetchUserProfile(comment.author_comment);
          return {
            ...comment,
            author_pic: authorPic
          };
        })
      );

      const ratings = commentsResponse.data;
      const averageRating = ratings.length > 0
        ? (ratings.reduce((sum: number, comment: any) => sum + comment.rating, 0) / ratings.length).toFixed(1)
        : "0.0";

      setVisitor({
        ...visitorData,
        rating: averageRating,
        user_pic: visitorData.user_pic
      });
      
      setComments(commentsWithProfiles);
    } catch (error) {
      console.error("Erreur lors du chargement des détails:", error);
      if (axios.isAxiosError(error)) {
        console.log("Détails de l'erreur axios:", error.response?.data);
      }
      Alert.alert("Erreur", "Impossible de charger les détails du visiteur.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitorDetails();
  }, [visitorId]);

  useEffect(() => {
    if (visitor) {
      console.log("Rendu de l'image - user_pic:", visitor.user_pic);
    }
  }, [visitor]);

  const renderStars = (rating: number, commentId: number) => (
    <View style={styles.commentRating}>
      {[...Array(5)].map((_, index) => (
        <MaterialIcons
          key={`star-${commentId}-${index}`}
          name="star"
          size={16}
          color={index < rating ? "#FFD700" : "#ccc"}
        />
      ))}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (!visitor) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Visiteur non trouvé</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Détails du passager</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
          <Image 
            source={
              visitor?.user_pic 
                ? { 
                    uri: `http://10.0.2.2:8000${visitor.user_pic}`, 
                    cache: 'reload',
                    headers: {
                      Pragma: 'no-cache'
                    }
                  }
                : require("../../assets/images/photo_profil.jpg")
            }
            style={styles.profilePhoto}
            //defaultSource={require("../../assets/images/photo_profil.jpg")}
            onError={(error) => {
              console.log('Erreur de chargement image:', error.nativeEvent.error);
              console.log('État actuel du visitor:', JSON.stringify(visitor, null, 2));
            }}
          />
          <Text style={styles.username}>{visitor.username}</Text>
          <View style={styles.ratingContainer}>
            {[...Array(5)].map((_, index) => (
              <MaterialIcons
                key={`visitor-star-${index}`}
                name="star"
                size={20}
                color={index < Number(visitor.rating) ? "#FFD700" : "#ccc"}
              />
            ))}
            <Text style={styles.ratingText}>{visitor.rating}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <MaterialIcons name="email" size={20} color={COLORS.primary} />
            <Text style={styles.infoText}>{visitor.email}</Text>
          </View>
          {visitor.phone_number && (
            <View style={styles.infoItem}>
              <MaterialIcons name="phone" size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>{visitor.phone_number}</Text>
            </View>
          )}
          <View style={styles.infoItem}>
            <MaterialIcons name="person" size={20} color={COLORS.primary} />
            <Text style={styles.infoText}>{visitor.type_user}</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="cake" size={20} color={COLORS.primary} />
            <Text style={styles.infoText}>{visitor.age} ans</Text>
          </View>
        </View>

        <View style={styles.commentsSection}>
          <Text style={styles.sectionTitle}>Commentaires</Text>
          {comments.length === 0 ? (
            <Text style={styles.noCommentsText}>Aucun commentaire</Text>
          ) : (
            comments.map((comment, index) => (
              <View key={`comment-${index}`} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <Image 
                    source={
                      comment.author_pic
                        ? { 
                            uri: comment.author_pic,
                            cache: 'reload',
                            headers: {
                              Pragma: 'no-cache'
                            }
                          }
                        : defaultProfilePic
                    }
                    style={styles.commentAuthorPhoto}
                    defaultSource={defaultProfilePic}
                    onError={(error) => {
                      console.log('Erreur de chargement image du commentaire:', error.nativeEvent.error);
                    }}
                  />
                  <View style={styles.commentAuthorInfo}>
                    <Text style={styles.commentAuthorName}>
                      {comment.author_comment}
                    </Text>
                    {renderStars(comment.rating, index)}
                  </View>
                  {comment.created_at && (
                    <Text style={styles.commentDate}>
                      {new Date(comment.created_at).toLocaleDateString()}
                    </Text>
                  )}
                </View>
                <Text style={styles.commentTitle}>{comment.title}</Text>
                <Text style={styles.commentText}>{comment.comment}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === "android" ? 40 : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
    marginLeft: 12,
  },
  scrollContent: {
    padding: 16,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 18,
    marginLeft: 4,
    color: COLORS.text,
  },
  infoSection: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 12,
  },
  commentsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 16,
  },
  noCommentsText: {
    textAlign: "center",
    color: COLORS.text,
    fontStyle: "italic",
  },
  commentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  commentAuthorPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentAuthorInfo: {
    flex: 1,
  },
  commentAuthorName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  commentRating: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  commentDate: {
    fontSize: 12,
    color: COLORS.text,
  },
  commentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 8,
  },
  commentText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  errorText: {
    textAlign: "center",
    color: COLORS.text,
    fontSize: 16,
    marginTop: 50,
  },
}); 