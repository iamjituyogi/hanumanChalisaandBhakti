import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayerActions, usePlayerState } from '../audio/PlayerProvider';
import { useTheme } from '../theme/ThemeProvider';
import { MIN_TOUCH, radii, spacing, typography } from '../theme/tokens';
import { Icon } from './Icon';
import { RadioMark } from './SettingsSection';

const OPTIONS = [5, 10, 15, 30, 60] as const;

function remaining(sleepAt: number | null, now: number): string {
  if (sleepAt == null) {
    return '';
  }
  const m = Math.max(0, Math.ceil((sleepAt - now) / 60_000));
  return `${m} मिनट`;
}

/** Pill that opens a sheet to stop playback after 5–60 minutes. */
export function SleepTimerButton() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { sleepAt } = usePlayerState();
  const { setSleepTimer } = usePlayerActions();
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Refresh the "N मिनट" label while a timer is running.
  useEffect(() => {
    if (sleepAt == null) {
      return;
    }
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(id);
  }, [sleepAt]);

  const active = sleepAt != null;

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={active ? `स्लीप टाइमर चालू, ${remaining(sleepAt, now)} बाकी` : 'स्लीप टाइमर'}
        style={({ pressed }) => [
          styles.pill,
          {
            borderColor: active ? colors.primary : colors.borderStrong,
            backgroundColor: active ? colors.primarySoft : colors.surfaceMuted,
            opacity: pressed ? 0.7 : 1,
          },
        ]}>
        <Icon name="timer" size={18} color={active ? colors.primary : colors.secondary} />
        <Text style={[styles.pillText, { color: active ? colors.primary : colors.textPrimary }]}>
          {active ? remaining(sleepAt, now) : 'टाइमर'}
        </Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)} statusBarTranslucent navigationBarTranslucent>
        <Pressable style={[styles.scrim, { backgroundColor: colors.scrim }]} onPress={() => setOpen(false)} accessibilityLabel="बंद करें" />
        <View style={[styles.sheet, { backgroundColor: colors.dialog, paddingBottom: insets.bottom + spacing.md, borderColor: colors.border }]}>
          <View style={[styles.handle, { backgroundColor: colors.borderStrong }]} />
          <Text style={[styles.title, { color: colors.textPrimary }]} accessibilityRole="header">
            स्लीप टाइमर
          </Text>
          <Text style={[styles.hint, { color: colors.textSecondary }]}>चुने हुए समय के बाद ऑडियो अपने आप रुक जाएगा।</Text>
          {OPTIONS.map(m => (
            <Pressable
              key={m}
              onPress={() => {
                setSleepTimer(m);
                setOpen(false);
              }}
              accessibilityRole="button"
              style={styles.option}>
              <Text style={[styles.optionText, { color: colors.textPrimary }]}>{m} मिनट</Text>
              <RadioMark selected={false} />
            </Pressable>
          ))}
          {active ? (
            <Pressable
              onPress={() => {
                setSleepTimer(null);
                setOpen(false);
              }}
              accessibilityRole="button"
              style={styles.option}>
              <Text style={[styles.optionText, { color: colors.danger }]}>टाइमर बंद करें</Text>
            </Pressable>
          ) : null}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 40, paddingHorizontal: spacing.sm, borderRadius: radii.pill, borderWidth: 1 },
  pillText: { ...typography.bodyStrong, fontSize: 14 },
  scrim: { ...StyleSheet.absoluteFill },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, borderWidth: StyleSheet.hairlineWidth, padding: spacing.md, paddingTop: spacing.sm },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, marginBottom: spacing.sm },
  title: { ...typography.title, marginBottom: 2 },
  hint: { ...typography.caption, marginBottom: spacing.xs },
  option: { minHeight: MIN_TOUCH, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  optionText: { ...typography.body },
});
