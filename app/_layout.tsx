import { useEffect, useRef } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Animated, View, ActivityIndicator, Platform, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { isOnboardingDone } from '@/lib/onboarding';
import { isSupabaseConfigured } from '@/lib/supabase';

const nativeDriver = Platform.OS !== 'web';

export const unstable_settings = { initialRouteName: 'onboarding' };

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function AppNavigator() {
  const { isDark, colors } = useTheme();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!isOnboardingDone()) {
      router.replace('/onboarding');
      return;
    }

    if (isSupabaseConfigured && !user) {
      router.replace('/auth');
      return;
    }

    router.replace('/(tabs)');
  }, [user, loading]);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: Platform.OS === 'web' ? 'fade' : 'slide_from_right',
          animationDuration: Platform.OS === 'web' ? 200 : 280,
        }}
      >
        <Stack.Screen name="auth" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="cbt" options={{ headerShown: false, presentation: 'fullScreenModal', animation: Platform.OS === 'web' ? 'fade' : 'slide_from_bottom' }} />
        <Stack.Screen name="exam-setup" options={{ headerShown: false, presentation: 'modal', animation: Platform.OS === 'web' ? 'fade' : 'slide_from_bottom' }} />
        <Stack.Screen name="subject/[id]" options={{ headerShown: false, animation: Platform.OS === 'web' ? 'fade' : 'slide_from_right' }} />
        <Stack.Screen name="lesson" options={{ headerShown: false, animation: Platform.OS === 'web' ? 'fade' : 'slide_from_right' }} />
      </Stack>
    </>
  );
}

function LoadingScreen() {
  const pulse = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: nativeDriver }),
        Animated.timing(pulse, { toValue: 0.5, duration: 900, useNativeDriver: nativeDriver }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <View style={ls.container}>
      <Animated.View style={[ls.logoRing, { opacity: pulse }]}>
        <View style={ls.logoInner}>
          <ActivityIndicator size="large" color="#00E676" />
        </View>
      </Animated.View>
    </View>
  );
}

export default function RootLayout() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
    Inter_400Regular: require('../assets/fonts/Inter_400Regular.ttf'),
    Inter_500Medium: require('../assets/fonts/Inter_500Medium.ttf'),
    Inter_600SemiBold: require('../assets/fonts/Inter_600SemiBold.ttf'),
    Inter_700Bold: require('../assets/fonts/Inter_700Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: nativeDriver,
      }).start();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return <LoadingScreen />;

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthProvider>
              <AppNavigator />
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </Animated.View>
  );
}

const ls = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#00E676',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0,230,118,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
