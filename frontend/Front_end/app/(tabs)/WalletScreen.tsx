import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Image, ScrollView } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
  primary: "#032354",
  secondary: "#4c78a5",
  text: "#666",
  border: "#ccc",
  white: "#FFFFFF",
};

export default function WalletScreen() {
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    // Logique pour récupérer dynamiquement l'image de profil, remplace par ton API si nécessaire
    const fetchProfileImage = async () => {
      const image = "https://example.com/path/to/profile-image.png"; // Remplacer par l'URL de l'image de profil dynamique
      setProfileImage(image);
    };

    fetchProfileImage();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />

      {/* Header */}
      <View style={styles.header}>
        {/* Conteneur de localisation à gauche */}
        <View style={styles.locationContainer}>
          <Ionicons name="location-sharp" size={25} color={COLORS.primary} />
          <View style={styles.locationTextContainer}>
            <Text style={styles.locationLabel}>LOCATION</Text>
            <Text style={styles.location}>46GX58T, Tizi Ouzou</Text>
          </View>
        </View>

        {/* Photo de profil à droite */}
        <Image 
          source={{ uri: profileImage || "https://example.com/default-profile-image.png" }} // Affiche une image par défaut si pas encore récupérée
          style={styles.profileImage}
        />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceTitle}>Current balance</Text>
          <Text style={styles.balanceAmount}>0.00 DZD</Text>
        </View>

        <View style={styles.actionsContainer}>
          {['Top up', 'Send', 'Withdraw'].map((action, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.actionButton}
              onPress={() => {
                switch(action) {
                  case 'Top up':
                    // Remplacer avec votre logique de navigation ou d'action
                    break;
                  case 'Send':
                    // Remplacer avec votre logique de navigation ou d'action
                    break;
                  case 'Withdraw':
                    // Remplacer avec votre logique de navigation ou d'action
                    break;
                }
              }}
            >
              <View style={styles.buttonContent}>
                <MaterialIcons
                  name={
                    action === 'Top up' ? 'add-circle-outline' :
                    action === 'Send' ? 'send' : 'account-balance'
                  }
                  size={28}
                  color={COLORS.primary}
                  style={styles.icon}
                />
                <Text style={styles.actionText}>{action}</Text>
              </View>
              <MaterialIcons 
                name="chevron-right" 
                size={24} 
                color={COLORS.border} 
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Transactions */}
        <View style={styles.transactionsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.emptyCard}>
            <Image 
              source={require('@/assets/images/Credit-card.png')} 
              style={styles.cardImage}
            />
            <Text style={styles.emptyTitle}>No current transactions.</Text>
            <Text style={styles.emptySubText}>All your activities will be saved here</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.navContainer}>
        <View style={styles.leftGroup}>
          <TouchableOpacity style={styles.navItem}>
            <MaterialIcons name="home" size={26} color="#7DA0CA" />
            <Text style={styles.inactiveText}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.navItem, { marginLeft: 30 }]}>
            <MaterialIcons name="account-balance-wallet" size={26} color="#052659" />
            <Text style={styles.activeText}>Wallet</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.centralButton}>
          <MaterialIcons name="add" size={36} color="white" />
        </TouchableOpacity>

        <View style={styles.rightGroup}>
          <TouchableOpacity style={[styles.navItem, { marginRight: 30 }]}>
            <MaterialIcons name="history" size={26} color="#7DA0CA" />
            <Text style={styles.inactiveText}>History</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem}>
            <MaterialIcons name="person" size={26} color="#7DA0CA" />
            <Text style={styles.inactiveText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    backgroundColor: COLORS.white,
    paddingTop: 35,
    marginTop: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center', 
  },
  locationTextContainer: {
    marginLeft: 8,
  },
  locationLabel: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  location: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  balanceContainer: {
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 30,
  },
  balanceTitle: {
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginTop: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 18,
    paddingHorizontal: 15,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  actionText: {
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
  },
  icon: {
    marginRight: 5,
  },
  transactionsContainer: {
    margin: 20,
    marginTop: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  viewAll: {
    color: COLORS.secondary,
    fontWeight: '500',
    textDecorationLine: 'underline',
    textDecorationColor: COLORS.secondary,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 5,
    borderWidth: 1,
    borderColor: COLORS.white,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  cardImage: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    marginBottom: 5,
  },
  emptyTitle: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 20,
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 70,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    backgroundColor: 'white',
    position: 'relative',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '40%',
    paddingLeft: 10,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '40%',
    justifyContent: 'flex-end',
    paddingRight: 10,
  },
  navItem: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  centralButton: {
    position: 'absolute',
    left: '50%',
    bottom: 20,
    transform: [{ translateX: -28 }],
    backgroundColor: COLORS.primary,
    width: 55,
    height: 55,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactiveText: {
    fontSize: 10,
    color: '#7DA0CA',
    textAlign: 'center',
  },
  activeText: {
    fontSize: 10,
    color: '#052659',
    textAlign: 'center',
  },
});
