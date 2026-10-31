import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, ViewStyle } from 'react-native';
import { useReducedMotion } from '../hooks/useReducedMotion';

type Props = {
  children: React.ReactNode;
  /** Stagger index: each step delays the entrance by 70ms. */
  index?: number;
  style?: StyleProp<ViewStyle>;
};

/** Fades and lifts its children in once on mount. Respects reduce-motion. */
export function FadeInView({ children, index = 0, style }: Props) {
  const reduced = useReducedMotion();
  const v = useRef(new Animated.Value(reduced ? 1 : 0)).current;

  useEffect(() => {
    if (reduced) {
      v.setValue(1);
      return;
    }
    Animated.timing(v, {
      toValue: 1,
      duration: 480,
      delay: Math.min(index, 8) * 70,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [index, reduced, v]);

  return (
    <Animated.View
      style={[{ opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }] }, style]}>
      {children}
    </Animated.View>
  );
}
