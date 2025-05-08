import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';

export default function Layout() {
  const router = useRouter();

  useEffect(() => {
    // Redirection vers l'écran d'accueil au démarrage
    router.replace('/acceuille');
  }, []);

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="acceuille" />
        <Stack.Screen name="(auth)" />
      </Stack>
    </AuthProvider>
  );
}
