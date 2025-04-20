import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { Button } from "react-native-paper";
import { useAuth } from '../../context/AuthContext';
import { Redirect, router } from "expo-router";

const ProfileScreen = () => {
  const { user: authUser, isLoading, logout, updateUser } = useAuth();
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#191970" />
      </View>
    );
  }

  if (!authUser) {
    return <Redirect href="/login" />;
  }

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      Alert.alert("Error", "Failed to logout");
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              setProfileLoading(true);
              // Ajoutez ici l'appel API pour supprimer le compte
              // await axios.delete(`/api/users/${authUser.id}`);
              await logout();
              router.replace('/login');
            } catch (err) {
              Alert.alert("Error", "Failed to delete account");
            } finally {
              setProfileLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {profileLoading ? (
        <ActivityIndicator size="large" color="#191970" />
      ) : (
        <>
          {/* EN-TÊTE PROFIL */}
          <View style={styles.header}>
            <Image
              source={authUser.photo 
                ? { uri: authUser.photo } 
                : require('../../assets/images/Ellipse.png')
              }
              style={styles.profileImage}
            />
            <View style={styles.userInfo}>
              <Text style={styles.name}>{authUser.name}</Text>
              {authUser.age && (
                <Text style={styles.age}>{authUser.age} years old</Text>
              )}
              {/* Exemple de rating - à adapter selon votre logique */}
              <Text style={styles.rating}>⭐ 4.8</Text>
            </View>
          </View>

          {/* INFOS */}
          <View style={styles.infoContainer}>
            {authUser.phone && (
              <Text style={styles.info}>📞 {authUser.phone}</Text>
            )}
            <Text style={styles.info}>📧 {authUser.email}</Text>
          </View>
          {authUser.bio && (
            <Text style={styles.bio}>{authUser.bio}</Text>
          )}

          {/* BOUTONS */}
          <Button
            mode="outlined"
            labelStyle={styles.navyBlueText}
            style={styles.outlinedButton}
            onPress={() => router.push('/history')}
          >
            Historical
          </Button>
          <Button
            mode="outlined"
            labelStyle={styles.navyBlueText}
            style={styles.outlinedButton}
            onPress={() => router.push('/commentaire/CommentScreen')}
          >
            Comments
          </Button>
          <Button
            mode="outlined"
            labelStyle={styles.navyBlueText}
            style={styles.outlinedButton}
            onPress={() => router.push('/EditProfile/EditProfile')}
          >
            Edit Profile
          </Button>
          <Button
            mode="outlined"
            labelStyle={styles.redText}
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
          >
            Delete Profile
          </Button>
          <Button
            mode="contained"
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            Disconnect
          </Button>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff", justifyContent: "center" },
  header: { flexDirection: "row", alignItems: "center", marginTop: 40, marginBottom: 20 },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginRight: 15 },
  userInfo: { flex: 1 },
  name: { fontSize: 20, fontWeight: "bold" },
  age: { fontSize: 16, color: "gray" },
  rating: { fontSize: 18, marginTop: 5 },
  infoContainer: { marginBottom: 10 },
  info: { fontSize: 16, color: "#333", marginBottom: 5 },
  bio: { fontSize: 14, textAlign: "center", fontStyle: "italic", marginVertical: 10 },
  errorText: { fontSize: 16, color: "red", textAlign: "center", marginBottom: 20 },
  outlinedButton: { borderColor: "#191970", backgroundColor: "#fff", marginVertical: 5 },
  navyBlueText: { color: "#191970" },
  deleteButton: { borderColor: "red", backgroundColor: "#fff", marginVertical: 5 },
  redText: { color: "red" },
  logoutButton: { backgroundColor: "red", marginVertical: 5 },
});

export default ProfileScreen;