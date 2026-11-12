import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ActivityIndicator, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { TrainingProvider } from '@/context/TrainingContext';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import colors from '@/constants/colors';

SplashScreen.preventAutoHideAsync();
const queryClient = new QueryClient();

function RootLayoutNav() {
  return <><StatusBar style="light" /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.dark.background } }}>
    <Stack.Screen name="(tabs)" />
    <Stack.Screen name="workout" options={{ gestureEnabled: false }} />
    <Stack.Screen name="exercise/[id]" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
    <Stack.Screen name="+not-found" />
  </Stack></>;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  useEffect(() => { if (fontsLoaded || fontError) void SplashScreen.hideAsync(); }, [fontsLoaded, fontError]);
  if (!fontsLoaded && !fontError) return <View style={{ flex: 1, backgroundColor: colors.dark.background, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
    <ActivityIndicator color={colors.dark.primary} />
    <Text style={{ color: colors.dark.foreground, fontSize: 18, fontWeight: '800', letterSpacing: 2 }}>ПОДХОД</Text>
    <Text style={{ color: colors.dark.mutedForeground, fontSize: 11 }}>Готовим тренировочный журнал</Text>
  </View>;
  return <GestureHandlerRootView style={{ flex: 1 }}><KeyboardProvider><SafeAreaProvider><ErrorBoundary><QueryClientProvider client={queryClient}><TrainingProvider><RootLayoutNav /></TrainingProvider></QueryClientProvider></ErrorBoundary></SafeAreaProvider></KeyboardProvider></GestureHandlerRootView>;
}
