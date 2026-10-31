import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';

/** Line-art mandala used as a quiet watermark behind headers and the player. */
export function Mandala({ size, color, opacity = 0.14 }: { size: number; color: string; opacity?: number }) {
  const petals = Array.from({ length: 16 }, (_, i) => i * 22.5);
  return (
    <Svg width={size} height={size} viewBox="-50 -50 100 100" opacity={opacity} pointerEvents="none">
      {[46, 38, 24, 10].map(r => (
        <Circle key={r} cx={0} cy={0} r={r} stroke={color} strokeWidth={0.5} fill="none" />
      ))}
      {petals.map(a => (
        <G key={a} rotation={a}>
          <Path d="M0 -24 C 5 -31, 5 -38, 0 -46 C -5 -38, -5 -31, 0 -24 Z" stroke={color} strokeWidth={0.5} fill="none" />
          <Path d="M0 -10 L0 -24" stroke={color} strokeWidth={0.4} />
        </G>
      ))}
    </Svg>
  );
}

/** Hairline — diamond — hairline divider. */
export function OrnamentDivider({ color, width = 120 }: { color?: string; width?: number }) {
  const { colors } = useTheme();
  const c = color ?? colors.secondary;
  return (
    <View style={[styles.row, { width }]} accessible={false}>
      <View style={[styles.line, { backgroundColor: c }]} />
      <View style={[styles.diamond, { backgroundColor: c }]} />
      <View style={[styles.line, { backgroundColor: c }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'center', opacity: 0.7 },
  line: { flex: 1, height: StyleSheet.hairlineWidth * 2 },
  diamond: { width: 6, height: 6, transform: [{ rotate: '45deg' }] },
});
