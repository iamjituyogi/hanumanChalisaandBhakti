import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, Image, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayerActions } from '../audio/PlayerProvider';
import { FadeInView } from '../components/FadeInView';
import { Icon } from '../components/Icon';
import { IconButton } from '../components/IconButton';
import { Mandala, OrnamentDivider } from '../components/Ornaments';
import { PressableScale } from '../components/PressableScale';
import { ScreenHeader } from '../components/ScreenHeader';
import { TEXT_SECTIONS, TextBlock, TextSection } from '../data/lyrics';
import { getTrack } from '../data/tracks';
import { useAppNavigation } from '../navigation/NavigationContext';
import { useLibrary } from '../state/LibraryProvider';
import { ThemeColors } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';
import { elevation, MIN_TOUCH, radii, spacing, typography } from '../theme/tokens';

const CARD_W = 112;
const CARD_H = 148;
const MIN_SIZE = 16;
const MAX_SIZE = 32;

function plainText(section: TextSection): string {
  return section.blocks
    .map(b => (b.t === 'h' ? `\n${b.l[0]}` : b.l.join('\n')))
    .join('\n')
    .trim();
}

/**
 * Couplets arrive as one long line "first half। second half॥". Break them at the
 * middle danda so each half sits on its own centred line, and glue every danda
 * to the word before it so it can never wrap onto a line by itself.
 */
function formatVerse(lines: string[]): string {
  return lines
    .flatMap(l => l.split(/(?<=[।॥])\s+(?=[^\s।॥])/))
    .map(l => l.replace(/\s+([।॥]+)/g, '\u00A0$1').trim())
    .join('\n');
}

export function PaathScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { contentBottomInset, openPlayer } = useAppNavigation();
  const { playTrack } = usePlayerActions();
  const { prefs, updatePrefs } = useLibrary();
  const [selectedId, setSelectedId] = useState(TEXT_SECTIONS[0].id);
  const listRef = useRef<FlatList<TextBlock>>(null);

  const section = useMemo(() => TEXT_SECTIONS.find(s => s.id === selectedId) ?? TEXT_SECTIONS[0], [selectedId]);
  const size = prefs.lyricsSize;

  const select = useCallback((id: string) => {
    setSelectedId(id);
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, []);

  const listen = () => {
    if (section.track) {
      playTrack(section.track);
      openPlayer();
    }
  };

  const header = (
    <View>
      <ScreenHeader title="पाठ एवं मंत्र" subtitle="पढ़ें · गाएं · ध्यान करें" />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cards}
        accessibilityRole="tablist">
        {TEXT_SECTIONS.map((s, i) => (
          <FadeInView key={s.id} index={i}>
            <SectionCard section={s} selected={s.id === selectedId} onPress={() => select(s.id)} colors={colors} />
          </FadeInView>
        ))}
      </ScrollView>

      {/* Reading header */}
      <View style={[styles.readHead, elevation(colors.shadow, 2), { backgroundColor: colors.deep }]}>
        <View style={styles.readMandala} pointerEvents="none">
          <Mandala size={200} color={colors.onDeep} opacity={0.14} />
        </View>
        <Text style={[styles.readKicker, { color: colors.onDeep }]}>{section.subtitle}</Text>
        <Text style={[styles.readTitle, { color: '#FFF6E8' }]} accessibilityRole="header">
          {section.title}
        </Text>
        {section.track ? (
          <PressableScale
            onPress={listen}
            accessibilityRole="button"
            accessibilityLabel={`${getTrack(section.track)?.title} सुनें`}
            style={[styles.listen, { backgroundColor: colors.primary }]}>
            <Icon name="play" size={18} color={colors.onPrimary} />
            <Text style={[styles.listenText, { color: colors.onPrimary }]}>ऑडियो सुनें</Text>
          </PressableScale>
        ) : null}
      </View>

      <View style={styles.tools}>
        <IconButton icon="minus" size={20} disabled={size <= MIN_SIZE} onPress={() => updatePrefs({ lyricsSize: size - 2 })} accessibilityLabel="अक्षर छोटे करें" />
        <View style={[styles.sizePill, { backgroundColor: colors.primarySoft }]}>
          <Icon name="type" size={16} color={colors.primary} />
          <Text style={[styles.sizeText, { color: colors.primary }]}>{size}</Text>
        </View>
        <IconButton icon="plus" size={20} disabled={size >= MAX_SIZE} onPress={() => updatePrefs({ lyricsSize: size + 2 })} accessibilityLabel="अक्षर बड़े करें" />
        <View style={styles.spacer} />
        <IconButton
          icon="share"
          size={20}
          onPress={() => Share.share({ title: section.title, message: `${section.title}\n\n${plainText(section)}\n\n🙏 जय श्री राम 🙏` })}
          accessibilityLabel={`${section.title} शेयर करें`}
        />
      </View>
    </View>
  );

  return (
    <FlatList
      ref={listRef}
      data={section.blocks}
      extraData={size}
      keyExtractor={(_, i) => `${section.id}-${i}`}
      ListHeaderComponent={header}
      ListFooterComponent={
        <View style={styles.footer}>
          <OrnamentDivider width={110} />
          <Text style={[styles.footerText, { color: colors.secondary }]}>॥ जय श्री राम ॥</Text>
        </View>
      }
      renderItem={({ item }) => <Block block={item} size={size} colors={colors} />}
      initialNumToRender={12}
      windowSize={7}
      removeClippedSubviews
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: insets.top + spacing.md, paddingBottom: contentBottomInset }}
    />
  );
}

