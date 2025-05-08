import React, { useState, useEffect } from "react";
import { ActivityIndicator, View, Text, TextInput, TouchableOpacity, Platform, StyleSheet, Alert, Switch } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Redirect, router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

const PosterScreen = () => {
  const [title, setTitle] = useState("");
  const [departPlace, setDepartPlace] = useState("");
  const [arrivalPlace, setArrivalPlace] = useState("");
  const [departTime, setDepartTime] = useState(new Date());
  const [arrivalTime, setArrivalTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timeType, setTimeType] = useState("");
  const [numberOfPlaces, setNumberOfPlaces] = useState("");
  const [price, setPrice] = useState("");
  const [smoker, setSmoker] = useState(false);
  const [animalsAutorised, setAnimalsAutorised] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasActiveTrip, setHasActiveTrip] = useState(false);
  const [activePostTitle, setActivePostTitle] = useState("");

  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    checkActiveTrip();
  }, []);

  const checkActiveTrip = async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (!token) return;

      const response = await fetch("http://10.0.2.2:8000/api/posts/creat_post/", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Vérifier si l'utilisateur a des posts actifs et non réservés
        const activePosts = Array.isArray(data) ? data : [data];
        const activePost = activePosts.find(post => !post.reserved);
        if (activePost) {
          setHasActiveTrip(true);
          setActivePostTitle(activePost.title);
        } else {
          setHasActiveTrip(false);
          setActivePostTitle("");
        }
      }
    } catch (error) {
      console.error("Erreur lors de la vérification des trajets:", error);
      setHasActiveTrip(false);
    }
  };

  const handleReservationsPress = async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (!token) {
        Alert.alert("Erreur", "Vous devez être connecté pour voir vos réservations.");
        return;
      }

      const response = await fetch("http://10.0.2.2:8000/api/posts/creat_post/", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          router.push("/driverRes/DriverReservations");
        } else {
          Alert.alert(
            "Information",
            "Vous n'avez pas encore posté de trajet.",
            [{ text: "OK" }]
          );
        }
      }
    } catch (error) {
      console.error("Erreur lors de la vérification des trajets:", error);
      Alert.alert("Erreur", "Une erreur est survenue lors de la vérification de vos trajets.");
    }
  };

  const handleDeleteTrip = async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (!token || !activePostTitle) {
        Alert.alert("Erreur", "Impossible de supprimer le trajet.");
        return;
      }

      Alert.alert(
        "Confirmation",
        "Êtes-vous sûr de vouloir supprimer ce trajet ?",
        [
          {
            text: "Annuler",
            style: "cancel"
          },
          {
            text: "Supprimer",
            style: "destructive",
            onPress: async () => {
              const response = await fetch(`http://10.0.2.2:8000/api/posts/delete/${encodeURIComponent(activePostTitle)}/`, {
                method: "DELETE",
                headers: {
                  "Authorization": `Bearer ${token}`
                }
              });

              console.log("Réponse suppression:", response.status, await response.text());

              if (response.ok) {
                Alert.alert("Succès", "Le trajet a été supprimé avec succès.");
                setHasActiveTrip(false);
                setActivePostTitle("");
              } else {
                throw new Error("Erreur lors de la suppression");
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      Alert.alert("Erreur", "Une erreur est survenue lors de la suppression du trajet.");
    }
  };

  const formatTime = (date: Date) => {
    // Format: HH:MM:SS
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const handleSubmit = async () => {
    if (hasActiveTrip) {
      Alert.alert(
        "Trajet existant",
        "Vous avez déjà un trajet actif. Veuillez l'annuler avant d'en créer un nouveau.",
        [
          { text: "Voir mes réservations", onPress: () => router.push("/driverRes/DriverReservations") },
          { text: "OK", style: "cancel" }
        ]
      );
      return;
    }

    if (!title || !departPlace || !arrivalPlace || !numberOfPlaces || !price) {
      Alert.alert("Erreur", "Merci de remplir tous les champs obligatoires.");
      return;
    }

    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (!token) {
        Alert.alert("Erreur", "Vous devez être connecté pour poster un trajet.");
        return;
      }

      const response = await fetch("http://10.0.2.2:8000/api/posts/creat_post/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          depart_place: departPlace,
          arrival_place: arrivalPlace,
          depart_date: formatTime(departTime),
          arrival_date: formatTime(arrivalTime),
          number_of_places: parseInt(numberOfPlaces, 10),
          price: parseFloat(price),
          smoker,
          animals_autorised: animalsAutorised,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Une erreur est survenue");
      }

      Alert.alert(
        "Succès",
        "Votre trajet a bien été posté !",
        [
          { 
            text: "Voir les réservations",
            onPress: () => router.push("/driverRes/DriverReservations")
          },
          {
            text: "OK",
            style: "cancel"
          }
        ]
      );

      setHasActiveTrip(true);
      // Reset form
      setTitle("");
      setDepartPlace("");
      setArrivalPlace("");
      setDepartTime(new Date());
      setArrivalTime(new Date());
      setNumberOfPlaces("");
      setPrice("");
      setSmoker(false);
      setAnimalsAutorised(false);
    } catch (error: any) {
      console.error("Erreur lors de la création du post:", error);
      Alert.alert("Erreur", error.message || "Une erreur est survenue lors de la création du trajet.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View style={{ flex: 1, padding: 20, paddingTop: 60, backgroundColor: "#f5f5f5" }}>
      <View style={styles.header}>
        <Text style={styles.title}>🚗 <Text style={{ color: "#003366" }}>Poster un trajet</Text></Text>
        <TouchableOpacity 
          style={styles.reservationsButton}
          onPress={handleReservationsPress}
        >
          <MaterialIcons name="list" size={24} color="#003366" />
          <Text style={styles.reservationsButtonText}>Réservations</Text>
        </TouchableOpacity>
      </View>

      {hasActiveTrip && (
        <View style={styles.warningContainer}>
          <MaterialIcons name="warning" size={24} color="#FFA500" />
          <Text style={styles.warningText}>
            Vous avez déjà un trajet actif. Vous ne pouvez pas en créer un nouveau.
          </Text>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleDeleteTrip}
          >
            <MaterialIcons name="delete" size={24} color="#FF0000" />
            <Text style={styles.deleteButtonText}>Supprimer le trajet</Text>
          </TouchableOpacity>
        </View>
      )}

      <TextInput placeholder="Titre du trajet" value={title} onChangeText={setTitle} style={styles.input} />
      <View style={styles.rowContainer}>
        <View style={styles.column}>
          <TextInput placeholder="Départ" value={departPlace} onChangeText={setDepartPlace} style={styles.input} />
          <TouchableOpacity onPress={() => { setShowTimePicker(true); setTimeType("departure"); }}>
            <TextInput placeholder="Heure de départ" value={formatTime(departTime)} editable={false} style={styles.input} />
          </TouchableOpacity>
        </View>
        <View style={styles.column}>
          <TextInput placeholder="Arrivée" value={arrivalPlace} onChangeText={setArrivalPlace} style={styles.input} />
          <TouchableOpacity onPress={() => { setShowTimePicker(true); setTimeType("arrival"); }}>
            <TextInput placeholder="Heure d'arrivée" value={formatTime(arrivalTime)} editable={false} style={styles.input} />
          </TouchableOpacity>
        </View>
      </View>
      {showTimePicker && (
        <DateTimePicker value={timeType === "departure" ? departTime : arrivalTime} mode="time" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={(event, selectedTime) => {
          setShowTimePicker(false);
          if (selectedTime) {
            timeType === "departure" ? setDepartTime(selectedTime) : setArrivalTime(selectedTime);
          }
        }}
        />
      )}
      <TextInput placeholder="Nombre de places" keyboardType="numeric" value={numberOfPlaces} onChangeText={setNumberOfPlaces} style={styles.input} />
      <TextInput placeholder="Prix (DZD)" keyboardType="decimal-pad" value={price} onChangeText={setPrice} style={styles.input} />
      <View style={styles.switchContainer}>
        <Text>Fumeur ?</Text>
        <Switch value={smoker} onValueChange={setSmoker} />
        <Text>Animaux autorisés ?</Text>
        <Switch value={animalsAutorised} onValueChange={setAnimalsAutorised} />
      </View>
      <TouchableOpacity 
        style={[styles.button, hasActiveTrip && styles.buttonDisabled]} 
        onPress={handleSubmit} 
        disabled={loading || hasActiveTrip}
      >
        <Text style={styles.buttonText}>{loading ? "Envoi..." : "Publier"}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { 
    fontSize: 24,
    fontWeight: "bold", 
    color: "#003366", 
    textAlign: "center", 
    marginBottom: 15 
  },
  input: { 
    backgroundColor: "white", 
    padding: 12, 
    borderRadius: 5, 
    fontSize: 16, 
    marginBottom: 10, 
    borderWidth: 1, 
    borderColor: "#ddd" 
  },
  rowContainer: { 
    flexDirection: "row", 
    justifyContent: "space-between" 
  },
  column: { 
    flex: 1, 
    marginHorizontal: 5 
  },
  button: { 
    backgroundColor: "#003366", 
    padding: 16, 
    borderRadius: 5, 
    alignItems: "center", 
    marginTop: 10 
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: { 
    color: "white", 
    fontSize: 18, 
    fontWeight: "bold" 
  },
  switchContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    marginBottom: 10 
  },
  reservationsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#003366',
  },
  reservationsButtonText: {
    color: '#003366',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  warningText: {
    color: '#FFA500',
    marginLeft: 10,
    flex: 1,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE4E4',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  deleteButtonText: {
    color: '#FF0000',
    marginLeft: 5,
    fontWeight: 'bold',
  },
});

export default PosterScreen;

