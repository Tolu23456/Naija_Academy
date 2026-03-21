import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Fonts } from '@/constants/theme';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    let mounted = true;
    let interval: ReturnType<typeof setInterval> | null = null;

    async function checkNetwork() {
      if (Platform.OS === 'web') {
        if (mounted) setIsOffline(!navigator.onLine);
        return;
      }
      try {
        const Network = await import('expo-network');
        const state = await Network.getNetworkStateAsync();
        if (mounted) {
          setIsOffline(!state.isConnected || !state.isInternetReachable);
        }
      } catch {
        // fallback: simple fetch probe
        try {
          const ctrl = new AbortController();
          const tid  = setTimeout(() => ctrl.abort(), 3000);
          await fetch('https://www.google.com/generate_204', { signal: ctrl.signal, method: 'HEAD' });
          clearTimeout(tid);
          if (mounted) setIsOffline(false);
        } catch {
          if (mounted) setIsOffline(true);
        }
      }
    }

    checkNetwork();

    if (Platform.OS === 'web') {
      const handleOnline  = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        mounted = false;
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    } else {
      interval = setInterval(checkNetwork, 15000);
      return () => {
        mounted = false;
        if (interval) clearInterval(interval);
      };
    }
  }, []);

  if (!isOffline) return null;

  return (
    <View style={styles.banner}>
      <Ionicons name="cloud-offline-outline" size={15} color="#fff" />
      <Text style={styles.text}>No internet — some features may not work</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#c0392b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  text: {
    color: '#fff',
    fontSize: 12,
    fontFamily: Fonts.medium,
  },
});
