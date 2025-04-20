import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react"; 
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Image, ScrollView, RefreshControl, Platform, Alert } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { router } from 'expo-router'; // ✅ Expo Router
import { Animated } from 'react-native';
import axios from 'axios';

const COLORS = {
  primary: "#032354",
  secondary: "#4c78a5",
  text: "#666",
  border: "#eee",
  white: "#FFFFFF",
};

const ReservationItem = React.memo(({ reservation, onAction }) => {
  const [acceptScale] = useState(new Animated.Value(1));
  const [declineShake] = useState(new Animated.Value(0));
  const [actionTaken, setActionTaken] = useState(false);

  const handleAccept = () => {
    setActionTaken(true);
    Animated.sequence([
      Animated.timing(acceptScale, { toValue: 0.9, duration: 50, useNativeDriver: true }),
      Animated.spring(acceptScale, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start(() => onAction(reservation.id, 'accepted'));
  };

  const handleDecline = () => {
    setActionTaken(true);
    declineShake.setValue(0);
    Animated.sequence([
      Animated.timing(declineShake, { toValue: 5, duration: 50, useNativeDriver: true }),
      Animated.timing(declineShake, { toValue: -5, duration: 50, useNativeDriver: true }),
      Animated.timing(declineShake, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start(() => onAction(reservation.id, 'declined'));
  };

  return (
    <View style={styles.reservationCard}>
      <View style={styles.passengerHeader}>
        <Image source={{ uri: reservation.photo }} style={styles.passengerPhoto} />
        <View style={styles.passengerInfo}>
          <Text style={styles.passengerName}>{reservation.passenger}</Text>
          <View style={styles.ratingContainer}>
            <MaterialIcons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{reservation.rating}</Text>
          </View>
        </View>
        <Text style={styles.timeBadge}>{reservation.pickupTime}</Text>
      </View>

      <View style={styles.detailsSection}>
        <View style={styles.locationItem}>
          <MaterialIcons name="location-pin" size={20} color={COLORS.primary} />
          <View style={styles.locationText}>
            <Text style={styles.locationTitle}>Pickup</Text>
            <Text style={styles.locationAddress}>{reservation.start}</Text>
          </View>
        </View>
        
        <View style={styles.locationItem}>
          <MaterialIcons name="flag" size={20} color={COLORS.primary} />
          <View style={styles.locationText}>
            <Text style={styles.locationTitle}>Destination</Text>
            <Text style={styles.locationAddress}>{reservation.destination}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <Animated.View style={{ transform: [{ translateX: declineShake }] }}>
          <TouchableOpacity 
            style={[styles.declineButton, actionTaken && styles.disabledButton]}
            onPress={handleDecline}
            disabled={actionTaken}
          >
            <MaterialIcons name="close" size={18} color={COLORS.primary} />
            <Text style={styles.buttonText}>Decline</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={{ transform: [{ scale: acceptScale }] }}>
          <TouchableOpacity 
            style={[styles.acceptButton, actionTaken && styles.disabledButton]}
            onPress={handleAccept}
            disabled={actionTaken}
          >
            <MaterialIcons name="check" size={18} color={COLORS.white} />
            <Text style={[styles.buttonText, { color: COLORS.white }]}>Accept</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
});

export default function DriverReservationsScreen() {
  const [reservationsList, setReservationsList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchReservations = async () => {
    try {
      const response = await axios.get("http://<TON_BACKEND_URL>/api/reservations");
      setReservationsList(response.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Erreur lors du chargement des réservations :", error);
      Alert.alert("Erreur", "Impossible de récupérer les réservations.");
    }
  };

  const handleReservationAction = async (reservationId, action) => {
    try {
      await axios.post(`http://<TON_BACKEND_URL>/api/reservations/${reservationId}/${action}`);
      setReservationsList(prev => prev.filter(item => item.id !== reservationId));
    } catch (error) {
      console.error(`Erreur lors de la ${action} de la réservation :`, error);
      Alert.alert("Erreur", "L'action n'a pas pu être enregistrée.");
    }
  };

  const refreshData = () => {
    setRefreshing(true);
    fetchReservations().finally(() => setRefreshing(false));
  };

  useEffect(() => {
    fetchReservations();
    const interval = setInterval(fetchReservations, 30000); // Mise à jour toutes les 30s
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
          <Text style={styles.screenTitle}>Reservations on hold</Text>
          <Text style={styles.updateText}>
            Dernière mise à jour : {lastUpdated.toLocaleTimeString()}
          </Text>
        </View>

        <TouchableOpacity onPress={refreshData}>
          <MaterialIcons name="refresh" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshData}
            colors={[COLORS.primary]}
          />
        }
      >
        {reservationsList.length === 0 ? (
          <Text style={styles.emptyText}>No reservations on hold</Text>
        ) : (
          reservationsList.map((reservation) => (
            <ReservationItem
              key={reservation.id}
              reservation={reservation}
              onAction={handleReservationAction}
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
});
