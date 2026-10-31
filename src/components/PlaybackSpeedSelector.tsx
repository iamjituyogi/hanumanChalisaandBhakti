import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlaybackSpeed, SPEED_OPTIONS } from '../state/LibraryProvider';
import { useTheme } from '../theme/ThemeProvider';
import { MIN_TOUCH, radii, spacing, typography } from '../theme/tokens';
import { Icon } from './Icon';

export function formatSpeed(speed: number): string {
  return `${speed % 1 === 0 ? speed.toFixed(1) : speed}x`;
}

type Props = {
  value: PlaybackSpeed;
  onChange: (speed: PlaybackSpeed) => void;
  /** "pill" for the player toolbar, "row" for Settings. */
  variant?: 'pill' | 'row';
};

/** One compact control that opens a sheet with every speed. */
export function PlaybackSpeedSelector({ value, onChange, variant = 'pill' }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  return (
    <>
      {variant === 'pill' ? (
        <Pressable
          onPress={() => setOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={`प्लेबैक गति ${formatSpeed(value)}`}
          accessibilityHint="गति बदलने के लिए टैप करें"
          style={({ pressed }) => [
            styles.pill,
            { borderColor: colors.borderStrong, backgroundColor: colors.surfaceMuted, opacity: pressed ? 0.7 : 1 },
          ]}>
          <Icon name="gauge" size={18} color={colors.secondary} />
          <Text style={[styles.pillText, { color: colors.textPrimary }]}>{formatSpeed(value)}</Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={() => setOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={`डिफ़ॉल्ट प्लेबैक गति ${formatSpeed(value)}`}
          style={({ pressed }) => [styles.rowValue, { opacity: pressed ? 0.6 : 1 }]}>
          <Text style={[styles.rowValueText, { color: colors.primary }]}>{formatSpeed(value)}</Text>
          <Icon name="chevron-right" size={18} color={colors.iconMuted} />
        </Pressable>
      )}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)} statusBarTranslucent navigationBarTranslucent>
        <Pressable style={[styles.scrim, { backgroundColor: colors.scrim }]} onPress={() => setOpen(false)} accessibilityLabel="बंद करें" />
        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.dialog, paddingBottom: insets.bottom + spacing.md, borderColor: colors.border },
          ]}>
          <View style={[styles.handle, { backgroundColor: colors.borderStrong }]} />
          <Text style={[styles.sheetTitle, { color: colors.textPrimary }]} accessibilityRole="header">
            प्लेबैक गति
          </Text>
          <View style={styles.grid}>
            {SPEED_OPTIONS.map(speed => {
              const selected = speed === value;
              return (
                <Pressable
                  key={speed}
                  onPress={() => {
                    onChange(speed);
                    setOpen(false);
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={formatSpeed(speed)}
                  style={({ pressed }) => [
                    styles.option,
                    {
                      backgroundColor: selected ? colors.primary : colors.surfaceMuted,
                      borderColor: selected ? colors.primary : colors.border,
                      opacity: pressed ? 0.75 : 1,
                    },
                  ]}>
                  <Text style={[styles.optionText, { color: selected ? colors.onPrimary : colors.textPrimary }]}>
                    {formatSpeed(speed)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  pillText: { ...typography.bodyStrong, fontVariant: ['tabular-nums'] },
  rowValue: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs, minHeight: MIN_TOUCH },
  rowValueText: { ...typography.bodyStrong },
  scrim: { ...StyleSheet.absoluteFill },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, marginBottom: spacing.md },
  sheetTitle: { ...typography.heading, marginBottom: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  option: {
    width: '30.5%',
    minHeight: MIN_TOUCH,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  optionText: { ...typography.bodyStrong, fontVariant: ['tabular-nums'] },
});
