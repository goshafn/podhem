import React from 'react';
import { Platform, StyleSheet, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Tabs } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { SymbolView } from 'expo-symbols';
import { useColors } from '@/hooks/useColors';

function NativeTabLayout() {
  return <NativeTabs>
    <NativeTabs.Trigger name="index"><NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" /><NativeTabs.Trigger.Label>Сегодня</NativeTabs.Trigger.Label></NativeTabs.Trigger>
    <NativeTabs.Trigger name="library"><NativeTabs.Trigger.Icon sf={{ default: 'dumbbell', selected: 'dumbbell.fill' }} md="fitness_center" /><NativeTabs.Trigger.Label>Упражнения</NativeTabs.Trigger.Label></NativeTabs.Trigger>
    <NativeTabs.Trigger name="programs"><NativeTabs.Trigger.Icon sf={{ default: 'square.grid.2x2', selected: 'square.grid.2x2.fill' }} md="view_list" /><NativeTabs.Trigger.Label>Планы</NativeTabs.Trigger.Label></NativeTabs.Trigger>
    <NativeTabs.Trigger name="history"><NativeTabs.Trigger.Icon sf={{ default: 'calendar', selected: 'calendar' }} md="history" /><NativeTabs.Trigger.Label>История</NativeTabs.Trigger.Label></NativeTabs.Trigger>
    <NativeTabs.Trigger name="progress"><NativeTabs.Trigger.Icon sf={{ default: 'chart.xyaxis.line', selected: 'chart.xyaxis.line' }} md="show_chart" /><NativeTabs.Trigger.Label>Прогресс</NativeTabs.Trigger.Label></NativeTabs.Trigger>
  </NativeTabs>;
}
function ClassicTabLayout() {
  const colors = useColors();
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const isDark = scheme === 'dark';
  const isIOS = Platform.OS === 'ios';
  const isWeb = Platform.OS === 'web';
  return <Tabs screenOptions={{
    headerShown: false,
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.mutedForeground,
    tabBarStyle: { position: 'absolute', backgroundColor: isIOS ? 'transparent' : colors.background, borderTopWidth: isWeb ? 1 : 0, borderTopColor: colors.border, elevation: 0, paddingBottom: isWeb ? 0 : insets.bottom, height: isWeb ? 84 : 62 + insets.bottom },
    tabBarBackground: () => isIOS ? <BlurView intensity={95} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} /> : isWeb ? <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} /> : null,
  }}>
    <Tabs.Screen name="index" options={{ title: 'Сегодня', tabBarIcon: ({ focused }) => isIOS ? <SymbolView name={focused ? 'house.fill' : 'house'} tintColor={focused ? colors.primary : colors.mutedForeground} size={21} /> : <Feather name="home" size={20} color={focused ? colors.primary : colors.mutedForeground} /> }} />
    <Tabs.Screen name="library" options={{ title: 'Упражнения', tabBarIcon: ({ focused }) => <Feather name="activity" size={20} color={focused ? colors.primary : colors.mutedForeground} /> }} />
    <Tabs.Screen name="programs" options={{ title: 'Планы', tabBarIcon: ({ focused }) => <Feather name="grid" size={20} color={focused ? colors.primary : colors.mutedForeground} /> }} />
    <Tabs.Screen name="history" options={{ title: 'История', tabBarIcon: ({ focused }) => <Feather name="calendar" size={20} color={focused ? colors.primary : colors.mutedForeground} /> }} />
    <Tabs.Screen name="progress" options={{ title: 'Прогресс', tabBarIcon: ({ focused }) => <Feather name="trending-up" size={20} color={focused ? colors.primary : colors.mutedForeground} /> }} />
  </Tabs>;
}
export default function TabLayout() { return isLiquidGlassAvailable() ? <NativeTabLayout /> : <ClassicTabLayout />; }
