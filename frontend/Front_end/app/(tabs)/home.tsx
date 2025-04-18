import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Image, ScrollView, TextInput } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
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
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [date, setDate] = useState(new Date());
  const [hour, setHour] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showHourPicker, setShowHourPicker] = useState(false);

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onChangeHour = (event, selectedHour) => {
    setShowHourPicker(false);
    if (selectedHour) {
      setHour(selectedHour);
    }
  };

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
        <TouchableOpacity 
          onPress={() => navigation.navigate("Profile")} 
          style={styles.profileContainer} // Nouveau style ajouté
        >
          <Image 
            source={require("./assets/icon.png")} 
            style={styles.profileImage} // Nouveau style ajouté
          />
        </TouchableOpacity>
      </View>
        {/* Titres */}
        <View style={styles.titleContainer}>
          <Text style={styles.welcome}>Welcome back, Abderezak !</Text>
          <Text style={styles.bookingTitle}>Book your ride</Text>
        </View>

        {/* Formulaire */}
        <View style={styles.bookingContainer}>
          {/* Departure */}
          <View style={styles.fieldContainer}>
            <MaterialIcons name="place" size={24} color={COLORS.primary} />
            <TextInput
              style={[styles.inputField, { flex: 1 }]}
              value={departure}
              onChangeText={setDeparture}
              placeholder="Enter departure"
              placeholderTextColor={COLORS.text}
            />
          </View>

          {/* Arrival */}
          <View style={styles.fieldContainer}>
            <MaterialIcons name="flag" size={24} color={COLORS.primary} />
            <TextInput
              style={[styles.inputField, { flex: 1 }]}
              value={arrival}
              onChangeText={setArrival}
              placeholder="Enter arrival"
              placeholderTextColor={COLORS.text}
            />
          </View>

          {/* Date */}
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.inputField}>
            <MaterialIcons name="date-range" size={24} color={COLORS.primary} />
            <Text style={[styles.inputText, { marginLeft: 10 }]}>
              {date.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="calendar" // Affiche un calendrier pour la sélection de la date
              onChange={onChangeDate}
            />
          )}

          {/* Hour */}
          <TouchableOpacity onPress={() => setShowHourPicker(true)} style={styles.inputField}>
            <MaterialIcons name="timer" size={24} color={COLORS.primary} />
            <Text style={[styles.inputText, { marginLeft: 10 }]}>
              {hour.toLocaleTimeString()}
            </Text>
          </TouchableOpacity>
          {showHourPicker && (
            <DateTimePicker
              value={hour}
              mode="time"
              display="clock" // Affiche une horloge pour la sélection de l'heure
              onChange={onChangeHour}
            />
          )}

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

      {/* Bottom Navigation */}
      <View style={styles.navContainer}>
        {/* Groupe Gauche - Home & Wallet */}
        <View style={styles.leftGroup}>
          <TouchableOpacity style={styles.navItem}>
            <MaterialIcons name="home" size={26} color="#052659" />
            <Text style={styles.activeText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navItem, { marginLeft: 30 }]}>
            <MaterialIcons name="account-balance-wallet" size={26} color="#7DA0CA" />
            <Text style={styles.inactiveText}>Wallet</Text>
          </TouchableOpacity>
        </View>

        {/* Bouton Central */}
        <TouchableOpacity style={styles.centralButton}>
          <MaterialIcons name="search" size={36} color="white" />
        </TouchableOpacity>

        {/* Groupe Droit - History & Profile */}
        <View style={styles.rightGroup}>
          <TouchableOpacity style={[styles.navItem, { marginRight: 30 }]}>
            <MaterialIcons name="history" size={26} color="#7DA0CA" />
            <Text style={styles.inactiveText}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <MaterialIcons name="person" size={26} color="#7DA0CA" />
            <Text style={styles.inactiveText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    padding: 20,
  },
  profileContainer: {
    marginTop: 20,
    position: "absolute",
    top: 10,
    right: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25, // Pour que la photo soit circulaire
  },
  locationContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: 20 }]
  },
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
  fieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 10,
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












