import { useEffect, useRef } from 'react';
import { Animated, Platform, ViewStyle } from 'react-native';

const nativeDriver = Platform.OS !== 'web';

type Props = {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  slideFrom?: 'bottom' | 'top' | 'none';
  distance?: number;
  style?: ViewStyle | ViewStyle[];
};

export function FadeInView({
  children,
  delay = 0,
  duration = 400,
  slideFrom = 'bottom',
  distance = 24,
  style,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(slideFrom === 'top' ? -distance : distance)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: nativeDriver,
      }),
      ...(slideFrom !== 'none'
        ? [
            Animated.timing(translate, {
              toValue: 0,
              duration,
              delay,
              useNativeDriver: nativeDriver,
            }),
          ]
        : []),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: slideFrom !== 'none' ? [{ translateY: translate }] : [],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
