import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayerActions, usePlayerState } from '../audio/PlayerProvider';
import { EmptyState } from '../components/EmptyState';
import { FadeInView } from '../components/FadeInView';
import { ScreenHeader } from '../components/ScreenHeader';
import { TrackRow } from '../components/TrackRow';
import { TRACKS } from '../data/tracks';
import { useAppNavigation } from '../navigation/NavigationContext';
import { useLibrary } from '../state/LibraryProvider';
import { useTheme } from '../theme/ThemeProvider';
import { MIN_TOUCH, radii, spacing, typography } from '../theme/tokens';

type Filter = 'all' | 'favorites';

export function BhajansScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { contentBottomInset, openPlayer } = useAppNavigation();
  const { playTrack } = usePlayerActions();
  const { trackNumber, status } = usePlayerState();
  const { favorites, isFavorite, toggleFavorite } = useLibrary();
  const [filter, setFilter] = useState<Filter>('all');

  const data = useMemo(
    () => (filter === 'all' ? TRACKS : TRACKS.filter(t => favorites.includes(t.number))),
    [filter, favorites],
  );

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: `सभी (${TRACKS.length})` },
    { key: 'favorites', label: `पसंदीदा (${favorites.length})` },
  ];

  return (
    <FlatList
      data={data}
      keyExtractor={t => String(t.number)}
      contentContainerStyle={{ paddingTop: insets.top + spacing.md, paddingBottom: contentBottomInset, gap: spacing.sm }}
      ListHeaderComponent={
        <View>
          <ScreenHeader title="भजन एवं पाठ" subtitle="जय श्री राम" />
          <View style={styles.filters}>
            {filters.map(f => {
              const on = filter === f.key;
              return (
                <Pressable
                  key={f.key}
                  onPress={() => setFilter(f.key)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  style={[
                    styles.chip,
                    { backgroundColor: on ? colors.primary : colors.surfaceMuted, borderColor: on ? colors.primary : colors.border },
                  ]}>
                  <Text style={[styles.chipText, { color: on ? colors.onPrimary : colors.textSecondary }]}>{f.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      }
      ListEmptyComponent={
        <EmptyState
          icon="heart"
          title="अभी कोई पसंदीदा नहीं"
          message="किसी भजन के दिल के चिह्न को दबाकर उसे यहाँ सहेजें।"
        />
      }
      renderItem={({ item, index }) => (
        <FadeInView index={index} style={styles.item}>
          <TrackRow
            track={item}
            active={trackNumber === item.number}
            playing={trackNumber === item.number && (status === 'playing' || status === 'buffering')}
            favorite={isFavorite(item.number)}
            onPress={() => {
              playTrack(item.number);
              openPlayer();
            }}
            onToggleFavorite={() => toggleFavorite(item.number)}
          />
        </FadeInView>
      )}
    />
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: 'row', gap: spacing.xs, paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  chip: { minHeight: MIN_TOUCH - 8, paddingHorizontal: spacing.md, borderRadius: radii.pill, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  chipText: { ...typography.bodyStrong, fontSize: 14 },
  item: { paddingHorizontal: spacing.md },
});
