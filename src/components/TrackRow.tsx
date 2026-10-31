import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Track } from '../data/tracks';
import { useTheme } from '../theme/ThemeProvider';
import { elevation, MIN_TOUCH, radii, spacing, typography } from '../theme/tokens';
import { IconButton } from './IconButton';
import { PlayingIndicator } from './PlayingIndicator';
import { PressableScale } from './PressableScale';
import { TrackArt } from './TrackArt';

const ART = 68;

type Props = {
  track: Track;
  /** This track is the one loaded in the player. */
  active: boolean;
  /** …and audio is actually playing. */
  playing: boolean;
  favorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
};

/** One bhajan in the list: artwork, name, kind, equaliser when playing and a heart. */
export function TrackRow({ track, active, playing, favorite, onPress, onToggleFavorite }: Props) {
  const { colors } = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${track.title}, ${track.kind}`}
      accessibilityHint="चलाने के लिए टैप करें"
      style={[
        styles.row,
        elevation(colors.shadow, 1),
        { backgroundColor: colors.card, borderColor: active ? colors.primary : colors.border },
      ]}>
      <View>
        <TrackArt track={track.number} style={{ width: ART, height: ART }} radius={radii.md} />
        {active ? (
          <View style={[styles.badge, { backgroundColor: colors.scrim }]}>
            <PlayingIndicator color="#FFF6E8" active={playing} size={16} />
          </View>
        ) : null}
      </View>
      <View style={styles.text}>
        <Text style={[styles.title, { color: active ? colors.primary : colors.textPrimary }]} numberOfLines={2}>
          {track.title}
        </Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]} numberOfLines={1}>
          {track.subtitle}
        </Text>
        <View style={[styles.kind, { backgroundColor: colors.primarySoft }]}>
          <Text style={[styles.kindText, { color: colors.primary }]}>{track.kind}</Text>
        </View>
      </View>
      <IconButton
        icon={favorite ? 'heart-filled' : 'heart'}
        color={favorite ? colors.primary : colors.iconMuted}
        size={22}
        selected={favorite}
        onPress={onToggleFavorite}
        accessibilityLabel={favorite ? 'पसंदीदा से हटाएं' : 'पसंदीदा में जोड़ें'}
      />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    minHeight: MIN_TOUCH + 28,
  },
  badge: { ...StyleSheet.absoluteFill, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, minWidth: 0, gap: 2 },
  title: { ...typography.bodyStrong, fontSize: 16, lineHeight: 24 },
  sub: { ...typography.caption },
  kind: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 2, borderRadius: radii.pill, marginTop: 4 },
  kindText: { ...typography.label },
});
