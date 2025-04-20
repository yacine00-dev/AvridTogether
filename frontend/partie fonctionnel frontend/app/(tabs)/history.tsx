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
  Alert
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useAuth } from '../../context/AuthContext';
import { Redirect, router } from 'expo-router';
import axios from 'axios';

const COLORS = {
  primary: "#032354",
  secondary: "#4c78a5",
  text: "#666",
  border: "#ccc",
  white: "#FFFFFF",
};

type Driver = {
  id: number;
  name: string;
  rating: number;
  avatar?: string;
};

type Ride = {
  id: number;
  date: string;
  amount: string;
  pickup: string;
  destination: string;
  driver: Driver;
  status: 'completed' | 'cancelled';
};

export default function HistoryScreen() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchRideHistory = async () => {
      try {
        setLoading(true);
        // Remplacez par votre endpoint API réel
        const response = await axios.get(`https://your-api.com/users/${user?.id}/rides`, {
          params: {
            status: 'completed'
          }
        });
        
        setRides(response.data);
      } catch (err) {
        console.error("Failed to fetch ride history:", err);
        setError("Failed to load ride history. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRideHistory();
  }, [isAuthenticated, user?.id]);

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

  const handleRateDriver = (ride: Ride) => {
    router.push({
      pathname: '/comment/comment',
      params: { 
        rideId: ride.id.toString(),
        driverName: ride.driver.name,
        driverId: ride.driver.id.toString()
      }
    });
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <Ionicons name="location-sharp" size={25} color={COLORS.primary} />
          <View style={styles.locationTextContainer}>
            <Text style={styles.locationLabel}>LOCATION</Text>
            <Text style={styles.location}>46GX58T, Tizi Ouzou</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => router.push('/profile')}>
          <Image 
            source={user?.photo ? { uri: user.photo } : require("../../assets/images/Ellipse.png")}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => setError(null)}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : rides.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="history" size={50} color={COLORS.border} />
            <Text style={styles.emptyText}>No ride history yet</Text>
            <Text style={styles.emptySubText}>Your completed rides will appear here</Text>
          </View>
        ) : (
          rides.map((ride) => (
            <View key={ride.id} style={styles.activityCard}>
              <View style={styles.dateAmountContainer}>
                <View style={styles.leftDateSection}>
                  <MaterialIcons 
                    name="check" 
                    size={18} 
                    color="#4CAF50" 
                    style={styles.checkIcon}
                  />
                  <Text style={styles.dateText}>{formatDate(ride.date)}</Text>
                </View>
                <Text style={styles.amountText}>{ride.amount} DZD</Text>
              </View>
              
              <View style={styles.divider} />
              
              {/* Section Chauffeur */}
              <View style={styles.driverContainer}>
                <Image 
                  source={ride.driver.avatar 
                    ? { uri: ride.driver.avatar } 
                    : require("../../assets/images/Ellipse.png")} 
                  style={styles.driverAvatar} 
                />
                <View style={styles.driverInfo}>
                  <Text style={styles.driverName}>{ride.driver.name}</Text>
                  <View style={styles.ratingContainer}>
                    <MaterialIcons name="star" size={16} color="#FFD700" />
                    <Text style={styles.driverRating}>{ride.driver.rating.toFixed(1)}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.addressSection}>
                <Text style={styles.addressLabel}>Pickup</Text>
                <Text style={styles.addressText}>{ride.pickup}</Text>
              </View>

              <View style={styles.addressSection}>
                <Text style={styles.addressLabel}>Destination</Text>
                <Text style={styles.addressText}>{ride.destination}</Text>
              </View>

              <TouchableOpacity 
                style={styles.requestButton}
                onPress={() => handleRateDriver(ride)}
              >
                <Text style={styles.requestButtonText}>Évaluer</Text>
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
    padding: 20,
    paddingTop: 35,
    marginTop: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationTextContainer: {
    marginLeft: 8,
  },
  locationLabel: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  location: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  driverRating: {
    marginLeft: 5,
    color: COLORS.text,
    fontSize: 14
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
    marginBottom: 20,
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