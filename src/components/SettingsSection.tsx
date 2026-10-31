import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { elevation, MIN_TOUCH, radii, spacing, typography } from '../theme/tokens';
import { Icon, IconName } from './Icon';

export function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  const items = React.Children.toArray(children);
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textTertiary }]} accessibilityRole="header">
        {title}
      </Text>
      <View style={[styles.group, elevation(colors.shadow, 1), { backgroundColor: colors.card, borderColor: colors.border }]}>
        {items.map((child, i) => (
          <View key={i}>
            {i > 0 ? <View style={[styles.divider, { backgroundColor: colors.border }]} /> : null}
            {child}
          </View>
        ))}
      </View>
    </View>
  );
}

type RowProps = {
  icon: IconName;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  selected?: boolean;
  accessibilityRole?: 'button' | 'radio' | 'switch';
};

export function SettingsRow({ icon, title, subtitle, right, onPress, selected, accessibilityRole }: RowProps) {
  const { colors } = useTheme();
  const content = (
    <>
      <View style={[styles.iconWrap, { backgroundColor: colors.primarySoft }]}>
        <Icon name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.text}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text> : null}
      </View>
      {right}
    </>
  );
  if (!onPress) {
    return <View style={styles.row}>{content}</View>;
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={accessibilityRole ?? 'button'}
      accessibilityState={selected != null ? { selected, checked: selected } : undefined}
      android_ripple={{ color: colors.border }}
      style={styles.row}>
      {content}
    </Pressable>
  );
}

export function SettingsSwitch({ value, onValueChange, label }: { value: boolean; onValueChange: (v: boolean) => void; label: string }) {
  const { colors } = useTheme();
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      accessibilityLabel={label}
      trackColor={{ false: colors.progressTrack, true: colors.primary }}
      thumbColor={colors.surface}
      ios_backgroundColor={colors.progressTrack}
    />
  );
}

export function RadioMark({ selected }: { selected: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.radio, { borderColor: selected ? colors.primary : colors.borderStrong, backgroundColor: selected ? colors.primary : 'transparent' }]}>
      {selected ? <Icon name="check" size={14} color={colors.onPrimary} strokeWidth={2.4} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: spacing.lg + spacing.xxs },
  sectionTitle: { ...typography.label, textTransform: 'uppercase', marginBottom: spacing.xs, marginLeft: spacing.xs },
  group: { borderRadius: radii.xl, borderWidth: StyleSheet.hairlineWidth },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: spacing.md + 36 + spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: MIN_TOUCH + spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  iconWrap: { width: 36, height: 36, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, minWidth: 0 },
  title: { ...typography.body, fontWeight: '500' },
  subtitle: { ...typography.caption, fontSize: 12 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
});
