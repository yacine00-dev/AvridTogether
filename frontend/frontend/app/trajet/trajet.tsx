import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react"; 
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Image,ScrollView } from "react-native";
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

const rides = [
    {
        id: '1',
        driver: "OUADAH SALIM",
        phone: "+213777767777",
        rating: 4,
        price: "1343,0",
        pickup: "RN 5, Hussin Dey, Algiers",
        destination: "Azeffun,Tizi Ouzou",
        car: "Blue Hyundai Elentra BT-015-TT",
        photo: require('@/assets/images/driver1.png')
      },
      {
        id: '2',
        driver: "CHARERBACHE MHAMED",
        phone: "+213555667788",
        rating: 5,
        price: "1500,0",
        pickup: "Cité Amirouche, Alger Centre",
        destination: "Bab Ezzouar, Alger",
        car: "White Renault Symbol DX-456-AB",
        photo: require('@/assets/images/driver2.png')
      },
      {
        id: '3',
        driver: "GOUMARI SALIMA",
        phone: "+213798654321",
        rating: 3,
        price: "1200,5",
        pickup: "Boulevard Zighout Youcef, Oran",
        destination: "Es Senia, Oran",
        car: "Red Fiat Punto TR-789-ZY",
        photo: require('@/assets/images/driver3.png')
      }
];


const RideItem = React.memo(({ ride }) => {
    const [acceptScale] = useState(new Animated.Value(1));
    const [declineShake] = useState(new Animated.Value(0));
  
    const handleAcceptAnimation = () => {
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
      ]).start();
      console.log('Accepté:', ride.id);
    };
  
    const handleDeclineAnimation = () => {
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
      ]).start();
      console.log('Refusé:', ride.id);
    };
  
    return (
      <View style={styles.rideCard}>
        {/* Section Conducteur */}
        <View style={styles.driverSection}>
          <View style={styles.driverInfo}>
            <Image source={ride.photo} style={styles.driverPhoto} />
            <View style={styles.driverText}>
              <Text style={styles.driverName}>{ride.driver}</Text>
              <Text style={styles.driverPhone}>{ride.phone}</Text>
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((index) => (
                  <MaterialIcons 
                    key={index}
                    name={index <= ride.rating ? "star" : "star-border"}
                    size={16}
                    color="#FFD700"
                  />
                ))}
              </View>
            </View>
          </View>
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>{ride.price} DZD</Text>
          </View>
        </View>
  
        {/* Adresses */}
        <MaterialIcons name="location-pin" size={20} color={COLORS.primary} />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pickup</Text>
          <Text style={styles.sectionContent}>{ride.pickup}</Text>
        </View>

        <MaterialIcons name="flag" size={20} color={COLORS.primary} />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destination</Text>
          <Text style={styles.sectionContent}>{ride.destination}</Text>
        </View>
  
        {/* Véhicule */}
        <Text style={styles.carInfo}>{ride.car}</Text>
        <View style={styles.separator} />
  
        {/* Boutons avec animations */}
        <View style={styles.buttonContainer}>
          <Animated.View style={{ transform: [{ translateX: declineShake }] }}>
            <TouchableOpacity 
              style={styles.declineButton}
              onPress={handleDeclineAnimation}
            >
              <MaterialIcons name="close" size={18} color={COLORS.primary} />
              <Text style={styles.DeclineText}>Decline</Text>
            </TouchableOpacity>
          </Animated.View>
  
          <Animated.View style={{ transform: [{ scale: acceptScale }] }}>
            <TouchableOpacity 
              style={styles.acceptButton}
              onPress={handleAcceptAnimation}
            >
              <MaterialIcons name="check" size={18} color={COLORS.white} />
              <Text style={styles.AcceptText}>Accept</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    );
  });

  export default function AvailableRidesScreen() {
    const navigation = useNavigation();
  
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
  
        {/* En-tête */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Available rides</Text>
        </View>
  
        {/* Liste des trajets */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {rides.map((ride) => (
            <RideItem key={ride.id} ride={ride} />
          ))}
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
  },
  timeContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginLeft: 'auto',
  },
  timeText: {
    fontSize: 14,
    color: COLORS.primary,
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
  phone: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  sectionContent: {
    fontSize: 16,
    color: COLORS.text,
  },
  carInfo: {
    fontSize: 14,
    color: COLORS.primary,
    marginVertical: 12,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center', 
    gap: 16,
    marginTop: 12,
  },
  declineButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,      
    borderColor: COLORS.secondary,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    flexDirection: 'row', 
    alignItems: 'center',
    gap: 8, 
  },
  acceptButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8,
  },
  iconStyle: {
    marginRight: 5, 
  },
    AcceptText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
    DeclineText: {
        color: "#011023",
        fontWeight: 'bold',
        fontSize: 16,
      },
});