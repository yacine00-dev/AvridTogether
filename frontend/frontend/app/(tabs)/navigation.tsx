import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Feather';

// Import Screens
import AnimationScreen from './screens/AnimationScreen';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import WalletScreen from './screens/WalletScreen';
import RechercheScreen from './screens/RechercheScreen';
import HistoryScreen from './screens/HistoryScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const CustomTabBarButton: React.FC<{ children: React.ReactNode; onPress?: () => void }> = ({ children, onPress }) => (
  <TouchableOpacity
    style={{
      top: -20,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 3.5,
      elevation: 5,
    }}
    onPress={onPress}
  >
    <View
      style={{
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#0A2745',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {children}
    </View>
  </TouchableOpacity>
);

// Bottom Tab Navigation (Main App)
function MainApp() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: string = 'circle'; // Icône par défaut pour éviter l'erreur

          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Wallet') iconName = 'credit-card';
          else if (route.name === 'History') iconName = 'bookmark';
          else if (route.name === 'Profile') iconName = 'user';

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarShowLabel: true,
        tabBarStyle: { height: 60 },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen
        name="Recherche"
        component={RechercheScreen}
        options={{
          tabBarButton: (props: any) => (
            <CustomTabBarButton {...props}>
              <Icon name="search" size={28} color="white" />
            </CustomTabBarButton>
          ),
        }}
      />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Root Navigation (Handles initial flow)
export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);

  useEffect(() => {
    async function checkFirstTimeUser() {
      const value = await AsyncStorage.getItem('isFirstTime');
      setIsFirstTime(value === null);
      setIsLoading(false);
    }
    checkFirstTimeUser();
  }, []);

  if (isLoading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Animation" component={AnimationScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      {isFirstTime && <Stack.Screen name="Onboarding" component={OnboardingScreen} />}
      <Stack.Screen name="MainApp" component={MainApp} />
    </Stack.Navigator>
  );
}

