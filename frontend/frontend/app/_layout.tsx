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
        name="home" 
        options={{ 
          presentation: 'modal',
          headerShown: false
        }} 
      />
      <Stack.Screen 
  name="settings" 
  options={{ 
    headerShown: true,
    title: 'Paramètres'
  }} 
/>
    </Stack>
  
  );
}