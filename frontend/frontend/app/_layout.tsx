import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="(tabs)" 
        options={{  headerShown: false}} 
      />
      <Stack.Screen 
        name="new-ride/index" 
        options={{ 
          presentation: 'modal',
          headerShown: false
        }} 
      />
      
      <Stack.Screen 
        name="comment/comment" 
        options={{ 
          headerShown: false, // Masquer le header
      
        }} 
      />

<Stack.Screen 
        name="trajet/trajet" 
        options={{
          title: 'Résultats de recherche',
          headerShown: false, // Afficher un header pour cette page
          headerBackTitle: 'Retour'
        }}
      />
    </Stack>
  
  );
}