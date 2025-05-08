import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react"; 
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Image, ScrollView, RefreshControl, Platform, Alert } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { router } from 'expo-router';
import { Animated } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import defaultProfilePic from '../../assets/images/photo_profil.jpg';

const COLORS = {
  primary: "#032354",
  secondary: "#4c78a5",
  text: "#666",
  border: "#eee",
  white: "#FFFFFF",
};

interface Post {
  id?: number;
  title: string;
  depart_place: string;
  arrival_place: string;
  depart_date: string;
  arrival_date: string;
  number_of_places: number;
  price: number;
  smoker: boolean;
  animals_autorised: boolean;
  author_post: string;
  reserved: boolean;
}

interface ActiveTrip {
  post: Post;
  hasReservations: boolean;
}

interface Visitor {
  id: number;
  username: string;
  user_pic: string | null;
  rating: string;
}

interface Reservation {
  id: number;
  post: Post;
  visitor: Visitor;
}

interface ReservationItemProps {
  reservation: Reservation;
}

function formatHourString(dateString: string) {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      // Format: "JJ/MM/YYYY HH:mm"
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
  } catch (error) {
    console.error("Erreur lors du formatage de la date:", error);
  }
  
  // Fallback pour le format HH:mm si la date complète n'est pas valide
  const [hour, minute] = dateString.split(':');
  if (hour && minute) {
    return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
  }
  
  return dateString;
}

