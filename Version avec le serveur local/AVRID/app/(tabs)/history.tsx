import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { 
  ActivityIndicator, 
  SafeAreaView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  Image, 
  ScrollView,
  Alert,
  RefreshControl
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useAuth } from '../../context/AuthContext';
import { Redirect, router } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE = 'http://10.0.2.2:8000/api/';

const COLORS = {
  primary: "#032354",
  secondary: "#4c78a5",
  text: "#666",
  border: "#ccc",
  white: "#FFFFFF",
};

type Driver = {
  id: number;
  username: string;
  rating: number;
  user_pic?: string;
};

type Post = {
  id: number;
  title: string;
  depart_place: string;
  arrival_place: string;
  depart_date: string;
  arrival_date: string;
  price: number;
  author_post: string;
  number_of_places: number;
  animals_autorised: boolean;
  smoker: boolean;
};

type Visitor = {
  id: number;
  username: string;
  user_pic: string | null;
};

type Author = {
  id: number;
  username: string;
  user_pic: string | null;
};

type HistoryItem = {
  id: number;
  post: {
    id: number;
    depart_place: string;
    arrival_place: string;
    depart_date: string;
    arrival_date: string;
    price: number;
    author_post: string;
  };
  visited_at: string;
  author?: Author;
};

export default function HistoryScreen() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      const response = await axios.get(`${API_BASE}user/history`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('History response:', response.data);

      // Process each history item to include author information
      const processedHistory = await Promise.all(response.data.map(async (item: any) => {
        try {
          // Fetch author information using the author_post (email)
          const authorResponse = await axios.get(`${API_BASE}user/email/${item.post.author_post}/`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          return {
            id: item.id,
            post: {
              id: item.post.id,
              depart_place: item.post.depart_place,
              arrival_place: item.post.arrival_place,
              depart_date: item.post.depart_date,
              arrival_date: item.post.arrival_date,
              price: item.post.price,
              author_post: item.post.author_post
            },
            visited_at: item.visited_at,
            author: {
              id: authorResponse.data.user.id,
              username: authorResponse.data.user.username,
              user_pic: authorResponse.data.user.user_pic
            }
          };
        } catch (error) {
          console.error("Error fetching author info:", error);
          return {
            id: item.id,
            post: {
              id: item.post.id,
              depart_place: item.post.depart_place,
              arrival_place: item.post.arrival_place,
              depart_date: item.post.depart_date,
              arrival_date: item.post.arrival_date,
              price: item.post.price,
              author_post: item.post.author_post
            },
            visited_at: item.visited_at,
            author: null
          };
        }
      }));

      setHistory(processedHistory);
      setError(null);
    } catch (err) {
      console.error("Erreur lors de la récupération de l'historique:", err);
      setError("Impossible de charger l'historique. Veuillez réessayer.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
    }
  }, [isAuthenticated]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  if (authLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  const handleRateDriver = async (item: HistoryItem) => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (!token) {
        Alert.alert("Erreur", "Vous devez être connecté pour commenter");
        return;
      }

      // Utiliser author_post au lieu de username
      const response = await axios.get(`${API_BASE}user/email/${item.post.author_post}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('User response:', response.data);

      const userId = response.data.user.id;
      if (!userId) {
        throw new Error("ID utilisateur non trouvé dans la réponse");
      }

      router.push({
        pathname: '/comment/comment',
        params: { 
          received_user: userId.toString(),
          postId: item.id.toString()
        }
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des informations de l'utilisateur:", error);
      Alert.alert("Erreur", "Impossible de récupérer les informations de l'utilisateur");
    }
  };

  const formatDate = (dateString: string) => {
    return dateString; // La date est déjà dans le bon format depuis le backend
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'DZD'
    }).format(price);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <Ionicons name="time" size={25} color={COLORS.primary} />
          <View style={styles.locationTextContainer}>
            <Text style={styles.locationLabel}>HISTORIQUE</Text>
            <Text style={styles.location}>Vos trajets récents</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => router.push('/profile')}>
          <Image 
            source={
              user?.user?.user_pic 
                ? { uri: `http://10.0.2.2:8000${user.user.user_pic}`, cache: 'reload' }
                : require("../../assets/images/photo_profil.jpg")
            }
            style={styles.profileImage}
            defaultSource={require("../../assets/images/photo_profil.jpg")}
            onError={(error) => console.log('Erreur de chargement image:', error.nativeEvent.error)}
          />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={fetchHistory}
            >
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : history.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="history" size={50} color={COLORS.border} />
            <Text style={styles.emptyText}>Aucun historique pour le moment</Text>
            <Text style={styles.emptySubText}>Vos trajets apparaîtront ici</Text>
          </View>
        ) : (
          history.map((item) => (
            <View key={item.id} style={styles.activityCard}>
              <View style={styles.dateAmountContainer}>
                <View style={styles.leftDateSection}>
                  <MaterialIcons 
                    name="check" 
                    size={18} 
                    color="#4CAF50" 
                    style={styles.checkIcon}
                  />
                  <Text style={styles.dateText}>{formatDate(item.visited_at)}</Text>
                </View>
                <Text style={styles.amountText}>{formatPrice(item.post.price)}</Text>
              </View>
              
              <View style={styles.divider} />
              
              {/* Section Chauffeur */}
              <View style={styles.driverContainer}>
                <Image 
                  source={item.author?.user_pic 
                    ? { uri: `http://10.0.2.2:8000${item.author.user_pic}`, cache: 'reload' } 
                    : require("@/assets/images/photo_profil.jpg")} 
                  style={styles.driverAvatar}
                  defaultSource={require("@/assets/images/photo_profil.jpg")}
                />
                <View style={styles.driverInfo}>
                  <Text style={styles.driverName}>{item.author?.username || item.post.author_post}</Text>
                </View>
              </View>

              <View style={styles.addressSection}>
                <Text style={styles.addressLabel}>Départ</Text>
                <Text style={styles.addressText}>{item.post.depart_place}</Text>
              </View>

              <View style={styles.addressSection}>
                <Text style={styles.addressLabel}>Destination</Text>
                <Text style={styles.addressText}>{item.post.arrival_place}</Text>
              </View>

              <TouchableOpacity 
                style={styles.requestButton}
                onPress={() => handleRateDriver(item)}
              >
                <Text style={styles.requestButtonText}>Évaluer ce trajet</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 45,
    marginTop: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 15,
  },
  locationTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  locationLabel: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
  location: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
    maxWidth: '90%',
  },
  profileImage: {
    width: 45,
    height: 45,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 20,
  },
  loader: {
    marginTop: 50
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 50,
    padding: 20
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center'
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: '600'
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
    padding: 20
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: '600',
    marginTop: 10
  },
  emptySubText: {
    fontSize: 14,
    color: COLORS.text,
    marginTop: 5,
    textAlign: 'center'
  },
  activityCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    backgroundColor: COLORS.white,
  },
  dateAmountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leftDateSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIcon: {
    marginRight: 8,
  },
  dateText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  amountText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    marginVertical: 10,
  },
  driverContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 8,
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  driverInfo: {
    flex: 1
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4
  },
  addressSection: {
    marginVertical: 6,
  },
  addressLabel: {
    color: COLORS.primary,
    fontSize: 14,
    textTransform: 'uppercase',
    marginBottom: 4,
    fontWeight: '700',
  },
  addressText: {
    color: COLORS.text,
    fontSize: 14,
    marginBottom: 8,
  },
  requestButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 15,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  requestButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },
});