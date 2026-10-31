import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { MIN_TOUCH, radii, spacing, typography } from '../theme/tokens';
import { Icon, IconName } from './Icon';

type Props = {
  icon: IconName;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: 'neutral' | 'error';
};

/** Shared empty and error state with an optional action. */
export function EmptyState({ icon, title, message, actionLabel, onAction, tone = 'neutral' }: Props) {
  const { colors } = useTheme();
  const isError = tone === 'error';
  return (
    <View style={styles.wrap} accessibilityLiveRegion={isError ? 'polite' : 'none'}>
      <View style={[styles.iconCircle, { backgroundColor: isError ? colors.dangerSurface : colors.surfaceMuted }]}>
        <Icon name={icon} size={34} color={isError ? colors.danger : colors.secondary} />
      </View>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          style={({ pressed }) => [styles.button, { backgroundColor: pressed ? colors.primaryPressed : colors.primary }]}>
          <Text style={[styles.buttonText, { color: colors.onPrimary }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg },
  iconCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  title: { ...typography.heading, marginTop: spacing.md, textAlign: 'center' },
  message: { ...typography.body, marginTop: spacing.xs, textAlign: 'center', maxWidth: 300 },
  button: {
    marginTop: spacing.lg,
    minHeight: MIN_TOUCH,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { ...typography.bodyStrong },
});
