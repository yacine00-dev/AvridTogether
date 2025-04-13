import { StatusBar } from "expo-status-bar";
import React from "react";
import { useRef } from 'react';

import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Image, ScrollView,FlatList } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

// Couleurs constantes
const COLORS = {
  primary: "#032354",
  secondary: "#4c78a5",
  text: "#666",
  border: "#ccc",
  white: "#FFFFFF",
};

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />

      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ flexGrow: 1 }} 
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.locationContainer}>
            <Ionicons name="location-sharp" size={16} color={COLORS.primary} />
            <Text style={styles.location}>46GX58T, Tizi Ouzou</Text>
        </View>


          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Image 
              source={require("../../assets/images/driver1.png")} // Chemin vers l'image
              style={{ width: 50, height: 50, borderRadius:50, alignSelf: 'flex-end', marginTop: 20 }} // Ajuste la taille
            />
          </View>
        </View>

        {/* Titres */}
        <View style={styles.titleContainer}>
          <Text style={styles.welcome}>Welcome back, Isma !</Text>
          <Text style={styles.bookingTitle}>Book your ride</Text>
        </View>

        {/* Formulaire */}
        <View style={styles.bookingContainer}>
          {["Departure", "Arrival", "Date", "Hour"].map((label, index) => (
            <TouchableOpacity key={index} style={styles.inputField}>
              <MaterialIcons 
                name={
                  label === "Departure" ? "place" :
                  label === "Arrival" ? "flag" :
                  label === "Date" ? "date-range" : "timer"
                } 
                size={24} 
                color={COLORS.primary} 
              />
              <Text style={styles.inputText}>{label}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.searchButton}>
            <Text style={styles.searchText}>SEARCH</Text>
          </TouchableOpacity>
        </View>

        {/* Promotions */}
        <View style={styles.discountsContainer}>
          <Text style={styles.sectionTitle}>Discounts & Promo Codes</Text>
          {["Get 10% Using RAMIO", "Get 50% Using CAR50"].map((text, index) => (
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
    justifyContent: "flex-end",
    padding: 20,
  },
  locationContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: 20 }] // Ajuste -20 selon la hauteur du conteneur
  }
  
  ,
  location: {
    marginLeft: 5,
    color: COLORS.primary,
    fontWeight: "500",
  },
  titleContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
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
    padding: 20,
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
    marginLeft: 10,
    color: COLORS.text,
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
    padding: 20,
    flexGrow: 1,
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
  },
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
});



// export default HomeScreen; (removed duplicate export)
