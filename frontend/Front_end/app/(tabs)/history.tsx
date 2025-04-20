import { StatusBar } from "expo-status-bar";
import React from "react";
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Image, ScrollView } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';

import { Redirect, router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

const COLORS = {
  primary: "#032354",
  secondary: "#4c78a5",
  text: "#666",
  border: "#ccc",
  white: "#FFFFFF",
};

const activities = [
  {
    date: "29 Jan 2025 at 06:07",
    amount: "1343,0 DZD",
    pickup: "RN 5, Hussin Dey, Algiers",
    destination: "Azeffun,Tizi Ouzou",
    driver: {
      name: "Mohamed K.",
      rating: 4.8,
      avatar: require("@/assets/images/driver2.png")
    }
  },
  {
    date: "03 Jan 2025 at 15:02",
    amount: "3541,0 DZD",
    pickup: "RN 5, Hussin Dey, Algiers",
    destination: "Ain beida, Oum el bouaghi",
    driver: {
      name: "Karim B.",
      rating: 4.5,
      avatar: require("@/assets/images/driver1.png")
    }
  },
  // ... autres trajets
];

export default function HistoryScreen() {
  /*pour la verification
  const navigation = useNavigation();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }
    */
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
        <Image 
          source={require("@/assets/images/Ellipse.png")}
          style={styles.profileImage}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activities.map((activity, index) => (
          <View key={index} style={styles.activityCard}>
            <View style={styles.dateAmountContainer}>
              <View style={styles.leftDateSection}>
                <MaterialIcons 
                  name="check" 
                  size={18} 
                  color="#4CAF50" 
                  style={styles.checkIcon}
                />
                <Text style={styles.dateText}>{activity.date}</Text>
              </View>
              <Text style={styles.amountText}>{activity.amount}</Text>
            </View>
            
            <View style={styles.divider} />
            
            {/* Section Chauffeur */}
            <View style={styles.driverContainer}>
              <Image 
                source={activity.driver.avatar} 
                style={styles.driverAvatar} 
              />
              <View style={styles.driverInfo}>
                <Text style={styles.driverName}>{activity.driver.name}</Text>
                <View style={styles.ratingContainer}>
                  <MaterialIcons name="star" size={16} color="#FFD700" />
                  <Text style={styles.driverRating}>{activity.driver.rating}</Text>
                </View>
              </View>
            </View>

            <View style={styles.addressSection}>
              <Text style={styles.addressLabel}>Pickup</Text>
              <Text style={styles.addressText}>{activity.pickup}</Text>
            </View>

            <View style={styles.addressSection}>
              <Text style={styles.addressLabel}>Destination</Text>
              <Text style={styles.addressText}>{activity.destination}</Text>
            </View>

            <TouchableOpacity 
              style={styles.requestButton}
              onPress={() => router.push({
                pathname: '/comment/comment',
                params: { 
                  driverName: activity.driver.name,
                  driverAvatar: activity.driver.avatar
                }
              })}
            >
              <View style={styles.leftDateSection}>
                <Text style={styles.requestButtonText}>Évaluer</Text>
              </View>
            </TouchableOpacity>
          </View>
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
      paddingBottom: 100,
    },
    activityCard: {
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: 16,
      padding: 15,
      marginBottom: 15,
    },
    dateAmountRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    dateAmountContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        position: 'relative',
      },
      leftDateSection: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      checkIcon: {
        marginRight: 8,
      },
      
    divider: {
        borderBottomColor: COLORS.border, 
        borderBottomWidth: 1,       
         marginVertical: 10, 
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
      backgroundColor:COLORS.secondary,
      width: 168,
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: 15,
      paddingVertical: 8,
      paddingHorizontal: 24,
      alignItems: 'center',
      paddingTop: 8,
      paddingRight: 24,
      paddingBottom: 8,
      paddingLeft: 24,
      marginTop: 12,
      alignSelf: 'center',
    },
    requestButtonText: {
      color: COLORS.white,
      fontWeight: '600',
      fontSize: 14,
    },
    // Styles communs réutilisés depuis WalletScreen
    navContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      height: 70,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: '#F8FAFC',
      backgroundColor: 'white',
      position: 'relative',
    },
    leftGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '40%',
      paddingLeft: 10,
    },
    rightGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '40%',
      justifyContent: 'flex-end',
      paddingRight: 10,
    },
    navItem: {
      alignItems: 'center',
      paddingHorizontal: 8,
    },
    centralButton: {
      position: 'absolute',
      left: '50%',
      bottom: 20,
      transform: [{ translateX: -35 }],
      backgroundColor: '#052659',
      width: 70,
      height: 70,
      borderRadius: 35,
      borderColor: '#F8FAFC',
      borderWidth: 6,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
    },
    activeText: {
      color: '#052659',
      fontSize: 12,
      marginTop: 4,
      fontWeight: '600',
    },
    inactiveText: {
      color: '#8C8994',
      fontSize: 12,
      marginTop: 4,
      fontWeight: '500',
    },
    driverContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0'
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
  });