const ReservationItem = React.memo(({ reservation }: ReservationItemProps) => {
  return (
    <TouchableOpacity 
      style={styles.reservationCard}
      onPress={() => router.push({
        pathname: '/driverRes/VisitorDetails',
        params: { visitorId: reservation.visitor.id }
      })}
    >
      <View style={styles.passengerHeader}>
        <Image 
          source={reservation.visitor.user_pic ? { uri: reservation.visitor.user_pic } : defaultProfilePic} 
          style={styles.passengerPhoto} 
        />
        <View style={styles.passengerInfo}>
          <Text style={styles.passengerName}>{reservation.visitor?.username || 'Passager'}</Text>
          <View style={styles.ratingContainer}>
            <MaterialIcons name="info" size={16} color={COLORS.primary} />
            <Text style={[styles.ratingText, { color: COLORS.primary }]}>Appuyer pour plus de détails</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default function DriverReservationsScreen() {
  const [reservationsList, setReservationsList] = useState<Reservation[]>([]);
  const [activeTrip, setActiveTrip] = useState<ActiveTrip | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const { user } = useAuth();

  const api = axios.create({
    baseURL: 'http://10.0.2.2:8000/api/',
    timeout: 10000,
  });

  const fetchActiveTrip = async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (!token) return;

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.get('posts/creat_post/');
      console.log("Réponse de l'API:", response.data);

      const posts = Array.isArray(response.data) ? response.data : [response.data];
      
      if (posts && posts.length > 0) {
        const activePost = posts[0];
        console.log("Post actif:", activePost);

        const formattedPost = {
          ...activePost,
          depart_date: new Date(`2000-01-01T${activePost.depart_date}`).toLocaleTimeString(),
          arrival_date: new Date(`2000-01-01T${activePost.arrival_date}`).toLocaleTimeString()
        };

        setActiveTrip({
          post: formattedPost,
          hasReservations: activePost.reserved
        });
      } else {
        setActiveTrip(null);
      }
    } catch (error) {
      console.error("Erreur lors du chargement du trajet actif:", error);
      setActiveTrip(null);
    }
  };

  const fetchReservations = async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (!token) {
        Alert.alert("Erreur", "Vous devez être connecté pour voir les réservations.");
        return;
      }

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Utiliser le nouvel endpoint pour récupérer les réservations
      const reservationsResponse = await api.get('user/myreservation');
      console.log("Données des réservations:", JSON.stringify(reservationsResponse.data, null, 2));

      if (reservationsResponse.data && Array.isArray(reservationsResponse.data)) {
        const formattedReservations = reservationsResponse.data.map((item: any) => {
          const userPicUrl = item.visitor.user.user_pic 
            ? `http://10.0.2.2:8000${item.visitor.user.user_pic}`
            : null;

          return {
            id: item.id,
            post: {
              ...item.post,
              depart_date: formatHourString(item.post.depart_date),
              arrival_date: formatHourString(item.post.arrival_date)
            },
            visitor: {
              id: item.visitor.user.id,
              username: item.visitor.user.username,
              user_pic: userPicUrl,
              rating: "N/A"
            }
          };
        });

        setReservationsList(formattedReservations);
        setActiveTrip(prev => prev ? {
          ...prev,
          hasReservations: formattedReservations.length > 0
        } : null);
      } else {
        setReservationsList([]);
        if (activeTrip) {
          setActiveTrip({
            ...activeTrip,
            hasReservations: false
          });
        }
      }
      
      setLastUpdated(new Date());
    } catch (error: any) {
      console.error("Erreur lors du chargement des données :", error);
      // Si l'erreur est 404, cela signifie qu'il n'y a pas de réservations
      if (error.response && error.response.status === 404) {
        setReservationsList([]);
        if (activeTrip) {
          setActiveTrip({
            ...activeTrip,
            hasReservations: false
          });
        }
        setLastUpdated(new Date());
        return;
      }
      // Pour les autres types d'erreurs, afficher l'alerte
      Alert.alert("Erreur", "Impossible de récupérer les informations.");
    }
  };

  const handleCancelTrip = async () => {
    if (!activeTrip?.post?.title) {
      Alert.alert("Erreur", "Impossible d'annuler le trajet : informations manquantes.");
      return;
    }

    if (activeTrip.hasReservations) {
      Alert.alert(
        "Impossible d'annuler",
        "Ce trajet ne peut pas être annulé car il a déjà des réservations.",
        [{ text: "OK" }]
      );
      return;
    }

    Alert.alert(
      "Annuler le trajet",
      "Êtes-vous sûr de vouloir annuler ce trajet ? Cette action est irréversible.",
      [
        {
          text: "Non",
          style: "cancel"
        },
        {
          text: "Oui",
          onPress: async () => {
            try {
              const token = await SecureStore.getItemAsync('auth_token');
              if (!token) {
                Alert.alert("Erreur", "Vous devez être connecté pour effectuer cette action.");
                return;
              }

              api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
              await api.delete(`posts/delete/${activeTrip.post.title}/`);

              Alert.alert(
                "Succès", 
                "Le trajet a été annulé avec succès.",
                [
                  {
                    text: "OK",
                    onPress: () => router.push("/(tabs)/post")
                  }
                ]
              );
            } catch (error: any) {
              console.error("Erreur lors de l'annulation du trajet :", error);
              Alert.alert("Erreur", "Le trajet n'a pas pu être annulé.");
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    fetchActiveTrip();
    fetchReservations();
    const interval = setInterval(() => {
      fetchActiveTrip();
      fetchReservations();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.screenTitle}>Réservations en attente</Text>
          <Text style={styles.updateText}>
            Dernière mise à jour : {lastUpdated.toLocaleTimeString()}
          </Text>
        </View>

        <TouchableOpacity onPress={() => {
          fetchActiveTrip();
          fetchReservations();
        }}>
          <MaterialIcons name="refresh" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {activeTrip && (
        <View style={styles.activeTripCard}>
          <Text style={styles.activeTripTitle}>Trajet actif</Text>
          <View style={styles.tripDetails}>
            <View style={styles.locationItem}>
              <MaterialIcons name="location-pin" size={20} color={COLORS.primary} />
              <View style={styles.locationText}>
                <Text style={styles.locationTitle}>Départ</Text>
                <Text style={styles.locationAddress}>{activeTrip.post.depart_place}</Text>
              </View>
            </View>
            
            <View style={styles.locationItem}>
              <MaterialIcons name="flag" size={20} color={COLORS.primary} />
              <View style={styles.locationText}>
                <Text style={styles.locationTitle}>Destination</Text>
                <Text style={styles.locationAddress}>{activeTrip.post.arrival_place}</Text>
              </View>
            </View>

            <View style={styles.tripInfo}>
              <Text style={styles.tripInfoText}>
                Heure de départ: {formatHourString(activeTrip.post.depart_date)}
              </Text>
              <Text style={styles.tripInfoText}>
                Heure d'arrivée: {formatHourString(activeTrip.post.arrival_date)}
              </Text>
              <Text style={styles.tripInfoText}>
                Nombre de places: {activeTrip.post.number_of_places}
              </Text>
              <Text style={styles.tripInfoText}>
                Prix: {activeTrip.post.price} DZD
              </Text>
            </View>

            {!activeTrip.hasReservations && (
              <TouchableOpacity 
                style={styles.cancelTripButton}
                onPress={handleCancelTrip}
              >
                <MaterialIcons name="cancel" size={24} color="#FF0000" />
                <Text style={styles.cancelTripText}>Annuler le trajet</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              Promise.all([fetchActiveTrip(), fetchReservations()])
                .finally(() => setRefreshing(false));
            }}
            colors={[COLORS.primary]}
          />
        }
      >
        {reservationsList.length === 0 ? (
          <Text style={styles.emptyText}>Aucune réservation en attente</Text>
        ) : (
          reservationsList.map((reservation) => (
            <ReservationItem
              key={`reservation-${reservation.id}`}
              reservation={reservation}
            />
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
  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  updateText: {
    fontSize: 12,
    color: COLORS.text,
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
  },
  emptyText: {
    textAlign: "center",
    color: COLORS.text,
    marginTop: 50,
  },
  reservationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  passengerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  passengerPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  passengerInfo: {
    flex: 1,
  },
  passengerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  ratingText: {
    fontSize: 14,
    marginLeft: 4,
    color: COLORS.text,
  },
  timeBadge: {
    backgroundColor: COLORS.secondary,
    color: COLORS.white,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    fontSize: 12,
  },
  detailsSection: {
    marginBottom: 12,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  locationText: {
    marginLeft: 8,
    flex: 1,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  locationAddress: {
    fontSize: 13,
    color: COLORS.text,
  },
  locationTime: {
    fontSize: 12,
    color: COLORS.text,
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  acceptButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  declineButton: {
    backgroundColor: "#eee",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.5,
  },
  cancelTripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE5E5',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF0000',
  },
  disabledCancelButton: {
    backgroundColor: '#F5F5F5',
    borderColor: '#999',
  },
  cancelTripText: {
    color: '#FF0000',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  disabledCancelText: {
    color: '#999',
  },
  activeTripCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  activeTripTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 12,
  },
  tripDetails: {
    gap: 12,
  },
  tripInfo: {
    marginTop: 8,
    gap: 4,
  },
  tripInfoText: {
    fontSize: 14,
    color: COLORS.text,
  },
});
