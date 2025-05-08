import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import * as Location from 'expo-location';

const COLORS = {
  primary: "#032354",
  secondary: "#4c78a5",
  text: "#666",
  border: "#ccc",
  white: "#FFFFFF",
  inactive: "#7DA0CA",
};

export default function WalletScreen() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [address, setAddress] = useState<string>('Localisation en cours...');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission de localisation refusée');
        return;
      }
      await refreshLocation();
    })();
  }, []);

  const updateAddress = async (lat: number, lon: number) => {
    try {
      const geocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
      if (geocode.length > 0) {
        const parts = [];
        if (geocode[0].name) parts.push(geocode[0].name);
        if (geocode[0].city) parts.push(geocode[0].city);
        setAddress(parts.join(', ') || 'Adresse non disponible');
      }
    } catch (e) {
      console.error('Erreur géocodage:', e);
    }
  };

  const refreshLocation = async () => {
    setIsRefreshing(true);
    try {
      const pos = await Location.getCurrentPositionAsync({});
      setLocation(pos);
      await updateAddress(pos.coords.latitude, pos.coords.longitude);
    } catch (e) {
      setErrorMsg('Actualisation impossible');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}> 
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const handleAction = (action: string) => {
    switch(action) {
      case 'Top up':
       // router.push('/wallet/topup');
        break;
      case 'Send':
       // router.push('/wallet/send');
        break;
      case 'Withdraw':
       // router.push('/wallet/withdraw');
        break;
      default:
        Alert.alert('Action', `${action} selected`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />

      {/* Header with dynamic location */}
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <Ionicons name="location-sharp" size={25} color={COLORS.primary} />
          <View style={styles.locationTextContainer}>
            <Text style={styles.locationLabel}>MA POSITION</Text>
            <Text 
              style={styles.location}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {errorMsg || address}
            </Text>
          </View>
          <TouchableOpacity onPress={refreshLocation} disabled={isRefreshing} style={{ marginLeft: 10 }}>
            {isRefreshing ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Ionicons name="reload" size={24} color={COLORS.primary} />
            )}
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => router.push('/profile')}>
          <Image 
            source={
              user?.user?.user_pic 
                ? { uri: `https://testat-hsrz.onrender.com${user.user.user_pic}`, cache: 'reload' }
                : require("../../assets/images/photo_profil.jpg")
            }
            style={styles.profileImage}
            defaultSource={require("../../assets/images/photo_profil.jpg")}
            onError={(error) => console.log('Erreur de chargement image:', error.nativeEvent.error)}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Balance */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceTitle}>Current balance</Text>
          <Text style={styles.balanceAmount}>{balance.toFixed(2)} DZD</Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          {['Top up', 'Send', 'Withdraw'].map((action, i) => (
            <TouchableOpacity 
              key={i} 
              style={styles.actionButton}
              onPress={() => handleAction(action)}
            >
              <View style={styles.buttonContent}>
                <MaterialIcons
                  name={
                    action === 'Top up' ? 'add-circle-outline' :
                    action === 'Send' ? 'send' : 'account-balance'
                  }
                  size={28}
                  color={COLORS.primary}
                />
                <Text style={styles.actionText}>{action}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={COLORS.border} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Transactions */}
        <View style={styles.transactionsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transactions</Text>
            <TouchableOpacity >
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

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 45,
    marginTop: 10,
  },
  locationContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1, 
    marginRight: 15 
  },
  locationTextContainer: { 
    marginLeft: 12, 
    flex: 1 
  },
  locationLabel: { 
    fontSize: 13, 
    color: COLORS.text, 
    fontWeight: '500' 
  },
  location: { 
    fontSize: 16, 
    color: COLORS.primary, 
    fontWeight: '600', 
    maxWidth: '90%' 
  },
  profileImage: { 
    width: 45, 
    height: 45, 
    borderRadius: 23, 
    borderWidth: 2, 
    borderColor: COLORS.primary 
  },
  balanceContainer: { padding: 20, alignItems: 'center', marginTop: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 30 },
  balanceTitle: { fontSize: 18, color: COLORS.text, marginBottom: 8 },
  balanceAmount: { fontSize: 32, fontWeight: 'bold', color: COLORS.primary },
  actionsContainer: { paddingHorizontal: 20, marginTop: 15 },
  actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingVertical: 18, paddingHorizontal: 15, marginVertical: 6, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, backgroundColor: COLORS.white },
  buttonContent: { flexDirection: 'row', alignItems: 'center' },
  actionText: { marginLeft: 12, fontSize: 16, color: COLORS.primary, fontWeight: '500' },
  transactionsContainer: { margin: 20, marginTop: 25 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 25, fontWeight: 'bold', color: COLORS.primary },
  viewAll: { color: COLORS.secondary, fontWeight: '500', textDecorationLine: 'underline' },
  emptyCard: { alignItems: 'center', padding: 5, borderRadius: 12, backgroundColor: COLORS.white },
  cardImage: { width: 300, height: 300, resizeMode: 'contain', marginBottom: 5 },
  emptyTitle: { fontSize: 16, color: COLORS.text, fontWeight: '600', marginBottom: 8 },
  emptySubText: { fontSize: 14, color: COLORS.text, textAlign: 'center', lineHeight: 20 },
});
