import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

const Stack = createStackNavigator();

const mockRide = {
  id: '1',
  destination: 'Paris',
  driver: 'Jean Dupont',
  estimatedTime: '15 min'
};

const WaitingScreen = ({ navigation }) => {
  const [status, setStatus] = useState("En attente de confirmation par le chauffeur");
  const [isPending, setIsPending] = useState(true);
  const [countdown, setCountdown] = useState(20);
  const [driverAvailable, setDriverAvailable] = useState(true);

  const checkDriverResponse = () => {
    setTimeout(() => {
      const isDriverFound = Math.random() > 0.4;
      
      if (!isDriverFound) {
        setStatus("Aucun chauffeur disponible");
        setDriverAvailable(false);
        setIsPending(false);
        
        setTimeout(() => {
          navigation.navigate('Accueil');
        }, 3000);
        return;
      }

      const isConfirmed = Math.random() > 0.5;
      if (isConfirmed) {
        setStatus("Confirmé ! Préparation du trajet...");
        setIsPending(false);
        navigation.navigate('TripScreen', { ride: mockRide });
      } else {
        setStatus("Le chauffeur a décliné la demande");
        setIsPending(false);
      }
    }, 5000);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleAutoCancel();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    checkDriverResponse();
    return () => clearInterval(timer);
  }, []);

  const handleCancel = () => {
    Alert.alert(
      'Annuler la demande',
      'Êtes-vous sûr de vouloir annuler cette demande ?',
      [
        { text: 'Non' },
        { 
          text: 'Oui',
          onPress: () => {
            setIsPending(false);
            setStatus("Demande annulée");
            navigation.navigate('Accueil');
          }
        }
      ]
    );
  };

  const handleAutoCancel = () => {
    setIsPending(false);
    setStatus("Aucune réponse reçue - Annulation automatique");
    setTimeout(() => navigation.navigate('Accueil'), 3000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
      
      <Text style={styles.statusText}>{status}</Text>
      
      {!driverAvailable && (
        <Text style={styles.errorText}>Veuillez réessayer plus tard</Text>
      )}

      <View style={styles.detailsBox}>
        <Text style={styles.detailText}>Destination: {mockRide.destination}</Text>
        <Text style={styles.detailText}>Chauffeur: {mockRide.driver}</Text>
        <Text style={styles.detailText}>Temps estimé: {mockRide.estimatedTime}</Text>
      </View>

      {isPending && (
        <Text style={styles.timerText}>Temps restant: {formatTime(countdown)}</Text>
      )}

      <View style={styles.buttonGroup}>
        <Button
          title="Actualiser"
          onPress={checkDriverResponse}
          color="#34C759"
          disabled={!isPending}
        />
        
        <Button
          title="Annuler"
          onPress={handleCancel}
          color="#FF3B30"
        />
      </View>
    </View>
  );
};

const HomeScreen = ({ navigation }) => (
  <View style={styles.container}>
    <Button
      title="Chercher un trajet"
      onPress={() => navigation.navigate('Waiting')}
      color="#007AFF"
    />
  </View>
);

const TripScreen = ({ route, navigation }) => (
  <View style={styles.container}>
    <Text style={styles.confirmationText}>Trajet confirmé !</Text>
    <View style={styles.detailsBox}>
      <Text style={styles.detailText}>Destination: {route.params.ride.destination}</Text>
      <Text style={styles.detailText}>Conducteur: {route.params.ride.driver}</Text>
      <Text style={styles.detailText}>Rendez-vous dans: {route.params.ride.estimatedTime}</Text>
    </View>

    <Button
      title="Continuer"
      onPress={() => navigation.navigate('Accueil')}
      color="#007AFF"
      style={styles.continueButton}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5FCFF'
  },
  statusText: {
    fontSize: 20,
    margin: 20,
    fontWeight: '600',
    color: '#333'
  },
  detailsBox: {
    backgroundColor: '#E8F4FD',
    padding: 15,
    borderRadius: 10,
    marginVertical: 15,
    width: '80%'
  },
  detailText: {
    fontSize: 16,
    marginVertical: 5,
    color: '#444'
  },
  timerText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20
  },
  buttonGroup: {
    width: '60%',
    gap: 15
  },
  confirmationText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'green',
    marginBottom: 20
  },
  errorText: {
    color: 'red',
    fontWeight: 'bold',
    marginVertical: 10
  },
  continueButton: {
    marginTop: 30,
    width: '60%'
  }
});

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Accueil">
        <Stack.Screen name="Accueil" component={HomeScreen} />
        <Stack.Screen name="Waiting" component={WaitingScreen} />
        <Stack.Screen name="TripScreen" component={TripScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}