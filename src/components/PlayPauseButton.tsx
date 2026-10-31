import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, View } from 'react-native';
import type { PlaybackStatus } from '../audio/PlayerProvider';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from './Icon';

type Props = {
  status: PlaybackStatus;
  onPress: () => void;
  size?: number;
  variant?: 'primary' | 'plain';
};

/** Play/Pause with a cross-fade and scale between icons, plus a spinner while loading. */
export function PlayPauseButton({ status, onPress, size = 72, variant = 'primary' }: Props) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const isPlayingIntent = status === 'playing' || status === 'buffering';
  const isBusy = status === 'loading' || status === 'buffering';
  const anim = useRef(new Animated.Value(isPlayingIntent ? 1 : 0)).current;

  useEffect(() => {
    const to = isPlayingIntent ? 1 : 0;
    if (reduced) {
      anim.setValue(to);
      return;
    }
    Animated.spring(anim, { toValue: to, useNativeDriver: true, speed: 22, bounciness: 6 }).start();
  }, [isPlayingIntent, reduced, anim]);

  const isPrimary = variant === 'primary';
  const iconColor = isPrimary ? colors.onPrimary : colors.icon;
  const iconSize = Math.round(size * 0.42);
  const label = status === 'loading' ? 'लोड हो रहा है' : isPlayingIntent ? 'रोकें' : 'चलाएं';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ busy: isBusy }}
      hitSlop={6}
      style={({ pressed }) => [
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: isPrimary ? (pressed ? colors.primaryPressed : colors.primary) : 'transparent',
          transform: [{ scale: pressed ? 0.95 : 1 }],
        },
        isPrimary && { shadowColor: colors.primary, shadowOpacity: 0.35, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
      ]}>
      <Animated.View
        style={[
          styles.layer,
          { opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }), transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.6] }) }] },
        ]}>
        <View style={{ marginLeft: iconSize * 0.12 }}>
          <Icon name="play" size={iconSize} color={iconColor} />
        </View>
      </Animated.View>
      <Animated.View
        style={[
          styles.layer,
          { opacity: anim, transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] },
        ]}>
        <Icon name="pause" size={iconSize} color={iconColor} />
      </Animated.View>
      {isBusy ? (
        <View style={styles.layer} pointerEvents="none">
          <ActivityIndicator size={size > 56 ? 'large' : 'small'} color={isPrimary ? colors.onPrimary : colors.primary} style={styles.spinner} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  layer: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  spinner: { transform: [{ scale: 1.55 }], opacity: 0.55 },
});
