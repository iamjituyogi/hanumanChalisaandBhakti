import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ThemeMode, useTheme } from '../theme/ThemeProvider';
import { radii, spacing, typography } from '../theme/tokens';
import { Icon, IconName } from './Icon';
import { PressableScale } from './PressableScale';

const OPTIONS: { mode: ThemeMode; label: string; icon: IconName }[] = [
  { mode: 'light', label: 'लाइट', icon: 'sun' },
  { mode: 'dark', label: 'डार्क', icon: 'moon' },
  { mode: 'system', label: 'सिस्टम', icon: 'phone' },
];

/** Three visual tiles for choosing the appearance. */
export function ThemeSelector() {
  const { colors, mode, setMode } = useTheme();
  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {OPTIONS.map(opt => {
        const selected = mode === opt.mode;
        return (
          <PressableScale
            key={opt.mode}
            onPress={() => setMode(opt.mode)}
            accessibilityRole="radio"
            accessibilityState={{ selected, checked: selected }}
            accessibilityLabel={opt.label}
            style={[
              styles.tile,
              {
                backgroundColor: selected ? colors.primarySoft : colors.card,
                borderColor: selected ? colors.primary : colors.border,
                borderWidth: selected ? 1.5 : StyleSheet.hairlineWidth,
              },
            ]}>
            <Icon name={opt.icon} size={24} color={selected ? colors.primary : colors.iconMuted} />
            <Text style={[styles.label, { color: selected ? colors.primary : colors.textSecondary }]}>{opt.label}</Text>
            {selected ? (
              <View style={[styles.check, { backgroundColor: colors.primary }]}>
                <Icon name="check" size={10} color={colors.onPrimary} strokeWidth={3} />
              </View>
            ) : null}
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm, padding: spacing.sm },
  tile: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xs, paddingVertical: spacing.md, borderRadius: radii.lg },
  label: { ...typography.caption, fontWeight: '500' },
  check: { position: 'absolute', top: 6, right: 6, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});
