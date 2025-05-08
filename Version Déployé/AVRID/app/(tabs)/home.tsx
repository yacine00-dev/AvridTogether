import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Alert, ActivityIndicator, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Image, ScrollView, TextInput } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import { Redirect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

// Configuration API
const API_BASE = 'https://testat-hsrz.onrender.com/api/';

// Couleurs constantes
const COLORS = {
  primary: "#032354",
  secondary: "#4c78a5",
  text: "#666",
  border: "#ccc",
  white: "#FFFFFF",
};

export default function HomeScreen() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [address, setAddress] = useState<string>('Localisation en cours...');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasActiveReservation, setHasActiveReservation] = useState(false);
  const [isCheckingReservation, setIsCheckingReservation] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    console.log('État de l\'authentification:', { isAuthenticated, isLoading, user });
  }, [isAuthenticated, isLoading, user]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission de localisation refusée');
        return;
      }

      startLocationTracking();
    })();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      console.log('User data dans useFocusEffect:', user);
    }, [user])
  );

  const startLocationTracking = async () => {
    try {
      const subscription = await Location.watchPositionAsync(
        { 
          accuracy: Location.Accuracy.High, 
          distanceInterval: 100,
          timeInterval: 5000 
        },
        async (newLocation) => {
          setLocation(newLocation);
          updateAddress(newLocation.coords.latitude, newLocation.coords.longitude);
        }
      );

      return () => subscription.remove();
    } catch (error) {
      setErrorMsg('Erreur de géolocalisation');
    }
  };

  const updateAddress = async (lat: number, lon: number) => {
    try {
      const geocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
      if (geocode.length > 0) {
        const addrParts = [];
        if (geocode[0].name) addrParts.push(geocode[0].name);
        if (geocode[0].city) addrParts.push(geocode[0].city);
        setAddress(addrParts.join(', ') || 'Adresse non disponible');
      }
    } catch (error) {
      console.error('Erreur de géocodage:', error);
    }
  };

  const refreshLocation = async () => {
    setIsRefreshing(true);
    try {
      const position = await Location.getCurrentPositionAsync({});
      setLocation(position);
      await updateAddress(position.coords.latitude, position.coords.longitude);
    } catch (error) {
      setErrorMsg('Actualisation impossible');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSearch = async () => {
    if (!departure || !arrival) {
      Alert.alert("Erreur", "Veuillez saisir les lieux de départ et d'arrivée");
      return;
    }

    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (!token) {
        Alert.alert("Erreur", "Vous devez être connecté pour rechercher des trajets.");
        return;
      }

      const response = await axios.get(`${API_BASE}posts/find/${departure}/${arrival}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const posts = response.data;
      
      if (posts.length === 0) {
        Alert.alert("Information", "Aucun trajet trouvé pour cet itinéraire.");
        return;
      }

      router.push({
        pathname: '/trajet/trajet',
        params: {
          depart_place: departure,
          arrival_place: arrival
        }
      });
    } catch (error: any) {
      console.error("Erreur lors de la recherche:", error);
      let errorMessage = "Impossible de rechercher les trajets. Veuillez réessayer.";
      
      if (error.response) {
        switch (error.response.status) {
          case 401:
            errorMessage = "Session expirée. Veuillez vous reconnecter.";
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
    }
  };

  const checkActiveReservation = async () => {
    setIsCheckingReservation(true);
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (!token) {
        console.log("Pas de token trouvé");
        return;
      }

      console.log("Vérification des réservations actives...");
      const response = await axios.get(`${API_BASE}user/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log("Réponse de l'historique:", response.data);
      const hasActive = response.data && response.data.length > 0;
      setHasActiveReservation(hasActive);

      if (hasActive) {
        console.log("Réservations trouvées:", response.data);
      }
    } catch (error) {
      console.error("Erreur lors de la vérification des réservations:", error);
      if (axios.isAxiosError(error)) {
        console.log("Détails de l'erreur:", error.response?.data);
      }
    } finally {
      setIsCheckingReservation(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      console.log("Écran Home activé - Vérification des réservations");
      checkActiveReservation();
    }, [])
  );

  const handleCancelAllReservations = async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (!token) {
        Alert.alert("Erreur", "Vous devez être connecté pour annuler les réservations.");
        return;
      }

      // Récupérer d'abord la réservation active
      const historyResponse = await axios.get(`${API_BASE}user/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!historyResponse.data || historyResponse.data.length === 0) {
        Alert.alert("Information", "Vous n'avez aucune réservation active.");
        return;
      }

      // Obtenir la réservation active et son titre
      const activeReservation = historyResponse.data[0];
      const postTitle = activeReservation.post.title;

      console.log("Détails de la réservation à annuler:", activeReservation);

      if (!postTitle) {
        Alert.alert("Erreur", "Impossible de trouver les détails de la réservation.");
        return;
      }

      Alert.alert(
        "Confirmation",
        "Êtes-vous sûr de vouloir annuler votre réservation ?",
        [
          {
            text: "Non",
            style: "cancel"
          },
          {
            text: "Oui",
            onPress: async () => {
              try {
                // Annuler la réservation en utilisant son titre
                const response = await axios.post(
                  `${API_BASE}posts/reservation_annule/${postTitle}/`,
                  null,
                  {
                    headers: {
                      'Authorization': `Bearer ${token}`
                    }
                  }
                );

                console.log("Réponse de l'annulation:", response.data);

                Alert.alert(
                  "Succès",
                  "Votre réservation a été annulée.",
                  [{ text: "OK" }]
                );
                setHasActiveReservation(false);
                
                // Rafraîchir l'état des réservations
                checkActiveReservation();
              } catch (error) {
                console.error("Erreur lors de l'annulation:", error);
                if (axios.isAxiosError(error) && error.response) {
                  const errorMessage = error.response.data.error || "Impossible d'annuler la réservation. Veuillez réessayer.";
                  Alert.alert("Erreur", errorMessage);
                } else {
                  Alert.alert(
                    "Erreur",
                    "Impossible d'annuler la réservation. Veuillez réessayer."
                  );
                }
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error("Erreur:", error);
      Alert.alert("Erreur", "Une erreur est survenue. Veuillez réessayer.");
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return null; // Le useEffect redirigera vers /login
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />

      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }} 
        keyboardShouldPersistTaps="handled"
      >
        {/* En-tête */}
        <View style={styles.header}>
          <View style={styles.locationContainer}>
            <Ionicons name="location-sharp" size={25} color={COLORS.primary} />
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationLabel}>MA POSITION</Text>
              <Text 
                style={styles.location} 
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {errorMsg || address}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={refreshLocation} 
              disabled={isRefreshing}
              style={{ marginLeft: 10 }}
            >
              {isRefreshing ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Ionicons name="reload" size={24} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => router.push('/profile')}>
            <Image 
              source={
                user?.user?.user_pic 
                  ? { uri: `https://testat-hsrz.onrender.com${user.user.user_pic}`, cache: 'reload' }
                  : require("../../assets/images/photo_profil.jpg")
              }
              style={styles.profileImage}
              defaultSource={require("../../assets/images/photo_profil.jpg")}
              onError={(error) => console.log('Erreur de chargement image:', error.nativeEvent.error)}
            />
          </TouchableOpacity>
        </View>

        {/* Titres */}
        <View style={styles.titleContainer}>
          {user ? (
            <>
              <Text style={styles.welcome}>Bienvenue, {user.user.username} !</Text>
              <Text style={styles.bookingTitle}>Réservez votre trajet</Text>
            </>
          ) : (
            <ActivityIndicator size="small" color={COLORS.primary} />
          )}
        </View>

        {/* Formulaire de recherche */}
        <View style={styles.bookingContainer}>
          {/* Lieu de départ */}
          <View style={styles.fieldContainer}>
            <MaterialIcons name="place" size={24} color={COLORS.primary} />
            <TextInput
              style={[styles.inputField, { flex: 1 }]}
              value={departure}
              onChangeText={setDeparture}
              placeholder="Lieu de départ"
              placeholderTextColor={COLORS.text}
            />
          </View>

          {/* Lieu d'arrivée */}
          <View style={styles.fieldContainer}>
            <MaterialIcons name="flag" size={24} color={COLORS.primary} />
            <TextInput
              style={[styles.inputField, { flex: 1 }]}
              value={arrival}
              onChangeText={setArrival}
              placeholder="Lieu d'arrivée"
              placeholderTextColor={COLORS.text}
            />
          </View>

          <TouchableOpacity 
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={!departure || !arrival}
          >
            <Text style={styles.searchText}>RECHERCHER</Text>
          </TouchableOpacity>

          {isCheckingReservation ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingText}>Vérification des réservations...</Text>
            </View>
          ) : hasActiveReservation && (
            <TouchableOpacity 
              style={styles.cancelAllButton}
              onPress={handleCancelAllReservations}
            >
              <Text style={styles.cancelAllText}>ANNULER MA RÉSERVATION</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Section promotions */}
        <View style={styles.discountsContainer}>
          <Text style={styles.sectionTitle}>Promotions en cours</Text>
          {["10% avec CODE10", "20% avec CODE20"].map((text, index) => (
            <View key={index} style={styles.promoItem}>
              <Text style={styles.promoText}>{text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 45,
    marginTop: 10,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "500",
  },
  location: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "600",
    maxWidth: '90%',
  },
  profileImage: {
    width: 45,
    height: 45,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  titleContainer: {
    paddingHorizontal: 25,
    marginTop: 15,
    marginBottom: 20,
  },
  welcome: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  bookingTitle: {
    fontSize: 18,
    color: COLORS.text,
    marginTop: 5,
  },
  bookingContainer: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  fieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  inputField: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  inputText: {
    color: COLORS.text,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 18,
    alignItems: "center",
    marginTop: 10,
  },
  searchText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 16,
  },
  discountsContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 15,
  },
  promoItem: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#F5F9FF",
  },
  promoText: {
    color: COLORS.text,
    fontSize: 15,
  },
  cancelAllButton: {
    backgroundColor: '#dc3545',
    borderRadius: 10,
    padding: 18,
    alignItems: "center",
    marginTop: 10,
  },
  cancelAllText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  loadingText: {
    marginLeft: 10,
    color: COLORS.text,
    fontSize: 14,
  },
});