import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useReducedMotion } from '../hooks/useReducedMotion';

type Props = { color: string; active: boolean; size?: number };

/** Three small equaliser bars. Animated while playing, static when paused or with reduced motion. */
export function PlayingIndicator({ color, active, size = 14 }: Props) {
  const reduced = useReducedMotion();
  const bars = useRef([0, 1, 2].map(() => new Animated.Value(0.4))).current;

  useEffect(() => {
    if (!active || reduced) {
      bars.forEach(b => b.setValue(active ? 0.7 : 0.4));
      return;
    }
    const loops = bars.map((b, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(b, { toValue: 1, duration: 380 + i * 90, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(b, { toValue: 0.3, duration: 380 + i * 90, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]),
      ),
    );
    loops.forEach(l => l.start());
    return () => loops.forEach(l => l.stop());
  }, [active, reduced, bars]);

  return (
    <View style={[styles.row, { height: size, gap: size / 7 }]} accessible={false}>
      {bars.map((b, i) => (
        <Animated.View
          key={i}
          style={{
            width: size / 5,
            height: size,
            borderRadius: size / 10,
            backgroundColor: color,
            transform: [{ scaleY: b }],
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end' },
});
