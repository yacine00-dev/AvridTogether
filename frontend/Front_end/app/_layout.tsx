import { Stack, useRouter } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
export default function RootLayout() {
  /*return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

function RootLayoutNav() {
  /*pour la verification
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
*/
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Routes publiques */}
      <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/signup" options={{ headerShown: false }} />
      {/* Routes protégées */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      
      {/* Modals et écrans supplémentaires */}
      <Stack.Screen 
        name="new-ride/index" 
        options={{ presentation: 'modal' }} 
      />
      <Stack.Screen name="comment/comment" />
      <Stack.Screen name="trajet/trajet" />
      <Stack.Screen name="commentaire/CommentScreen" />
      <Stack.Screen name="acceuille/acceuille" />
      <Stack.Screen name="driverRes/DriverReservations" />
      <Stack.Screen name="EditProfile/EditProfile" />
      <Stack.Screen name="wating_passenger/wating_passenger" />
    </Stack>
  );
}