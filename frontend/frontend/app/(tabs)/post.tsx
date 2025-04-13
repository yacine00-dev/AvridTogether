import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Platform, StyleSheet, Alert } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

const PosterScreen = () => {
  const [username, setUsername] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [departureTime, setDepartureTime] = useState(new Date());
  const [arrivalTime, setArrivalTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timeType, setTimeType] = useState("");
  const [places, setPlaces] = useState("");
  const [stops, setStops] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    Alert.alert("Ride Details", `
      Username: ${username}
      Date: ${date.toLocaleDateString()}
      Departure: ${departure}
      Departure Time: ${departureTime.toLocaleTimeString()}
      Arrival: ${arrival}
      Arrival Time: ${arrivalTime.toLocaleTimeString()}
      Available Seats: ${places}
      Stops: ${stops}
      Phone: ${phone}
      Email: ${email}
    `);
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#f5f5f5" }}>
      <Text style={styles.title}>🚗 <Text style={{ color: "#003366" }}>Post a Ride</Text></Text>
      <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={styles.input} />
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <TextInput placeholder="Date (DD/MM/YYYY)" value={date.toLocaleDateString()} editable={false} style={styles.input} />
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker value={date} mode="date" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={(event, selectedDate) => {
          setShowDatePicker(false);
          if (selectedDate) setDate(selectedDate);
        }}
        />
      )}
      <View style={styles.rowContainer}>
        <View style={styles.column}>
          <TextInput placeholder="Departure Location" value={departure} onChangeText={setDeparture} style={styles.input} />
          <TouchableOpacity onPress={() => { setShowTimePicker(true); setTimeType("departure"); }}>
            <TextInput placeholder="Select Departure Time" value={departureTime.toLocaleTimeString()} editable={false} style={styles.input} />
          </TouchableOpacity>
        </View>
        <View style={styles.column}>
          <TextInput placeholder="Arrival Location" value={arrival} onChangeText={setArrival} style={styles.input} />
          <TouchableOpacity onPress={() => { setShowTimePicker(true); setTimeType("arrival"); }}>
            <TextInput placeholder="Select Arrival Time" value={arrivalTime.toLocaleTimeString()} editable={false} style={styles.input} />
          </TouchableOpacity>
        </View>
      </View>
      {showTimePicker && (
        <DateTimePicker value={timeType === "departure" ? departureTime : arrivalTime} mode="time" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={(event, selectedTime) => {
          setShowTimePicker(false);
          if (selectedTime) {
            timeType === "departure" ? setDepartureTime(selectedTime) : setArrivalTime(selectedTime);
          }
        }}
        />
      )}
      <TextInput placeholder="Available Seats" keyboardType="numeric" value={places} onChangeText={setPlaces} style={styles.input} />
      <TextInput placeholder="Number of Stops" keyboardType="numeric" value={stops} onChangeText={setStops} style={styles.input} />
      <View style={styles.rowContainer}>
        <TextInput placeholder="Phone Number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} style={[styles.input, { flex: 1, marginRight: 5 }]} />
        <TextInput placeholder="Email" keyboardType="email-address" value={email} onChangeText={setEmail} style={[styles.input, { flex: 1, marginLeft: 5 }]} />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "bold", color: "#003366", textAlign: "center", marginBottom: 15 },
  input: { backgroundColor: "white", padding: 12, borderRadius: 5, fontSize: 16, marginBottom: 10, borderWidth: 1, borderColor: "#ddd" },
  rowContainer: { flexDirection: "row", justifyContent: "space-between" },
  column: { flex: 1, marginHorizontal: 5 },
  button: { backgroundColor: "#003366", padding: 16, borderRadius: 5, alignItems: "center", marginTop: 10 },
  buttonText: { color: "white", fontSize: 18, fontWeight: "bold" }
});

export default PosterScreen;

