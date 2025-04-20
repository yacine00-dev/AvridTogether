import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator,SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Image, ScrollView, TextInput } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';

import { Redirect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

// Couleurs constantes
const COLORS = {
  primary: "#032354",
  secondary: "#4c78a5",
  text: "#666",
  border: "#ccc",
  white: "#FFFFFF",
};

export default function HomeScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [date, setDate] = useState(new Date());
  const [hour, setHour] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showHourPicker, setShowHourPicker] = useState(false);

  const router = useRouter();

  const handleSearch = () => {
    router.push({
      pathname: '/trajet/trajet',
      params: {
        departure: departure,
        arrival: arrival,
        date: date.toLocaleDateString(),
        time: hour.toLocaleTimeString()
      }
    });
  };

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
/*
  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }
*/
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />

      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }} 
        keyboardShouldPersistTaps="handled"
      >
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
            source={require("@/assets/images/driver2.png")}
            style={styles.profileImage}
          />
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
              display="calendar"
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
              display="clock"
              onChange={onChangeHour}
            />
          )}

          <TouchableOpacity 
            style={styles.searchButton}
            onPress={handleSearch}
          >
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 30,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationTextContainer: {
    marginLeft: 10,
  },
  locationLabel: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: "500",
  },
  location: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "600",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
});