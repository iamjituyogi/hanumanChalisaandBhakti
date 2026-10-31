import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { MIN_TOUCH, spacing, typography } from '../theme/tokens';
import { Icon } from './Icon';

type Props = { title: string; actionLabel?: string; onAction?: () => void };

export function SectionHeader({ title, actionLabel, onAction }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <View style={styles.titleWrap}>
        <View style={[styles.bar, { backgroundColor: colors.primary }]} />
        <Text style={[styles.title, { color: colors.textPrimary }]} accessibilityRole="header">
          {title}
        </Text>
      </View>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} accessibilityRole="button" hitSlop={8} style={styles.action}>
          <Text style={[styles.actionText, { color: colors.primary }]}>{actionLabel}</Text>
          <Icon name="chevron-right" size={16} color={colors.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  titleWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  bar: { width: 3, height: 18, borderRadius: 2 },
  title: { ...typography.heading },
  action: { flexDirection: 'row', alignItems: 'center', minHeight: MIN_TOUCH, paddingLeft: spacing.sm },
  actionText: { ...typography.bodyStrong, fontSize: 14 },
});
