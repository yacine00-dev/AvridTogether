import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';

const WaitingScreen = ({ route }) => {
  const router = useRouter();
  const [status, setStatus] = useState("En attente de confirmation par le chauffeur");
  const [isPending, setIsPending] = useState(true);
  const [countdown, setCountdown] = useState(20);
  const [driverAvailable, setDriverAvailable] = useState(true);
  const [rideConfirmed, setRideConfirmed] = useState(false);
  const [rideDetails, setRideDetails] = useState(null);

  // Simulation de l'ID du trajet sélectionné depuis l'écran des trajets disponibles
  const { rideId } = route.params;

  // Simuler une requête au backend pour récupérer les informations du trajet
  const fetchRideDetails = async (rideId) => {
    try {
      const response = await fetch(`https://example.com/api/rides/${rideId}`);
      const data = await response.json();

      if (data && data.ride) {
        setRideDetails(data.ride);
      } else {
        setStatus("Erreur dans la récupération des informations du trajet");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des détails du trajet:", error);
      setStatus("Erreur lors de la connexion avec le serveur");
    }
  };

  // Simuler la confirmation ou le refus du chauffeur depuis le backend
  const checkDriverResponse = async () => {
    setTimeout(async () => {
      try {
        const response = await fetch(`https://example.com/api/rides/${rideId}/confirmation`);
        const data = await response.json();

        if (data.driverAvailable) {
          setStatus("Confirmé ! Préparation du trajet...");
          setIsPending(false);
          setRideConfirmed(true);
        } else {
          setStatus("Le chauffeur a décliné la demande");
          setIsPending(false);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du chauffeur:", error);
        setStatus("Erreur lors de la vérification du chauffeur");
        setIsPending(false);
      }
    }, 5000);
  };

  useEffect(() => {
    fetchRideDetails(rideId); // Appeler l'API pour récupérer les détails du trajet

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleAutoCancel();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    checkDriverResponse(); // Simuler la réponse du chauffeur

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
            router.push('/'); // Revenir à l'écran d'accueil après annulation
          }
        }
      ]
    );
  };

  const handleAutoCancel = () => {
    setIsPending(false);
    setStatus("Aucune réponse reçue - Annulation automatique");
    setTimeout(() => router.push('/'), 3000);
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

      {rideConfirmed && rideDetails && (
        <View style={styles.detailsBox}>
          <Text style={styles.detailText}>Destination: {rideDetails.destination}</Text>
          <Text style={styles.detailText}>Chauffeur: {rideDetails.driver}</Text>
          <Text style={styles.detailText}>Temps estimé: {rideDetails.estimatedTime}</Text>
        </View>
      )}

      {isPending && !rideConfirmed && (
        <Text style={styles.timerText}>Temps restant: {formatTime(countdown)}</Text>
      )}

      <View style={styles.buttonGroup}>
        {rideConfirmed ? (
          <Button
            title="Revenir à l'accueil"
            onPress={() => router.push('/')} // Retourner à l'accueil
            color="#007AFF"
          />
        ) : (
          <>
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
          </>
        )}
      </View>
    </View>
  );
};

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
  errorText: {
    color: 'red',
    fontWeight: 'bold',
    marginVertical: 10
  },
});

export default WaitingScreen;
