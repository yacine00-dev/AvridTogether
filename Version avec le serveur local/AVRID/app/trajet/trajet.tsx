import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Image, ScrollView, Alert, Animated } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

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
  author_post: string; // Email du conducteur
  created_at?: string;
  depart_date: string;
  arrival_date: string;
  depart_place: string;
  arrival_place: string;
  price: number;
  reserved?: boolean;
  number_of_places: number;
  smoker: boolean;
  animals_autorised: boolean;
  author_details?: {
    user_pic: string | null;
    username: string;
  };
}

export default function AvailableRidesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [rides, setRides] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasActiveReservation, setHasActiveReservation] = useState(false);
  const { user } = useAuth();

  const api = axios.create({
    baseURL: 'http://10.0.2.2:8000/api/',
    timeout: 10000,
  });

  // Ajout de logs pour déboguer
  useEffect(() => {
    console.log("Rides data:", rides.map(ride => ({
      title: ride.title,
      reserved: ride.reserved,
      id: ride.id
    })));
  }, [rides]);

  const checkActiveReservation = async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (!token) return;

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.get('user/history');
      
      // Si l'utilisateur a une réservation active
      if (response.data && response.data.length > 0) {
        setHasActiveReservation(true);
        const activeReservation = response.data[0];
        
        // Mettre à jour l'état des trajets pour marquer celui qui est réservé
        setRides(prevRides => prevRides.map(ride => ({
          ...ride,
          reserved: ride.title === activeReservation.title
        })));
      } else {
        setHasActiveReservation(false);
        // Réinitialiser l'état des réservations
        setRides(prevRides => prevRides.map(ride => ({
          ...ride,
          reserved: false
        })));
      }
    } catch (error) {
      console.error("Erreur lors de la vérification des réservations:", error);
    }
  };

  // Remplacer l'useEffect existant par useFocusEffect
  useFocusEffect(
    React.useCallback(() => {
      checkActiveReservation();
    }, [])
  );

  useEffect(() => {
    const fetchRides = async () => {
      try {
        if (!params.depart_place || !params.arrival_place) {
          Alert.alert("Erreur", "Paramètres de recherche manquants");
          return;
        }

        const token = await SecureStore.getItemAsync('auth_token');
        if (!token) {
          Alert.alert(
            "Session expirée",
            "Veuillez vous reconnecter pour continuer.",
            [
              {
                text: "OK",
                onPress: () => {
                  router.replace('/login');
                }
              }
            ]
          );
          return;
        }

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Récupérer les réservations actives
        const reservationResponse = await api.get('user/history', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const activeReservation = reservationResponse.data && reservationResponse.data.length > 0
          ? reservationResponse.data[0]
          : null;

        setHasActiveReservation(!!activeReservation);

        // Récupérer les trajets
        const response = await api.get(`posts/find/${params.depart_place}/${params.arrival_place}/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data && Array.isArray(response.data)) {
          console.log("API response data:", JSON.stringify(response.data, null, 2));
          
          // Récupérer les détails des conducteurs
          const ridesWithAuthorDetails = await Promise.all(
            response.data.map(async (ride) => {
              try {
                // Récupérer les informations du conducteur via son email
                const authorResponse = await api.get(`user/email/${ride.author_post}/`);
                console.log("Réponse détails auteur:", JSON.stringify(authorResponse.data, null, 2));
                
                const authorDetails = {
                  ...ride,
                  author_details: {
                    user_pic: authorResponse.data.user.user_pic,
                    username: authorResponse.data.user.username
                  },
                  reserved: activeReservation ? ride.title === activeReservation.title : false
                };
                
                console.log("Author details après formatage:", JSON.stringify(authorDetails, null, 2));
                return authorDetails;
              } catch (error) {
                console.error("Erreur lors de la récupération des détails du conducteur:", error);
                if (axios.isAxiosError(error)) {
                  console.log("Détails de l'erreur:", error.response?.data);
                }
                return ride;
              }
            })
          );

          setRides(ridesWithAuthorDetails);
        } else {
          setRides([]);
          Alert.alert("Information", "Aucun trajet trouvé pour cet itinéraire.");
        }
      } catch (error: any) {
        console.error("Erreur lors de la récupération des trajets:", error);
        let errorMessage = "Impossible de récupérer les trajets depuis le serveur.";
        
        if (error.response) {
          switch (error.response.status) {
            case 401:
              errorMessage = "Session expirée. Veuillez vous reconnecter.";
              Alert.alert(
                "Session expirée",
                "Veuillez vous reconnecter pour continuer.",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      router.replace('/login');
                    }
                  }
                ]
              );
              break;
            case 403:
              errorMessage = "Vous n'avez pas les permissions nécessaires.";
              break;
            case 404:
              errorMessage = "Aucun trajet trouvé pour cet itinéraire.";
              break;
          }
        }
        
        Alert.alert("Erreur", errorMessage);
        setRides([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, [params.depart_place, params.arrival_place]);

  const handleReserve = async (postId: number) => {
    if (hasActiveReservation) {
      Alert.alert(
        "Réservation en cours",
        "Vous avez déjà une réservation en cours. Voulez-vous voir son statut ?",
        [
          { text: "Non", style: "cancel" },
          { text: "Oui", onPress: () => router.push('/wating_passenger/wating_passenger') }
        ]
      );
      return;
    }

    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (!token) {
        Alert.alert("Erreur", "Vous devez être connecté pour réserver un trajet.");
        return;
      }

      const ride = rides.find(r => r.id === postId);
      if (!ride) {
        Alert.alert("Erreur", "Trajet non trouvé.");
        return;
      }

      console.log('Tentative de réservation pour le trajet:', ride.title);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.post(`posts/reservation/${ride.title}/`);
      console.log('Réponse de la réservation:', response.data);
      
      // Mettre à jour l'état local
      setRides(rides.map(r => 
        r.id === postId ? { ...r, reserved: true } : r
      ));
      setHasActiveReservation(true);

      Alert.alert(
        "Réservation réussie",
        "Votre réservation a été confirmée avec succès.",
        [{ text: "OK" }]
      );
    } catch (error: any) {
      console.error('Erreur détaillée:', error.response?.data || error.message);
      Alert.alert(
        "Erreur",
        error.response?.data?.message || "Impossible de réserver ce trajet. Veuillez réessayer."
      );
    }
  };

  const handleCancelReservation = async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (!token) {
        Alert.alert("Erreur", "Vous devez être connecté pour annuler une réservation.");
        return;
      }

      // Trouver le trajet réservé
      const reservedRide = rides.find(ride => ride.reserved);
      if (!reservedRide) {
        Alert.alert("Erreur", "Aucune réservation active trouvée.");
        return;
      }

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      await api.post(`posts/reservation_annule/${reservedRide.title}/`);
      
      // Mettre à jour l'état local
      setRides(rides.map(ride => 
        ride.id === reservedRide.id ? { ...ride, reserved: false } : ride
      ));
      setHasActiveReservation(false);

      Alert.alert(
        "Réservation annulée",
        "Votre réservation a été annulée avec succès.",
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'annuler la réservation.");
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Trajets disponibles</Text>
        {rides.some(ride => ride.reserved === true) && (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={handleCancelReservation}
          >
            <MaterialIcons name="cancel" size={24} color={COLORS.white} />
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {rides.map((ride, index) => (
            <RideItem
              key={ride.id ? `ride-${ride.id}` : `ride-index-${index}`}
              ride={ride}
              onReserve={() => handleReserve(ride.id || index)}
              onCancel={handleCancelReservation}
              disabled={hasActiveReservation}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

interface RideItemProps {
  ride: Post;
  onReserve: () => void;
  onCancel: () => void;
  disabled: boolean;
}

const RideItem = React.memo(({ ride, onReserve, onCancel, disabled }: RideItemProps) => {
  const [reserveScale] = useState(new Animated.Value(1));
  const router = useRouter();
  const params = useLocalSearchParams();
  const api = axios.create({
    baseURL: 'http://10.0.2.2:8000/api/',
    timeout: 10000,
  });

  // Ajout de logs pour déboguer
  useEffect(() => {
    console.log("Ride data:", {
      title: ride.title,
      reserved: ride.reserved,
      id: ride.id
    });
  }, [ride]);

  const handleReserveAnimation = async () => {
    await Animated.sequence([
      Animated.timing(reserveScale, { toValue: 0.9, duration: 50, useNativeDriver: true }),
      Animated.spring(reserveScale, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
    onReserve();
  };

  // Fonction pour formater l'heure
  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      return `${hours}:${minutes}`;
    } catch (error) {
      return timeString;
    }
  };

  return (
    <View style={[styles.rideCard, ride.reserved && styles.reservedRideCard]}>
      <TouchableOpacity 
        onPress={() => router.push({
          pathname: '/trajet/DriverDetails',
          params: { driverId: ride.author_post }
        })}
      >
        <View style={styles.headerSection}>
          <Text style={styles.title}>{ride.title}</Text>
          <View style={[styles.statusBadge, ride.reserved && styles.reservedBadge]}>
            <Text style={styles.statusText}>{ride.reserved ? "Réservé" : "Disponible"}</Text>
          </View>
        </View>

        <View style={styles.driverSection}>
          <View style={styles.driverInfo}>
            <Image 
              source={
                ride.author_details?.user_pic 
                  ? { uri: `http://10.0.2.2:8000${ride.author_details.user_pic}`, cache: 'reload' }
                  : require("../../assets/images/photo_profil.jpg")
              }
              style={styles.driverPhoto}
              defaultSource={require("../../assets/images/photo_profil.jpg")}
              onError={(error) => {
                console.log('Erreur de chargement image:', error.nativeEvent.error);
                console.log('Détails de l\'image:', JSON.stringify(ride.author_details, null, 2));
              }}
            />
            <View style={styles.driverText}>
              <Text style={styles.driverName}>{ride.author_details?.username || 'Conducteur'}</Text>
              <Text style={styles.driverPhone}>{ride.author_post}</Text>
            </View>
          </View>
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>{ride.price} DZD</Text>
          </View>
        </View>

        <View style={styles.tripInfoContainer}>
          <View style={styles.section}>
            <MaterialIcons name="location-pin" size={20} color={COLORS.primary} />
            <View style={styles.sectionContent}>
              <Text style={styles.sectionTitle}>Départ</Text>
              <Text style={styles.sectionText}>{ride.depart_place}</Text>
              <Text style={styles.sectionSubtext}>
                {formatTime(ride.depart_date)}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <MaterialIcons name="flag" size={20} color={COLORS.primary} />
            <View style={styles.sectionContent}>
              <Text style={styles.sectionTitle}>Destination</Text>
              <Text style={styles.sectionText}>{ride.arrival_place}</Text>
              <Text style={styles.sectionSubtext}>
                {formatTime(ride.arrival_date)}
              </Text>
            </View>
          </View>

          <View style={styles.additionalInfo}>
            <View style={styles.infoItem}>
              <MaterialIcons name="event-seat" size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>{ride.number_of_places} places</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons name={ride.smoker ? "check-circle" : "cancel"} size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>{ride.smoker ? "Fumeur" : "Non-fumeur"}</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons name={ride.animals_autorised ? "check-circle" : "cancel"} size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>{ride.animals_autorised ? "Animaux OK" : "Pas d'animaux"}</Text>
            </View>
          </View>

          {ride.created_at && (
            <View style={styles.createdAtSection}>
              <MaterialIcons name="schedule" size={16} color={COLORS.text} />
              <Text style={styles.createdAtText}>
                Publié le {new Date(ride.created_at).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.separator} />

      <View style={styles.buttonContainer}>
        {ride.reserved ? (
          <TouchableOpacity 
            style={styles.cancelRideButton}
            onPress={onCancel}
          >
            <MaterialIcons name="cancel" size={18} color={COLORS.white} />
            <Text style={styles.cancelRideText}>Annuler la réservation</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.reserveButton, disabled && styles.disabledButton]} 
            onPress={handleReserveAnimation}
            disabled={disabled}
          >
            <MaterialIcons name="directions-car" size={18} color={COLORS.white} />
            <Text style={styles.reserveText}>Réserver</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 35,
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    paddingRight: 16,
    marginRight: 16,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginLeft: 8,
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  rideCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 10,
  },
  reservedBadge: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    color: '#2E7D32',
    fontWeight: '600',
    fontSize: 12,
  },
  reservedStatusText: {
    color: '#dc3545',
  },
  driverSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  driverPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  driverText: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  driverPhone: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 4,
  },
  priceBadge: {
    backgroundColor: '#e8f5e9',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 15,
    marginLeft: 10,
  },
  priceText: {
    color: '#2e7d32',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tripInfoContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
  },
  section: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  sectionContent: {
    marginLeft: 10,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
  },
  sectionText: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 2,
  },
  sectionSubtext: {
    fontSize: 14,
    color: COLORS.text,
    opacity: 0.8,
  },
  additionalInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 8,
    borderRadius: 8,
    gap: 5,
  },
  infoText: {
    color: COLORS.text,
    fontSize: 14,
  },
  createdAtSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  createdAtText: {
    color: COLORS.text,
    fontSize: 12,
    marginLeft: 5,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  reserveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  reserveText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 8,
    gap: 4,
  },
  cancelButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelRideButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cancelRideText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  reservedRideCard: {
    borderColor: '#dc3545',
    borderWidth: 2,
  },
});
