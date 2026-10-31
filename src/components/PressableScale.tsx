import React, { useRef } from 'react';
import { Animated, Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  /** Scale while pressed. */
  to?: number;
};

/**
 * Pressable that springs down slightly while pressed, for tactile cards and
 * buttons. The style goes on the pressable itself, so flex layout still works.
 */
export function PressableScale({ style, to = 0.97, onPressIn, onPressOut, ...rest }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const spring = (v: number) =>
    Animated.spring(scale, { toValue: v, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  return (
    <AnimatedPressable
      {...rest}
      style={[style, { transform: [{ scale }] }]}
      onPressIn={e => {
        spring(to);
        onPressIn?.(e);
      }}
      onPressOut={e => {
        spring(1);
        onPressOut?.(e);
      }}
    />
  );
}
