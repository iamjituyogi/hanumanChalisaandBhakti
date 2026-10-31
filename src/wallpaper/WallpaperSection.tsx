import React, { useEffect, useState } from 'react';
import { AppState, FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../components/Icon';
import { PressableScale } from '../components/PressableScale';
import { SectionHeader } from '../components/SectionHeader';
import { Wallpaper, WALLPAPERS } from '../data/wallpapers';
import { useTheme } from '../theme/ThemeProvider';
import { elevation, radii, spacing, typography } from '../theme/tokens';
import { pendingSuccess, WallpaperTarget, wallpaperSupported } from './setWallpaper';
import { WallpaperPreview } from './WallpaperPreview';

const CARD_W = 150;
const CARD_H = 240;

/** Home-screen carousel of devotional wallpapers; tapping one opens the set-wallpaper flow. */
export function WallpaperSection() {
  const { colors } = useTheme();
  const [selected, setSelected] = useState<Wallpaper | null>(null);
  const [replay, setReplay] = useState<WallpaperTarget | null>(null);

  // Replay the success screen if the launcher stole focus right after the wallpaper was set.
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      const p = pendingSuccess.get();
      if (state === 'active' && p) {
        const w = WALLPAPERS.find(x => x.id === p.wallpaperId) ?? null;
        setReplay(p.target);
        setSelected(w);
      }
    });
    return () => sub.remove();
  }, []);

  if (!wallpaperSupported) {
    return null;
  }

  return (
    <View>
      <View style={styles.header}>
        <SectionHeader title="दिव्य वॉलपेपर" />
      </View>
      <FlatList
        data={WALLPAPERS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={w => w.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ width: spacing.sm }} />}
        renderItem={({ item }) => (
          <PressableScale
            onPress={() => {
              setReplay(null);
              setSelected(item);
            }}
            accessibilityRole="button"
            accessibilityLabel={`${item.title} वॉलपेपर देखें`}
            style={[styles.card, { borderColor: colors.secondary, ...elevation(colors.shadow, 2) }]}>
            <Image source={item.image} style={styles.img} resizeMode="cover" />
            <View style={styles.shade} />
            <View style={[styles.badge, { backgroundColor: 'rgba(10,4,1,0.55)' }]}>
              <Icon name="phone" size={14} color="#F4DCA6" />
            </View>
            <View style={styles.caption}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.cardSub} numberOfLines={1}>{item.subtitle}</Text>
            </View>
          </PressableScale>
        )}
      />
      <WallpaperPreview
        wallpaper={selected}
        initialSuccess={replay}
        onClose={() => {
          setSelected(null);
          setReplay(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.md },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xs },
  card: { width: CARD_W, height: CARD_H, borderRadius: radii.xl, overflow: 'hidden', borderWidth: 1.5 },
  img: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  shade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 90, backgroundColor: 'rgba(10,4,1,0.55)' },
  badge: { position: 'absolute', top: spacing.xs, right: spacing.xs, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  caption: { position: 'absolute', left: spacing.sm, right: spacing.sm, bottom: spacing.sm },
  cardTitle: { ...typography.bodyStrong, color: '#FFF6E8' },
  cardSub: { ...typography.label, color: '#E4CA8E' },
});
