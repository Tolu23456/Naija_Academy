import { useEffect, useRef } from 'react';
import { View, Animated, Platform, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

const nativeDriver = Platform.OS !== 'web';

type Props = {
  width?: number | string;
  height?: number;
  radius?: number;
  style?: ViewStyle;
};

export function SkeletonBox({ width = '100%', height = 16, radius = 8, style }: Props) {
  const { colors } = useTheme();
  const anim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: nativeDriver }),
        Animated.timing(anim, { toValue: 0.4, duration: 700, useNativeDriver: nativeDriver }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius: radius,
          backgroundColor: colors.surfaceBorder,
          opacity: anim,
        },
        style,
      ]}
    />
  );
}

export function StatCardSkeleton() {
  const { colors } = useTheme();
  return (
    <View style={[sk.statCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
      <SkeletonBox width={40} height={40} radius={12} style={{ marginBottom: 8 }} />
      <SkeletonBox width={48} height={22} radius={6} style={{ marginBottom: 6 }} />
      <SkeletonBox width={56} height={12} radius={4} />
    </View>
  );
}

export function ListRowSkeleton({ rows = 3 }: { rows?: number }) {
  const { colors } = useTheme();
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={[sk.listRow, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <SkeletonBox width={44} height={44} radius={10} />
          <View style={{ flex: 1, gap: 6 }}>
            <SkeletonBox height={14} radius={4} width="70%" />
            <SkeletonBox height={12} radius={4} width="50%" />
          </View>
        </View>
      ))}
    </>
  );
}

const sk = StyleSheet.create({
  statCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
  },
});
