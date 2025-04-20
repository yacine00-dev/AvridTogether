import { Stack, useRouter } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

function RootLayoutNav() {
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

  if (isLoading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Routes publiques */}
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      
      {/* Routes protégées */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      
      {/* Modals et écrans supplémentaires */}
      <Stack.Screen 
        name="new-ride/index" 
        options={{ presentation: 'modal' }} 
      />
      <Stack.Screen name="comment/comment" />
      <Stack.Screen name="trajet/trajet" />
    </Stack>
  );
}