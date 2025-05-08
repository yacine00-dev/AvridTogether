import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { MaterialIcons } from "@expo/vector-icons";

const COLORS = {
  primary: "#032354",
  secondary: "#4c78a5",
  text: "#666",
  border: "#eee",
  white: "#FFFFFF",
};

interface Reservation {
  id: number;
  post: {
    id: number;
    title: string;
    author_post: {
      username: string;
      user_pic: string | null;
      phone_number: string | null;
    };
    depart_place: string;
    arrival_place: string;
    depart_date: string;
    arrival_date: string;
    number_of_places: number;
    price: number;
  };
  status: 'pending' | 'accepted' | 'declined';
}

export default function ReservationDetailsScreen() {
  const router = useRouter();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);

  const api = axios.create({
    baseURL: 'http://10.0.2.2:8000/api/',
    timeout: 10000,
  });

  const fetchReservation = async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (!token) {
        Alert.alert("Erreur", "Vous devez être connecté pour voir votre réservation.");
        return;
      }

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.get('user/history');
      
      if (response.data && response.data.length > 0) {
        const reservationData = response.data[0];
        
        // Vérifier si nous avons les IDs nécessaires
        if (reservationData && reservationData.post) {
          try {
            // Récupérer les détails du post
            const postResponse = await api.get(`posts/${reservationData.post}/`);
            
            if (postResponse.data) {
              // Combiner les données de réservation avec les détails du post
              const completeReservation = {
                ...reservationData,
                post: postResponse.data
              };
              setReservation(completeReservation);
            } else {
              throw new Error("Détails du post non trouvés");
            }
          } catch (error) {
            console.error("Erreur lors de la récupération des détails du post:", error);
            Alert.alert("Erreur", "Impossible de récupérer les détails du trajet.");
            router.push('/trajet/trajet');
          }
        } else {
          console.error("Structure de données invalide:", reservationData);
          Alert.alert("Erreur", "Les données de réservation sont incomplètes.");
          router.push('/trajet/trajet');
        }
      } else {
        Alert.alert("Information", "Aucune réservation trouvée.");
        router.push('/trajet/trajet');
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de la réservation:", error);
      Alert.alert("Erreur", "Impossible de récupérer les informations de la réservation.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    Alert.alert(
      "Annuler la réservation",
      "Êtes-vous sûr de vouloir annuler cette réservation ?",
      [
        { text: "Non", style: "cancel" },
        {
          text: "Oui",
          onPress: async () => {
            try {
              const token = await SecureStore.getItemAsync('auth_token');
              if (!token) {
                Alert.alert("Erreur", "Vous devez être connecté pour annuler la réservation.");
                return;
              }

              api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
              await api.delete(`posts/reservation/${reservation?.id}/`);
              
              Alert.alert("Succès", "Réservation annulée avec succès.");
              router.push('/trajet/trajet');
            } catch (error) {
              console.error("Erreur lors de l'annulation de la réservation:", error);
              Alert.alert("Erreur", "Impossible d'annuler la réservation.");
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    fetchReservation();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!reservation) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Aucune réservation trouvée</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/trajet/trajet')}
        >
          <Text style={styles.buttonText}>Voir les trajets disponibles</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Détails de la réservation</Text>
        <View style={[styles.statusBadge, styles[`${reservation?.status || 'pending'}Badge`]]}>
          <Text style={styles.statusText}>
            {reservation?.status === 'pending' ? 'En attente' : 
             reservation?.status === 'accepted' ? 'Acceptée' : 'Refusée'}
          </Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conducteur</Text>
          <View style={styles.driverInfo}>
            <MaterialIcons name="person" size={24} color={COLORS.primary} />
            <View style={styles.driverDetails}>
              <Text style={styles.driverName}>
                {reservation?.post?.author_post?.username || 'Conducteur inconnu'}
              </Text>
              {reservation?.post?.author_post?.phone_number && (
                <Text style={styles.phoneNumber}>{reservation.post.author_post.phone_number}</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trajet</Text>
          <View style={styles.routeInfo}>
            <View style={styles.locationItem}>
              <MaterialIcons name="location-pin" size={20} color={COLORS.primary} />
              <View style={styles.locationDetails}>
                <Text style={styles.locationLabel}>Départ</Text>
                <Text style={styles.locationText}>
                  {reservation?.post?.depart_place || 'Lieu de départ non spécifié'}
                </Text>
                <Text style={styles.timeText}>
                  {reservation?.post?.depart_date ? 
                    new Date(reservation.post.depart_date).toLocaleString() : 
                    'Date non spécifiée'}
                </Text>
              </View>
            </View>
            <View style={styles.locationItem}>
              <MaterialIcons name="flag" size={20} color={COLORS.primary} />
              <View style={styles.locationDetails}>
                <Text style={styles.locationLabel}>Arrivée</Text>
                <Text style={styles.locationText}>
                  {reservation?.post?.arrival_place || 'Lieu d\'arrivée non spécifié'}
                </Text>
                <Text style={styles.timeText}>
                  {reservation?.post?.arrival_date ? 
                    new Date(reservation.post.arrival_date).toLocaleString() : 
                    'Date non spécifiée'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <MaterialIcons name="event-seat" size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>
                {reservation?.post?.number_of_places || 0} places
              </Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons name="euro" size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>
                {reservation?.post?.price || 0} €
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancel}
        >
          <MaterialIcons name="close" size={20} color={COLORS.white} />
          <Text style={styles.buttonText}>Annuler la réservation</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pendingBadge: {
    backgroundColor: '#FFF3E0',
  },
  acceptedBadge: {
    backgroundColor: '#E8F5E9',
  },
  declinedBadge: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailsContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
  },
  driverDetails: {
    marginLeft: 12,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  phoneNumber: {
    fontSize: 14,
    color: COLORS.text,
    marginTop: 4,
  },
  routeInfo: {
    gap: 16,
  },
  locationItem: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
  },
  locationDetails: {
    marginLeft: 12,
    flex: 1,
  },
  locationLabel: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  timeText: {
    fontSize: 14,
    color: COLORS.text,
    marginTop: 4,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.text,
  },
  buttonContainer: {
    padding: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 18,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
  },
});
