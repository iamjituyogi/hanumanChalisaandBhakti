import React, { useRef } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, Vibration, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FadeInView } from '../components/FadeInView';
import { Icon } from '../components/Icon';
import { IconButton } from '../components/IconButton';
import { Mandala } from '../components/Ornaments';
import { ScreenHeader } from '../components/ScreenHeader';
import { SectionHeader } from '../components/SectionHeader';
import { useAppNavigation } from '../navigation/NavigationContext';
import { dayKey, JAAP_TARGETS, useLibrary } from '../state/LibraryProvider';
import { useTheme } from '../theme/ThemeProvider';
import { elevation, MIN_TOUCH, radii, spacing, typography } from '../theme/tokens';

const WEEKDAYS = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];
const BTN = 210;

export function JaapScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { contentBottomInset } = useAppNavigation();
  const { jaap, tapJaap, setJaapTarget, resetJaapRound } = useLibrary();
  const pulse = useRef(new Animated.Value(1)).current;

  const onTap = () => {
    const completed = tapJaap();
    Vibration.vibrate(completed ? [0, 60, 60, 120] : 18);
    Animated.sequence([
      Animated.timing(pulse, { toValue: 0.94, duration: 70, useNativeDriver: true }),
      Animated.spring(pulse, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 10 }),
    ]).start();
  };

  const today = jaap.daily[dayKey()] ?? 0;
  const rounds = Math.floor(today / jaap.target);

  // Last 7 days, oldest first.
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { key: dayKey(d), label: WEEKDAYS[d.getDay()], count: jaap.daily[dayKey(d)] ?? 0, isToday: i === 6 };
  });
  const max = Math.max(1, ...days.map(d => d.count));
  const total = Object.values(jaap.daily).reduce((a, b) => a + b, 0);

  return (
    <ScrollView
      contentContainerStyle={{ paddingTop: insets.top + spacing.sm, paddingBottom: contentBottomInset }}
      showsVerticalScrollIndicator={false}>
      <ScreenHeader title="जाप काउंटर" subtitle="राम नाम · हनुमान नाम" />

      <FadeInView index={1} style={styles.pad}>
        <View style={styles.targets}>
          {JAAP_TARGETS.map(t => {
            const on = jaap.target === t;
            return (
              <Pressable
                key={t}
                onPress={() => setJaapTarget(t)}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                accessibilityLabel={`${t} का लक्ष्य`}
                style={[styles.chip, { backgroundColor: on ? colors.primary : colors.surfaceMuted, borderColor: on ? colors.primary : colors.border }]}>
                <Text style={[styles.chipText, { color: on ? colors.onPrimary : colors.textSecondary }]}>{t}</Text>
              </Pressable>
            );
          })}
        </View>
      </FadeInView>

      <FadeInView index={2} style={styles.center}>
        <View style={styles.mandala} pointerEvents="none">
          <Mandala size={BTN + 120} color={colors.secondary} opacity={0.2} />
        </View>
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <Pressable
            onPress={onTap}
            accessibilityRole="button"
            accessibilityLabel={`जाप करें, अभी ${jaap.round} में से ${jaap.target}`}
            style={[styles.bigBtn, elevation(colors.shadow, 3), { backgroundColor: colors.primary, borderColor: colors.secondary }]}>
            <Text style={[styles.count, { color: colors.onPrimary }]}>{jaap.round}</Text>
            <Text style={[styles.of, { color: colors.onPrimary }]}>/ {jaap.target}</Text>
            <Text style={[styles.ram, { color: colors.onPrimary }]}>जय श्री राम</Text>
          </Pressable>
        </Animated.View>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>गिनने के लिए बड़े बटन को दबाएं</Text>
      </FadeInView>

      <FadeInView index={3} style={styles.pad}>
        <View style={styles.stats}>
          <Stat label="आज का जाप" value={today} />
          <Stat label="पूर्ण माला" value={rounds} />
          <Stat label="कुल जाप" value={total} />
        </View>
        <Pressable
          onPress={resetJaapRound}
          accessibilityRole="button"
          style={[styles.reset, { borderColor: colors.borderStrong }]}>
          <Icon name="refresh" size={16} color={colors.textSecondary} />
          <Text style={[styles.resetText, { color: colors.textSecondary }]}>गिनती फिर से शुरू करें</Text>
        </Pressable>
      </FadeInView>

      <FadeInView index={4} style={styles.pad}>
        <SectionHeader title="पिछले 7 दिन" />
        <View style={[styles.chart, elevation(colors.shadow, 1), { backgroundColor: colors.card, borderColor: colors.border }]}>
          {days.map(d => (
            <View key={d.key} style={styles.col}>
              <Text style={[styles.colCount, { color: colors.textTertiary }]}>{d.count || ''}</Text>
              <View style={styles.track}>
                <View
                  style={{
                    height: Math.max(4, (d.count / max) * 80),
                    width: 18,
                    borderRadius: 9,
                    backgroundColor: d.isToday ? colors.primary : colors.secondaryMuted,
                    opacity: d.count ? 1 : 0.4,
                  }}
                />
              </View>
              <Text style={[styles.colLabel, { color: d.isToday ? colors.primary : colors.textSecondary }]}>{d.label}</Text>
            </View>
          ))}
        </View>
      </FadeInView>
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.stat, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.statValue, { color: colors.textPrimary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: spacing.md, marginBottom: spacing.lg },
  targets: { flexDirection: 'row', gap: spacing.xs, justifyContent: 'center' },
  chip: { minWidth: 64, minHeight: MIN_TOUCH - 4, borderRadius: radii.pill, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md },
  chipText: { ...typography.heading, fontWeight: '700' },
  center: { alignItems: 'center', justifyContent: 'center', marginVertical: spacing.md, marginBottom: spacing.lg },
  mandala: { position: 'absolute' },
  bigBtn: { width: BTN, height: BTN, borderRadius: BTN / 2, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  count: { fontSize: 64, lineHeight: 72, fontWeight: '700' },
  of: { ...typography.heading, opacity: 0.85 },
  ram: { ...typography.caption, marginTop: 6, opacity: 0.9 },
  hint: { ...typography.caption, marginTop: spacing.sm },
  stats: { flexDirection: 'row', gap: spacing.xs },
  stat: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, borderRadius: radii.lg, borderWidth: 1 },
  statValue: { ...typography.title },
  statLabel: { ...typography.label },
  reset: { flexDirection: 'row', alignSelf: 'center', alignItems: 'center', gap: 6, height: 40, paddingHorizontal: spacing.md, borderRadius: radii.pill, borderWidth: 1, marginTop: spacing.sm },
  resetText: { ...typography.bodyStrong, fontSize: 14 },
  chart: { flexDirection: 'row', justifyContent: 'space-between', padding: spacing.md, borderRadius: radii.lg, borderWidth: 1 },
  col: { alignItems: 'center', gap: 4 },
  colCount: { ...typography.label, height: 16 },
  track: { height: 84, justifyContent: 'flex-end' },
  colLabel: { ...typography.label },
});
