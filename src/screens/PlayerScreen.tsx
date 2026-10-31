import React, { useState } from 'react';
import { Pressable, Share, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayerActions, usePlayerState } from '../audio/PlayerProvider';
import { AudioPlayerControls } from '../components/AudioPlayerControls';
import { AudioProgressBar } from '../components/AudioProgressBar';
import { EmptyState } from '../components/EmptyState';
import { IconButton } from '../components/IconButton';
import { LyricsView } from '../components/LyricsView';
import { Mandala } from '../components/Ornaments';
import { PlaybackSpeedSelector } from '../components/PlaybackSpeedSelector';
import { SleepTimerButton } from '../components/SleepTimerButton';
import { TrackArt } from '../components/TrackArt';
import { getTrack } from '../data/tracks';
import { useLibrary } from '../state/LibraryProvider';
import { useTheme } from '../theme/ThemeProvider';
import { elevation, MIN_TOUCH, radii, spacing, typography } from '../theme/tokens';

type Mode = 'cover' | 'lyrics' | 'meaning';

const MODES: { key: Mode; label: string }[] = [
  { key: 'cover', label: 'चित्र' },
  { key: 'lyrics', label: 'बोल' },
  { key: 'meaning', label: 'अर्थ' },
];

export function PlayerScreen({ onClose }: { onClose: () => void }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { trackNumber, speed, errorMessage } = usePlayerState();
  const { setSpeed } = usePlayerActions();
  const { isFavorite, toggleFavorite } = useLibrary();
  const [mode, setMode] = useState<Mode>('cover');

  const track = trackNumber != null ? getTrack(trackNumber) : undefined;
  if (!track) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <IconButton icon="chevron-down" onPress={onClose} accessibilityLabel="बंद करें" />
        <EmptyState icon="headphones" title="कुछ नहीं चल रहा" message="सूची से कोई भजन चुनें।" />
      </View>
    );
  }

  const fav = isFavorite(track.number);
  // Portrait artwork: as tall as fits while leaving room for controls.
  const artH = Math.min(height * 0.36, 340);
  const artW = Math.min(width - spacing.lg * 2, artH * 0.82);
  const modes = track.hasLyrics ? MODES : MODES.slice(0, 1);

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      <View style={styles.mandala} pointerEvents="none">
        <Mandala size={320} color={colors.secondary} opacity={0.14} />
      </View>

      <View style={styles.topBar}>
        <IconButton icon="chevron-down" onPress={onClose} accessibilityLabel="प्लेयर बंद करें" />
        <Text style={[styles.topTitle, { color: colors.textSecondary }]}>अभी चल रहा है</Text>
        <IconButton
          icon={fav ? 'heart-filled' : 'heart'}
          color={fav ? colors.primary : colors.icon}
          onPress={() => toggleFavorite(track.number)}
          accessibilityLabel={fav ? 'पसंदीदा से हटाएं' : 'पसंदीदा में जोड़ें'}
        />
      </View>

      {modes.length > 1 ? (
        <View style={[styles.segment, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]} accessibilityRole="tablist">
          {modes.map(m => {
            const on = mode === m.key;
            return (
              <Pressable
                key={m.key}
                onPress={() => setMode(m.key)}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                style={[styles.segItem, on && { backgroundColor: colors.primary }]}>
                <Text style={[styles.segText, { color: on ? colors.onPrimary : colors.textSecondary }]}>{m.label}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <View style={styles.middle}>
        {mode === 'cover' || !track.hasLyrics ? (
          <View style={styles.coverWrap}>
            <View style={[elevation(colors.shadow, 3), styles.coverShadow, { borderRadius: radii.xl }]}>
              <TrackArt track={track.number} style={{ width: artW, height: artH }} radius={radii.xl} />
            </View>
            <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
              {track.title}
            </Text>
            <Text style={[styles.sub, { color: colors.secondary }]} numberOfLines={1}>
              {track.subtitle}
            </Text>
          </View>
        ) : (
          <LyricsView withMeaning={mode === 'meaning'} />
        )}
      </View>

      {errorMessage ? (
        <Text style={[styles.error, { color: colors.danger }]} accessibilityLiveRegion="polite">
          {errorMessage}
        </Text>
      ) : null}

      <View style={styles.bottom}>
        <AudioProgressBar />
        <AudioPlayerControls />
        <View style={styles.toolbar}>
          <PlaybackSpeedSelector value={speed} onChange={setSpeed} />
          <SleepTimerButton />
          <IconButton
            icon="share"
            size={22}
            onPress={() => Share.share({ message: `🙏 ${track.title} सुनें — हनुमान चालीसा एवं भक्ति ऐप\nजय श्री राम 🙏` })}
            accessibilityLabel="शेयर करें"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  mandala: { position: 'absolute', alignSelf: 'center', top: '18%' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xs },
  topTitle: { ...typography.label, textTransform: 'uppercase' },
  segment: { flexDirection: 'row', alignSelf: 'center', padding: 4, borderRadius: radii.pill, borderWidth: 1, gap: 4, marginBottom: spacing.xs },
  segItem: { minWidth: 76, height: 36, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.sm },
  segText: { ...typography.bodyStrong, fontSize: 14 },
  middle: { flex: 1, minHeight: 0 },
  coverWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xs, paddingHorizontal: spacing.lg },
  coverShadow: { marginBottom: spacing.sm },
  title: { ...typography.title, textAlign: 'center' },
  sub: { ...typography.caption, textAlign: 'center' },
  error: { ...typography.caption, textAlign: 'center', marginBottom: spacing.xs },
  bottom: { gap: spacing.sm, paddingHorizontal: spacing.md },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: MIN_TOUCH },
});
