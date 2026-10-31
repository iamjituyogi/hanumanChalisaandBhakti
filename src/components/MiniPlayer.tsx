import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePlayerActions, usePlayerState } from '../audio/PlayerProvider';
import { getTrack } from '../data/tracks';
import { useTheme } from '../theme/ThemeProvider';
import { elevation, radii, spacing, typography } from '../theme/tokens';
import { MiniProgressLine } from './AudioProgressBar';
import { TrackArt } from './TrackArt';
import { Icon } from './Icon';
import { PlayPauseButton } from './PlayPauseButton';

export const MINI_PLAYER_HEIGHT = 76;
const ART = 52;

/** Floating mini-player card that sits above the tab bar. */
export function MiniPlayer({ onOpen }: { onOpen: () => void }) {
  const { colors } = useTheme();
  const { trackNumber, status } = usePlayerState();
  const { togglePlayPause, retry } = usePlayerActions();

  const track = trackNumber != null ? getTrack(trackNumber) : undefined;
  if (!track) {
    return null;
  }

  const subtitle =
    status === 'error'
      ? 'लोड नहीं हो सका · पुनः प्रयास करें'
      : status === 'loading' || status === 'buffering'
      ? 'लोड हो रहा है…'
      : status === 'ended'
      ? 'पाठ पूर्ण'
      : track.kind;

  return (
    <View style={[styles.wrap, elevation(colors.shadow, 2), { backgroundColor: colors.backgroundElevated, borderColor: colors.navBorder }]}>
      <Pressable
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={`अभी चल रहा है: ${track.title}`}
        accessibilityHint="पूरा प्लेयर खोलें"
        style={styles.row}>
        <TrackArt track={track.number} style={{ width: ART, height: ART }} radius={radii.md} />
        <View style={styles.text}>
          <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
            {track.title}
          </Text>
          <View style={styles.subRow}>
            {status === 'error' ? <Icon name="alert" size={12} color={colors.danger} /> : null}
            <Text
              style={[styles.subtitle, { color: status === 'error' ? colors.danger : colors.textSecondary }]}
              numberOfLines={1}>
              {subtitle}
            </Text>
          </View>
        </View>
        <PlayPauseButton
          status={status}
          onPress={status === 'error' ? retry : togglePlayPause}
          size={44}
          variant="primary"
        />
      </Pressable>
      <MiniProgressLine />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: radii.xl, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  row: {
    height: MINI_PLAYER_HEIGHT - 2,
    paddingRight: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  text: { flex: 1, minWidth: 0 },
  title: { ...typography.bodyStrong },
  subRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs },
  subtitle: { ...typography.caption, fontSize: 12 },
});
