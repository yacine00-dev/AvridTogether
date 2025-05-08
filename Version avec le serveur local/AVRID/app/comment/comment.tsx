import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { 
  ActivityIndicator, 
  SafeAreaView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useAuth } from '../../context/AuthContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE = 'http://10.0.2.2:8000/api/';

const COLORS = {
  primary: "#032354",
  secondary: "#4c78a5",
  text: "#666",
  border: "#ccc",
  white: "#FFFFFF",
};

export default function CommentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!rating) {
      Alert.alert("Erreur", "Veuillez donner une note");
      return;
    }

    if (!comment.trim()) {
      Alert.alert("Erreur", "Veuillez écrire un commentaire");
      return;
    }

    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (!token) {
        Alert.alert("Erreur", "Vous devez être connecté pour commenter");
        return;
      }

      // D'abord, récupérer l'email de l'utilisateur à partir de son ID
      const userResponse = await axios.get(`${API_BASE}user/id/${params.received_user}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('User response:', userResponse.data);

      const userEmail = userResponse.data.user.email;
      if (!userEmail) {
        throw new Error("Email utilisateur non trouvé");
      }

      // Ensuite, envoyer le commentaire avec l'email
      const url = `${API_BASE}user/comments/creatmail/${userEmail}/`;
      console.log('Sending comment to URL:', url);

      const response = await axios.post(
        url,
        {
          rating: rating,
          comment: comment,
          title: `Note ${rating}/5`,
          received_user: parseInt(params.received_user as string)
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Commentaire envoyé:', response.data);
      Alert.alert(
        "Succès",
        "Votre commentaire a été envoyé avec succès",
        [
          {
            text: "OK",
            onPress: () => router.back()
          }
        ]
      );
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du commentaire:', error.response?.data || error.message);
      Alert.alert(
        "Erreur",
        error.response?.data?.message || "Impossible d'envoyer le commentaire. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Évaluer le trajet</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          <Text style={styles.label}>Note</Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={styles.starButton}
              >
                <MaterialIcons
                  name={star <= rating ? "star" : "star-border"}
                  size={32}
                  color={star <= rating ? "#FFD700" : COLORS.text}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Commentaire</Text>
          <TextInput
            style={styles.input}
            multiline
            numberOfLines={4}
            placeholder="Partagez votre expérience..."
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitButtonText}>Envoyer</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  starButton: {
    padding: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});