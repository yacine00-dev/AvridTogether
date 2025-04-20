import React, { useState, useEffect } from "react";
import { View, TextInput, Image, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Button } from "react-native-paper";
import axios from "axios";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type RootStackParamList = {
  EditProfileScreen: undefined;
  ProfileScreen: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "EditProfileScreen">;

type User = {
  photo: string;
  name: string;
  age: number;
  phone: string;
  email: string;
  bio: string;
};

const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const [user, setUser] = useState<User>({
    photo: "",
    name: "",
    age: 0,
    phone: "",
    email: "",
    bio: "",
  });

  const userId = "123"; // Replace with actual user ID

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://<YOUR-IP>:<PORT>/api/users/${userId}`);
        setUser(response.data);
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    fetchUser();
  }, []);

  const handleSave = async () => {
    try {
      await axios.put(`http://<YOUR-IP>:<PORT>/api/users/${userId}`, user);
      Alert.alert("Success", "Profile updated successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Profile update failed.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Profile picture */}
      <TouchableOpacity onPress={() => alert("Change profile picture (coming soon)")}>
        <Image source={{ uri: user.photo }} style={styles.profileImage} />
      </TouchableOpacity>

      {/* Editable fields */}
      <TextInput
        style={styles.input}
        value={user.name}
        onChangeText={(text) => setUser({ ...user, name: text })}
        placeholder="Name"
      />
      <TextInput
        style={styles.input}
        value={String(user.age)}
        keyboardType="numeric"
        onChangeText={(text) => setUser({ ...user, age: Number(text) })}
        placeholder="Age"
      />
      <TextInput
        style={styles.input}
        value={user.phone}
        keyboardType="phone-pad"
        onChangeText={(text) => setUser({ ...user, phone: text })}
        placeholder="Phone"
      />
      <TextInput
        style={styles.input}
        value={user.email}
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={(text) => setUser({ ...user, email: text })}
        placeholder="Email"
      />
      <TextInput
        style={[styles.input, styles.bioInput]}
        value={user.bio}
        multiline
        onChangeText={(text) => setUser({ ...user, bio: text })}
        placeholder="Short bio"
      />

      {/* Save Button */}
      <Button
        mode="contained"
        style={[styles.button, styles.navyBlueButton]}
        onPress={handleSave}
      >
        Save Profile
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    backgroundColor: "#ccc",
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
  },
  bioInput: {
    height: 80,
  },
  button: {
    marginTop: 10,
    width: "100%",
  },
  navyBlueButton: {
    backgroundColor: "#191970",
  },
});

export default EditProfileScreen;
