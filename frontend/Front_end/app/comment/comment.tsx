import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

const COLORS = {
  primary: "#032354",
  secondary: "#4c78a5",
  text: "#666",
  border: "#ccc",
  white: "#FFFFFF",
  starActive: "#FFD700",
  starInactive: "#C0C0C0"
};

export default function CommentScreen() {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const { driverName = "le chauffeur" } = useLocalSearchParams();

  const handleSubmit = () => {
    console.log({ rating, comment });
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Espace vide en haut pour décaler le contenu */}
      <View style={styles.topSpacer} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header repositionné */}
        <View style={styles.header}>
          <Text style={styles.title}>Évaluez {driverName}</Text>
        </View>

        {/* Évaluation par étoiles avec plus d'espace */}
        <View style={[styles.ratingContainer, { marginTop: 20 }]}>
          <Text style={styles.ratingText}>Your rating :</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity 
                key={star} 
                onPress={() => setRating(star)}
                activeOpacity={0.7}
              >
                <MaterialIcons 
                  name={star <= rating ? "star" : "star-border"} 
                  size={40} 
                  color={star <= rating ? COLORS.starActive : COLORS.starInactive} 
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingValue}>{rating}/5</Text>
        </View>

        {/* Champ de commentaire avec marge augmentée */}
        <View style={[styles.commentContainer, { marginTop: 30 }]}>
          <Text style={styles.commentLabel}>Your comment :</Text>
          <TextInput
            style={styles.commentInput}
            multiline
            numberOfLines={5}
            placeholder="Describe your experience..."
            placeholderTextColor={COLORS.text}
            value={comment}
            onChangeText={setComment}
          />
        </View>

        {/* Bouton décalé vers le bas */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <Text style={styles.submitText}>Submit review</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    
  },
  topSpacer: {
    height: 40, // Espace accru en haut de l'écran
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingBottom: 40, // Plus d'espace en bas
  },
  header: {
    marginBottom: 15,
    alignItems: 'center',
    
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  ratingText: {
    fontSize: 18,
    color: COLORS.primary,
    marginBottom: 15, // Espace augmenté
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10, // Espacement entre les étoiles
  },
  ratingValue: {
    fontSize: 18, // Taille augmentée
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 5,
  },
  commentContainer: {
    marginBottom: 25,
  },
  commentLabel: {
    fontSize: 18,
    color: COLORS.primary,
    marginBottom: 15, // Espace accru
  },
  commentInput: {
    height: 180, // Zone de texte plus grande
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12, // Bordures plus arrondies
    padding: 18, // Padding interne accru
    textAlignVertical: 'top',
    backgroundColor: COLORS.white,
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 22, // Meilleure lisibilité
  },
  buttonContainer: {
    marginTop: 30, // Espace avant le bouton accru
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    elevation: 3, // Ombre légère
  },
  submitText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 18, // Texte légèrement plus grand
  },
});