import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Button } from "react-native-paper";

const ProfileScreen = ({ navigation }) => {
  const user = {
    photo: require("../../../assets/images.jpeg"), // Replace with a local image
    name: "Sara Hocine",
    age: 28,
    rating: 4.5,
    phone: "+213 4 76 80 78",
    email: "sarahoc@avid.com",
    bio: "I am a passionate driver and love sharing my rides with friendly people!",
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      {/* Header with Image and Info */}
      <View style={styles.header}>
        <Image source={user.photo} style={styles.profileImage} />
        <View style={styles.userInfo}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.age}>{user.age} years old</Text>
          <Text style={styles.rating}>⭐ {user.rating}</Text>
        </View>
      </View>

      {/* Personal Information */}
      <View style={styles.infoContainer}>
        <Text style={styles.info}>📞 {user.phone}</Text>
        <Text style={styles.info}>📧 {user.email}</Text>
      </View>
      <Text style={styles.bio}>{user.bio}</Text>

      {/* Buttons */}
      <Button 
        mode="outlined" 
        labelStyle={styles.navyBlueText} 
        style={styles.outlinedButton} 
        onPress={() => alert("View Historical")}
      >
        Historical
      </Button>
      <Button 
        mode="outlined" 
        labelStyle={styles.navyBlueText} 
        style={styles.outlinedButton} 
        onPress={() => alert("View Comments")}
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
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    padding: 10,
  },
  backText: {
    fontSize: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 15, // Pushes text to the right of the image
  },
  userInfo: {
    flex: 1, // Takes the remaining space
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
  },
  age: {
    fontSize: 16,
    color: "gray",
  },
  rating: {
    fontSize: 18,
    marginTop: 5,
  },
  infoContainer: {
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  bio: {
    fontSize: 14,
    textAlign: "center",
    fontStyle: "italic",
    marginVertical: 10,
  },
  outlinedButton: {
    borderColor: "#191970", // Navy blue border
    backgroundColor: "#fff",
    marginVertical: 5,
  },
  navyBlueText: {
    color: "#191970", // Navy blue text
  },
  deleteButton: {
    borderColor: "red",
    backgroundColor: "#fff",
    marginVertical: 5,
  },
  redText: {
    color: "red",
  },
  logoutButton: {
    backgroundColor: "red",
    color: "#fff",
    marginVertical: 5,
  },
});

export default ProfileScreen;


