import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
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
        router.push('/wallet/topup');
        break;
      case 'Send':
        router.push('/wallet/send');
        break;
      case 'Withdraw':
        router.push('/wallet/withdraw');
        break;
      default:
        Alert.alert('Action', `${action} selected`);
    }
  };

  const navigateTo = (screen: string) => {
    if (screen !== 'Wallet') {
      router.push(`/${screen.toLowerCase()}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <Ionicons name="location-sharp" size={25} color={COLORS.primary} />
          <View style={styles.locationTextContainer}>
            <Text style={styles.locationLabel}>LOCATION</Text>
            <Text style={styles.location}>46GX58T, Tizi Ouzou</Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => router.push('/profile')}>
          <Image 
            source={user?.photo ? { uri: user.photo } : require('@/assets/images/driver2.png')}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Balance Section */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceTitle}>Current balance</Text>
          <Text style={styles.balanceAmount}>{balance.toFixed(2)} DZD</Text>
        </View>

        {/* Actions Section */}
        <View style={styles.actionsContainer}>
          {['Top up', 'Send', 'Withdraw'].map((action, index) => (
            <TouchableOpacity 
              key={index} 
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
              <MaterialIcons 
                name="chevron-right" 
                size={24} 
                color={COLORS.border} 
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Transactions Section */}
        <View style={styles.transactionsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transactions</Text>
            <TouchableOpacity onPress={() => router.push('/wallet/transactions')}>
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
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
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
  },
  emptyCard: {
    alignItems: 'center',
    padding: 5,
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
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  inactiveText: {
    fontSize: 10,
    color: COLORS.inactive,
    textAlign: 'center',
  },
  activeText: {
    fontSize: 10,
    color: COLORS.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
});