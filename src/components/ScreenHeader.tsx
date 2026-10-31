import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { spacing, typography } from '../theme/tokens';
import { Mandala, OrnamentDivider } from './Ornaments';

type Props = { title: string; subtitle?: string; right?: React.ReactNode };

/** Large page title with a faint mandala behind it, used at the top of every tab screen. */
export function ScreenHeader({ title, subtitle, right }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      <View style={styles.mandala} pointerEvents="none">
        <Mandala size={230} color={colors.secondary} opacity={0.16} />
      </View>
      <View style={styles.row}>
        <View style={styles.text}>
          {subtitle ? <Text style={[styles.subtitle, { color: colors.secondary }]}>{subtitle}</Text> : null}
          <Text style={[styles.title, { color: colors.textPrimary }]} accessibilityRole="header">
            {title}
          </Text>
          <View style={styles.divider}>
            <OrnamentDivider width={88} />
          </View>
        </View>
        {right}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  mandala: { position: 'absolute', right: -78, top: -64 },
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: spacing.md },
  text: { flex: 1, minWidth: 0 },
  subtitle: { ...typography.label, textTransform: 'uppercase' },
  title: { ...typography.display, fontSize: 34, lineHeight: 46 },
  divider: { alignSelf: 'flex-start', marginTop: spacing.xxs },
});
