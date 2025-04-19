import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react"; 
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Image, ScrollView, RefreshControl, Platform } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import { Animated } from 'react-native';

const COLORS = {
  primary: "#032354",
  secondary: "#4c78a5",
  text: "#666",
  border: "#eee",
  white: "#FFFFFF",
};

const reservations = [
  {
    id: '1',
    passenger: "Karim Benzema",
    pickupTime: "14:30",
    start: "RN 5, Hussin Dey, Alger",
    destination: "Azeffun, Tizi Ouzou",
    rating: 4.5,
    photo: require('@/assets/images/driver1.png')
  },
  {
    id: '2',
    passenger: "Sarah Mourad",
    pickupTime: "15:15", 
    start: "Cité Amirouche, Alger Centre",
    destination: "Bab Ezzouar, Alger",
    rating: 4.8,
    photo: require('@/assets/images/driver2.png')
  },
  {
    id: '3',
    passenger: "Mohamed Zitouni",
    pickupTime: "16:00",
    start: "Boulevard Zighout Youcef, Oran",
    destination: "Es Senia, Oran",
    rating: 4.2,
    photo: require('@/assets/images/driver3.png')
  }
];

const ReservationItem = React.memo(({ reservation, onAction }) => {
  const [acceptScale] = useState(new Animated.Value(1));
  const [declineShake] = useState(new Animated.Value(0));
  const [actionTaken, setActionTaken] = useState(false);

  const handleAccept = () => {
    setActionTaken(true);
    Animated.sequence([
      Animated.timing(acceptScale, {
        toValue: 0.9,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.spring(acceptScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start(() => onAction(reservation.id, 'accepted'));
  };

  const handleDecline = () => {
    setActionTaken(true);
    declineShake.setValue(0);
    Animated.sequence([
      Animated.timing(declineShake, {
        toValue: 5,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(declineShake, {
        toValue: -5,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(declineShake, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start(() => onAction(reservation.id, 'declined'));
  };

  return (
    <View style={styles.reservationCard}>
      <View style={styles.passengerHeader}>
        <Image source={reservation.photo} style={styles.passengerPhoto} />
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
  const navigation = useNavigation();
  const [reservationsList, setReservationsList] = useState(reservations);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const handleReservationAction = (reservationId, action) => {
    setReservationsList(prev => 
      prev.filter(item => item.id !== reservationId)
    );
    // Ici vous ajouterez l'appel API pour informer le backend
    console.log(`${action} reservation ${reservationId}`);
  };

  const refreshData = () => {
    setRefreshing(true);
    // Simuler un appel API
    setTimeout(() => {
      setReservationsList(reservations);
      setRefreshing(false);
      setLastUpdated(new Date());
    }, 1000);
  };

  useEffect(() => {
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
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
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, 
    paddingVertical: 30, 
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginTop: Platform.OS === 'ios' ? 10 : 0,
},
  headerTitleContainer: {
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  updateText: {
    fontSize: 12,
    color: COLORS.text,
  },
  reservationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
  },
  passengerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    marginLeft: 4,
    color: COLORS.text,
  },
  timeBadge: {
    backgroundColor: COLORS.secondary,
    color: COLORS.white,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    fontSize: 14,
  },
  detailsSection: {
    marginVertical: 8,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  locationText: {
    marginLeft: 8,
  },
  locationTitle: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  locationAddress: {
    fontSize: 16,
    color: COLORS.text,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  acceptButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    justifyContent: 'center',
  },
  declineButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.text,
    fontSize: 16,
    marginTop: 40,
  },
  scrollContent: {
    padding: 16,
  },
});