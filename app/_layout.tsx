import { useEffect, useRef, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Animated, Easing, View, Text, Platform, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AdminProvider, useAdmin } from '@/context/AdminContext';
import { isOnboardingDone } from '@/lib/onboarding';
import { isSupabaseConfigured } from '@/lib/supabase';

const nativeDriver = Platform.OS !== 'web';

export const unstable_settings = { initialRouteName: 'onboarding' };

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function AppNavigator() {
  const { isDark, colors } = useTheme();
  const { user, loading } = useAuth();
  const { isAdminVerified } = useAdmin();
  const router = useRouter();
  const [routed, setRouted] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!isOnboardingDone()) {
      router.replace('/onboarding');
    } else if (isAdminVerified) {
      router.replace('/admin');
    } else if (isSupabaseConfigured && !user) {
      router.replace('/auth');
    } else {
      router.replace('/(tabs)');
    }
    // Defer revealing the navigator one frame so the redirect lands
    // before any "initial" route flashes on web.
    requestAnimationFrame(() => setRouted(true));
  }, [user, loading, isAdminVerified]);

  const showLoader = loading || !routed;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
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
        <Stack.Screen name="admin" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="cbt" options={{ headerShown: false, presentation: 'fullScreenModal', animation: Platform.OS === 'web' ? 'fade' : 'slide_from_bottom' }} />
        <Stack.Screen name="exam-setup" options={{ headerShown: false, presentation: 'modal', animation: Platform.OS === 'web' ? 'fade' : 'slide_from_bottom' }} />
        <Stack.Screen name="subject/[id]" options={{ headerShown: false, animation: Platform.OS === 'web' ? 'fade' : 'slide_from_right' }} />
        <Stack.Screen name="lesson" options={{ headerShown: false, animation: Platform.OS === 'web' ? 'fade' : 'slide_from_right' }} />
        <Stack.Screen name="about" options={{ headerShown: false, animation: Platform.OS === 'web' ? 'fade' : 'slide_from_right' }} />
        <Stack.Screen name="help" options={{ headerShown: false, animation: Platform.OS === 'web' ? 'fade' : 'slide_from_right' }} />
        <Stack.Screen name="edit-profile" options={{ headerShown: false, animation: Platform.OS === 'web' ? 'fade' : 'slide_from_right' }} />
      </Stack>

      {/* Overlay loader hides the brief "initial route" flash on web while we
          decide where to send the user. */}
      {showLoader && (
        <View style={StyleSheet.absoluteFillObject}>
          <LoadingScreen />
        </View>
      )}
    </View>
  );
}

function LoadingScreen() {
  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spinLoop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: nativeDriver,
      }),
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: nativeDriver }),
        Animated.timing(pulse, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: nativeDriver }),
      ]),
    );
    const dotLoop = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: 1, duration: 350, easing: Easing.out(Easing.ease), useNativeDriver: nativeDriver }),
          Animated.timing(val, { toValue: 0, duration: 350, easing: Easing.in(Easing.ease), useNativeDriver: nativeDriver }),
          Animated.delay(700 - delay),
        ]),
      );

    spinLoop.start();
    pulseLoop.start();
    const d1 = dotLoop(dot1, 0);
    const d2 = dotLoop(dot2, 150);
    const d3 = dotLoop(dot3, 300);
    d1.start(); d2.start(); d3.start();

    return () => {
      spinLoop.stop();
      pulseLoop.stop();
      d1.stop(); d2.stop(); d3.stop();
    };
  }, []);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const innerScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const haloScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] });
  const haloOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] });

  const dotStyle = (val: Animated.Value) => ({
    opacity: val.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
    transform: [{ translateY: val.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }],
  });

  return (
    <View style={ls.container}>
      <View style={ls.logoStack}>
        <Animated.View
          style={[
            ls.halo,
            { opacity: haloOpacity, transform: [{ scale: haloScale }] },
          ]}
        />
        <Animated.View style={[ls.spinner, { transform: [{ rotate }] }]} />
        <Animated.View style={[ls.logoInner, { transform: [{ scale: innerScale }] }]}>
          <Ionicons name="school" size={40} color="#00E676" />
        </Animated.View>
      </View>

      <Text style={ls.brand}>NaijaAcademy</Text>
      <Text style={ls.tagline}>Learn anything. Pass everything.</Text>

      <View style={ls.dotsRow}>
        <Animated.View style={[ls.dot, dotStyle(dot1)]} />
        <Animated.View style={[ls.dot, dotStyle(dot2)]} />
        <Animated.View style={[ls.dot, dotStyle(dot3)]} />
      </View>
    </View>
  );
}

export default function RootLayout() {
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
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return <LoadingScreen />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AdminProvider>
            <AuthProvider>
              <AppNavigator />
            </AuthProvider>
          </AdminProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const ACCENT = '#00E676';

const ls = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoStack: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  halo: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0,230,118,0.18)',
  },
  spinner: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: 'rgba(0,230,118,0.18)',
    borderTopColor: ACCENT,
    borderRightColor: ACCENT,
  },
  logoInner: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: 'rgba(0,230,118,0.14)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brand: {
    marginTop: 24,
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  tagline: {
    marginTop: 6,
    color: '#8A92A3',
    fontSize: 13,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ACCENT,
  },
});