const SectionCard = memo(function SectionCard({
  section,
  selected,
  onPress,
  colors,
}: {
  section: TextSection;
  selected: boolean;
  onPress: () => void;
  colors: ThemeColors;
}) {
  const track = getTrack(section.image);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      accessibilityLabel={section.title}
      style={({ pressed }) => [
        styles.card,
        elevation(colors.shadow, selected ? 2 : 1),
        { borderColor: selected ? colors.primary : colors.border, opacity: pressed ? 0.85 : 1, transform: [{ scale: selected ? 1 : 0.96 }] },
      ]}>
      {track ? <Image source={track.image} style={styles.cardImg} resizeMode="cover" accessible={false} /> : null}
      <View style={[styles.cardShade, { backgroundColor: selected ? 'rgba(60,20,5,0.35)' : 'rgba(20,8,2,0.5)' }]} />
      {selected ? (
        <View style={[styles.cardCheck, { backgroundColor: colors.primary }]}>
          <Icon name="check" size={12} color={colors.onPrimary} strokeWidth={2.6} />
        </View>
      ) : null}
      <Text style={styles.cardTitle} numberOfLines={2}>
        {section.title}
      </Text>
    </Pressable>
  );
});

const Block = memo(function Block({ block, size, colors }: { block: TextBlock; size: number; colors: ThemeColors }) {
  if (block.t === 'h') {
    return (
      <View style={styles.headingRow}>
        <View style={[styles.headingLine, { backgroundColor: colors.borderStrong }]} />
        <View style={[styles.headingPill, { backgroundColor: colors.primarySoft, borderColor: colors.border }]}>
          <Text style={[styles.headingText, { color: colors.primary }]}>{block.l[0]}</Text>
        </View>
        <View style={[styles.headingLine, { backgroundColor: colors.borderStrong }]} />
      </View>
    );
  }
  if (block.t === 'p') {
    return (
      <Text style={[styles.prose, { color: colors.textPrimary, fontSize: size - 2, lineHeight: (size - 2) * 1.75 }]} selectable>
        {block.l[0]}
      </Text>
    );
  }
  const isDoha = block.t === 'd';
  return (
    <View
      style={[
        styles.verse,
        { backgroundColor: isDoha ? colors.primarySoft : colors.card, borderColor: isDoha ? colors.borderStrong : colors.border },
      ]}>
      <Text
        style={[styles.verseText, { color: isDoha ? colors.primary : colors.textPrimary, fontSize: size, lineHeight: size * 1.7 }]}
        selectable>
        {formatVerse(block.l)}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  cards: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
  card: { width: CARD_W, height: CARD_H, borderRadius: radii.lg, borderWidth: 2, overflow: 'hidden', justifyContent: 'flex-end', backgroundColor: '#3A1D12' },
  cardImg: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  cardShade: { ...StyleSheet.absoluteFill },
  cardCheck: { position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { ...typography.bodyStrong, color: '#FFF6E8', padding: spacing.xs, fontWeight: '700' },
  readHead: { marginHorizontal: spacing.md, marginTop: spacing.xs, padding: spacing.lg, borderRadius: radii.xl, overflow: 'hidden', gap: spacing.xxs },
  readMandala: { position: 'absolute', right: -60, top: -60 },
  readKicker: { ...typography.label, textTransform: 'uppercase', opacity: 0.85 },
  readTitle: { ...typography.display },
  listen: { flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center', gap: 8, height: 44, paddingHorizontal: spacing.md, borderRadius: radii.pill, marginTop: spacing.sm },
  listenText: { ...typography.bodyStrong },
  tools: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, minHeight: MIN_TOUCH + 8, marginBottom: spacing.xs },
  sizePill: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 32, paddingHorizontal: spacing.sm, borderRadius: radii.pill },
  sizeText: { ...typography.bodyStrong, fontSize: 14 },
  spacer: { flex: 1 },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, marginTop: spacing.md, marginBottom: spacing.sm },
  headingLine: { flex: 1, height: StyleSheet.hairlineWidth * 2, opacity: 0.7 },
  headingPill: { paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radii.pill, borderWidth: 1 },
  headingText: { ...typography.bodyStrong, fontSize: 14 },
  verse: { marginHorizontal: spacing.md, marginBottom: spacing.sm, paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderRadius: radii.lg, borderWidth: 1 },
  verseText: { textAlign: 'center', fontWeight: '600' },
  prose: { marginHorizontal: spacing.lg, marginBottom: spacing.md },
  footer: { alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg },
  footerText: { ...typography.title },
});
