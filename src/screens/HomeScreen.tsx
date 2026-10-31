import React from 'react';
import { ImageBackground, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayerActions, usePlayerState } from '../audio/PlayerProvider';
import { FadeInView } from '../components/FadeInView';
import { Icon } from '../components/Icon';
import { Mandala, OrnamentDivider } from '../components/Ornaments';
import { PressableScale } from '../components/PressableScale';
import { SectionHeader } from '../components/SectionHeader';
import { TrackArt } from '../components/TrackArt';
import { TrackRow } from '../components/TrackRow';
import { verseOfTheDay } from '../data/chalisa';
import { getTrack, TRACKS } from '../data/tracks';
import { useAppNavigation } from '../navigation/NavigationContext';
import { dayKey, useLibrary } from '../state/LibraryProvider';
import { useTheme } from '../theme/ThemeProvider';
import { elevation, MIN_TOUCH, radii, spacing, typography } from '../theme/tokens';
import { ComingSoonSection } from '../components/ComingSoonSection';
import { WallpaperSection } from '../wallpaper/WallpaperSection';
import { formatTime, progressRatio } from '../utils/time';

function greeting(date: Date): string {
  const h = date.getHours();
  return h < 12 ? 'सुप्रभात' : h < 17 ? 'नमस्कार' : 'शुभ संध्या';
}

