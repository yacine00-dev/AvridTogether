import React, { useState } from "react";
import { View, TextInput, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Button } from "react-native-paper";

const EditProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState({
    photo: require("../../../assets/images.jpeg"), // Replace with a local image
    name: "Sara Hocine",
    age: 28, // Must be a number
    phone: "+213 4 76 80 78",
    email: "sarahoc@avid.com",
    bio: "I am a passionate driver...",
  });

  const handleSave = () => {
    alert("Profile updated!");
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Change profile picture */}
      <TouchableOpacity onPress={() => alert("Change profile picture")}>
        <Image source={user.photo} style={styles.profileImage} />
      </TouchableOpacity>

      {/* Editable fields */}
      <TextInput style={styles.input} value={user.name} onChangeText={(text) => setUser({ ...user, name: text })} />
      <TextInput style={styles.input} value={String(user.age)} keyboardType="numeric" onChangeText={(text) => setUser({ ...user, age: Number(text) })} />
      <TextInput style={styles.input} value={user.phone} onChangeText={(text) => setUser({ ...user, phone: text })} />
      <TextInput style={styles.input} value={user.email} onChangeText={(text) => setUser({ ...user, email: text })} />
      <TextInput style={[styles.input, styles.bioInput]} value={user.bio} multiline onChangeText={(text) => setUser({ ...user, bio: text })} />

      {/* Save Button */}
      <Button mode="contained" style={[styles.button, styles.navyBlueButton]} onPress={handleSave}>
        Save
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
  },
  navyBlueButton: {
    backgroundColor: "#191970", // Navy blue
  },
});

export default EditProfileScreen;

