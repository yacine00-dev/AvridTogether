import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, ActivityIndicator } from "react-native";
import { Button } from "react-native-paper";
import axios from "axios";
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  ProfileScreen: undefined;
  HistoricalScreen: undefined;
  CommentScreen: undefined;
  EditProfileScreen: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileScreen'>;

type User = {
  name: string;
  age: number;
  rating: number;
  phone: string;
  email: string;
  bio: string;
  photo: string;
};

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const userId = "123"; // à remplacer si besoin

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://<TON-IP>:<PORT>/api/users/${userId}`);
        setUser(response.data);
      } catch (error) {
        console.error("Erreur lors du chargement du profil :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#191970" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Impossible de charger les informations du profil.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* EN-TÊTE PROFIL */}
      <View style={styles.header}>
        <Image source={{ uri: user.photo }} style={styles.profileImage} />
        <View style={styles.userInfo}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.age}>{user.age} years old</Text>
          <Text style={styles.rating}>⭐ {user.rating}</Text>
        </View>
      </View>

      {/* INFOS */}
      <View style={styles.infoContainer}>
        <Text style={styles.info}>📞 {user.phone}</Text>
        <Text style={styles.info}>📧 {user.email}</Text>
      </View>
      <Text style={styles.bio}>{user.bio}</Text>

      {/* BOUTONS */}
      <Button 
        mode="outlined" 
        labelStyle={styles.navyBlueText} 
        style={styles.outlinedButton} 
        onPress={() => navigation.navigate("HistoricalScreen")}
      >
        Historical
      </Button>
      <Button 
        mode="outlined" 
        labelStyle={styles.navyBlueText} 
        style={styles.outlinedButton} 
        onPress={() => navigation.navigate("CommentScreen")}
      >
        Comment
      </Button>
      <Button 
        mode="outlined" 
        labelStyle={styles.navyBlueText} 
        style={styles.outlinedButton} 
        onPress={() => navigation.navigate("EditProfileScreen")}
      >
        Edit Profile
      </Button>
      <Button 
        mode="outlined" 
        labelStyle={styles.redText} 
        style={styles.deleteButton} 
        onPress={() => alert("Profile Deletion")}
      >
        Delete Profile
      </Button>
      <Button 
        mode="contained" 
        style={styles.logoutButton} 
        onPress={() => alert("Disconnection")}
      >
        Disconnection
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", marginTop: 40, marginBottom: 20 },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginRight: 15 },
  userInfo: { flex: 1 },
  name: { fontSize: 20, fontWeight: "bold" },
  age: { fontSize: 16, color: "gray" },
  rating: { fontSize: 18, marginTop: 5 },
  infoContainer: { marginBottom: 10 },
  info: { fontSize: 16, color: "#333", marginBottom: 5 },
  bio: { fontSize: 14, textAlign: "center", fontStyle: "italic", marginVertical: 10 },
  outlinedButton: { borderColor: "#191970", backgroundColor: "#fff", marginVertical: 5 },
  navyBlueText: { color: "#191970" },
  deleteButton: { borderColor: "red", backgroundColor: "#fff", marginVertical: 5 },
  redText: { color: "red" },
  logoutButton: { backgroundColor: "red", color: "#fff", marginVertical: 5 },
});

export default ProfileScreen;