export function HomeScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { setTab, openPlayer, contentBottomInset } = useAppNavigation();
  const { playTrack, togglePlayPause } = usePlayerActions();
  const { trackNumber, status } = usePlayerState();
  const { lastPlayed, progress, streak, jaap, isFavorite, toggleFavorite } = useLibrary();

  const verse = verseOfTheDay();
  const today = jaap.daily[dayKey()] ?? 0;

  // "Continue listening": the last track, if it was left part-way.
  const resumeNumber = lastPlayed ?? null;
  const resume = resumeNumber ? getTrack(resumeNumber) : undefined;
  const saved = resumeNumber ? progress[resumeNumber] : undefined;
  const resumable = !!resume && !!saved && !saved.completed && saved.position > 5;

  const playChalisa = () => {
    if (trackNumber === 1) {
      togglePlayPause();
    } else {
      playTrack(1);
    }
    openPlayer();
  };

  const playingChalisa = trackNumber === 1 && (status === 'playing' || status === 'buffering');

  return (
    <ScrollView
      contentContainerStyle={{ paddingTop: insets.top + spacing.sm, paddingBottom: contentBottomInset }}
      showsVerticalScrollIndicator={false}>
      <View style={styles.greetRow}>
        <View>
          <Text style={[styles.greet, { color: colors.secondary }]}>{greeting(new Date())}</Text>
          <Text style={[styles.jai, { color: colors.textPrimary }]}>जय श्री राम 🙏</Text>
        </View>
        <View style={[styles.streak, { backgroundColor: colors.primarySoft, borderColor: colors.border }]}>
          <Icon name="flame" size={18} color={colors.primary} />
          <Text style={[styles.streakText, { color: colors.primary }]}>{streak} दिन</Text>
        </View>
      </View>

      {/* Hero: Hanuman Ji with the big Play Chalisa button */}
      <FadeInView style={styles.pad}>
        <View style={[styles.hero, elevation(colors.shadow, 3), { backgroundColor: colors.deep }]}>
          <ImageBackground source={TRACKS[0].image} style={styles.heroImg} imageStyle={styles.heroImgInner} resizeMode="cover">
            <View style={styles.heroShade} />
            <View style={styles.heroBody}>
              <Text style={[styles.heroKicker, { color: colors.onDeep }]}>गोस्वामी तुलसीदास कृत</Text>
              <Text style={styles.heroTitle}>श्री हनुमान चालीसा</Text>
              <PressableScale
                onPress={playChalisa}
                accessibilityRole="button"
                accessibilityLabel={playingChalisa ? 'हनुमान चालीसा रोकें' : 'हनुमान चालीसा चलाएं'}
                style={[styles.heroBtn, { backgroundColor: colors.primary }]}>
                <Icon name={playingChalisa ? 'pause' : 'play'} size={22} color={colors.onPrimary} />
                <Text style={[styles.heroBtnText, { color: colors.onPrimary }]}>
                  {playingChalisa ? 'रोकें' : 'हनुमान चालीसा सुनें'}
                </Text>
              </PressableScale>
            </View>
          </ImageBackground>
        </View>
      </FadeInView>

      {/* Continue listening */}
      {resumable && resume ? (
        <FadeInView index={1} style={styles.pad}>
          <SectionHeader title="सुनना जारी रखें" />
          <PressableScale
            onPress={() => {
              playTrack(resume.number);
              openPlayer();
            }}
            accessibilityRole="button"
            accessibilityLabel={`${resume.title} जारी रखें`}
            style={[styles.resume, elevation(colors.shadow, 1), { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TrackArt track={resume.number} style={styles.resumeArt} radius={radii.md} />
            <View style={styles.resumeText}>
              <Text style={[styles.resumeTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                {resume.title}
              </Text>
              <Text style={[styles.resumeSub, { color: colors.textSecondary }]}>
                {formatTime(saved!.position)} / {formatTime(saved!.duration)}
              </Text>
              <View style={[styles.bar, { backgroundColor: colors.progressTrack }]}>
                <View
                  style={[
                    styles.barFill,
                    { backgroundColor: colors.progressFill, width: `${progressRatio(saved!.position, saved!.duration) * 100}%` },
                  ]}
                />
              </View>
            </View>
            <Icon name="play" size={22} color={colors.primary} />
          </PressableScale>
        </FadeInView>
      ) : null}

      {/* Daily verse */}
      <FadeInView index={2} style={styles.pad}>
        <SectionHeader title="आज की चौपाई" />
        <View style={[styles.verse, elevation(colors.shadow, 2), { backgroundColor: colors.deep }]}>
          <View style={styles.verseMandala} pointerEvents="none">
            <Mandala size={190} color={colors.onDeep} opacity={0.12} />
          </View>
          <Text style={[styles.verseLabel, { color: colors.onDeep }]}>{verse.label}</Text>
          <Text style={[styles.verseText, { color: colors.onDeep }]}>{verse.lines.join('\n')}</Text>
          <OrnamentDivider color={colors.onDeep} width={90} />
          <Text style={[styles.verseMeaning, { color: colors.onDeep }]}>{verse.meaning}</Text>
          <PressableScale
            onPress={() => Share.share({ message: `${verse.lines.join('\n')}\n\n${verse.meaning}\n\n🙏 जय श्री राम 🙏` })}
            accessibilityRole="button"
            accessibilityLabel="चौपाई शेयर करें"
            style={[styles.share, { borderColor: colors.onDeep }]}>
            <Icon name="share" size={16} color={colors.onDeep} />
            <Text style={[styles.shareText, { color: colors.onDeep }]}>शेयर करें</Text>
          </PressableScale>
        </View>
      </FadeInView>

      {/* Daily jaap */}
      <FadeInView index={3} style={styles.pad}>
        <SectionHeader title="आज का जाप" actionLabel="जाप करें" onAction={() => setTab('jaap')} />
        <View style={[styles.jaapCard, elevation(colors.shadow, 1), { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.jaapIcon, { backgroundColor: colors.primarySoft }]}>
            <Icon name="beads" size={26} color={colors.primary} />
          </View>
          <View style={styles.jaapText}>
            <Text style={[styles.jaapNum, { color: colors.textPrimary }]}>{today}</Text>
            <Text style={[styles.jaapSub, { color: colors.textSecondary }]}>आज का जाप · लक्ष्य {jaap.target}</Text>
          </View>
        </View>
      </FadeInView>

      {/* Wallpapers */}
      <FadeInView index={4} style={styles.pad0}>
        <WallpaperSection />
      </FadeInView>

      {/* Coming soon: reels + stories */}
      <FadeInView index={5} style={styles.pad}>
        <ComingSoonSection />
      </FadeInView>

      {/* Popular */}
      <FadeInView index={6} style={styles.pad}>
        <SectionHeader title="लोकप्रिय भजन" actionLabel="सभी देखें" onAction={() => setTab('bhajans')} />
        <View style={styles.list}>
          {TRACKS.slice(1, 5).map(t => (
            <TrackRow
              key={t.number}
              track={t}
              active={trackNumber === t.number}
              playing={trackNumber === t.number && (status === 'playing' || status === 'buffering')}
              favorite={isFavorite(t.number)}
              onPress={() => {
                playTrack(t.number);
                openPlayer();
              }}
              onToggleFavorite={() => toggleFavorite(t.number)}
            />
          ))}
        </View>
      </FadeInView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pad0: { marginBottom: spacing.lg },
  pad: { paddingHorizontal: spacing.md, marginBottom: spacing.lg },
  greetRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, marginBottom: spacing.md },
  greet: { ...typography.label, textTransform: 'uppercase' },
  jai: { ...typography.title, fontSize: 26 },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.sm, height: 36, borderRadius: radii.pill, borderWidth: 1 },
  streakText: { ...typography.bodyStrong, fontSize: 14 },
  hero: { borderRadius: radii.xl, overflow: 'hidden' },
  heroImg: { height: 420, justifyContent: 'flex-end' },
  heroImgInner: { borderRadius: radii.xl },
  heroShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(20,8,2,0.38)' },
  heroBody: { padding: spacing.lg, gap: spacing.xs },
  heroKicker: { ...typography.label, textTransform: 'uppercase' },
  heroTitle: { ...typography.display, color: '#FFF6E8', fontSize: 32 },
  heroBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, minHeight: MIN_TOUCH + 8, borderRadius: radii.pill, marginTop: spacing.xs },
  heroBtnText: { ...typography.heading, fontWeight: '700' },
  resume: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radii.lg, borderWidth: 1 },
  resumeArt: { width: 56, height: 56 },
  resumeText: { flex: 1, minWidth: 0, gap: 2 },
  resumeTitle: { ...typography.bodyStrong },
  resumeSub: { ...typography.caption },
  bar: { height: 4, borderRadius: 2, overflow: 'hidden', marginTop: 4 },
  barFill: { height: 4 },
  verse: { borderRadius: radii.xl, padding: spacing.lg, gap: spacing.sm, overflow: 'hidden' },
  verseMandala: { position: 'absolute', right: -60, top: -50 },
  verseLabel: { ...typography.label, opacity: 0.8 },
  verseText: { ...typography.shlok, fontSize: 21, lineHeight: 36, textAlign: 'center' },
  verseMeaning: { ...typography.body, textAlign: 'center', opacity: 0.9 },
  share: { flexDirection: 'row', alignSelf: 'center', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, height: 40, borderRadius: radii.pill, borderWidth: 1, marginTop: spacing.xs },
  shareText: { ...typography.bodyStrong, fontSize: 14 },
  jaapCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radii.lg, borderWidth: 1 },
  jaapIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  jaapText: { flex: 1 },
  jaapNum: { ...typography.display, lineHeight: 38 },
  jaapSub: { ...typography.caption },
  list: { gap: spacing.sm },
});
