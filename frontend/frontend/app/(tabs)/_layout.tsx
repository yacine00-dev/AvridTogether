import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function TabsLayout() {
  const navigation = useNavigation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#052659',
        tabBarInactiveTintColor: '#7DA0CA',
        tabBarStyle: styles.tabBar, headerShown: false
      }}
    >
      {/* Onglet Accueil */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={26} color={color} />
          )
        }}
      />

      {/* Onglet Wallet */}
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="account-balance-wallet" size={26} color={color} />
          )
        }}
      />

      {/* Bouton central  */}
      <Tabs.Screen
        name="post" 
        options={{
          title: '',
          
          tabBarButton: () => (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={() => navigation.navigate('new-ride/index')}
                style={styles.centralButton}
              >
                <MaterialIcons name="add" size={36} color="white" />
              </TouchableOpacity>
            </View>
          )
        }}
      />

      {/* Onglet Historique */}
      <Tabs.Screen
        name="history"
        options={{
          title: 'Historique',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="history" size={26} color={color} />
          )
        }}
      />

      {/* Onglet Profil */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person" size={26} color={color} />
          )
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 60,
    paddingBottom: 5,
    backgroundColor: 'white',
    borderTopColor: '#F8FAFC',
    position: 'relative',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
    zIndex: 999,
  },
  centralButton: {
    backgroundColor: '#052659',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderColor: '#F8FAFC',
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  }
});