import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useTheme } from '../theme/ThemeProvider';
import { elevation, radii, spacing, typography } from '../theme/tokens';
import { Icon } from './Icon';
import { SectionHeader } from './SectionHeader';

const IMG: ImageSourcePropType[] = [
  require('../img/hanuman_01.jpg'),
  require('../img/hanuman_03.jpg'),
  require('../img/hanuman_06.jpg'),
  require('../img/hanuman_09.jpg'),
  require('../img/hanuman_07.jpg'),
];

const PHONE_W = 96;
const PHONE_H = 172;

/** "जल्द आ रहा है" pill with a gently pulsing dot. */
function SoonBadge() {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduced) {
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, reduced]);
  return (
    <View style={[styles.badge, { borderColor: colors.secondary, backgroundColor: 'rgba(240,200,120,0.14)' }]}>
      <Animated.View
        style={[styles.dot, { backgroundColor: colors.primary, opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }) }]}
      />
      <Text style={[styles.badgeText, { color: colors.onDeep }]}>जल्द आ रहा है</Text>
    </View>
  );
}

/** Phone mock whose reels auto-swipe upward, like a vertical feed. */
function ReelPhone() {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const feed = [IMG[0], IMG[1], IMG[2], IMG[0]]; // last = first, so the loop is seamless
  const y = useRef(new Animated.Value(0)).current;
  const nudge = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduced) {
      return;
    }
    const step = (i: number) =>
      Animated.sequence([
        Animated.delay(1100),
        Animated.timing(y, { toValue: -PHONE_H * i, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]);
    const feedLoop = Animated.loop(Animated.sequence([step(1), step(2), step(3)]));
    const nudgeLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(nudge, { toValue: 1, duration: 700, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(nudge, { toValue: 0, duration: 700, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ]),
    );
    feedLoop.start();
    nudgeLoop.start();
    return () => {
      feedLoop.stop();
      nudgeLoop.stop();
    };
  }, [y, nudge, reduced]);

  return (
    <View style={[styles.phone, { borderColor: colors.secondary }]}>
      <Animated.View style={{ transform: [{ translateY: y }] }}>
        {feed.map((src, i) => (
          <Image key={i} source={src} style={styles.reelImg} resizeMode="cover" />
        ))}
      </Animated.View>
      {/* Reel chrome */}
      <View style={styles.reelShade} pointerEvents="none" />
      <View style={styles.reelActions} pointerEvents="none">
        <Icon name="heart" size={15} color="#FFF6E8" />
        <Icon name="share" size={15} color="#FFF6E8" />
      </View>
      <View style={styles.reelBar} pointerEvents="none">
        <View style={styles.reelBarFill} />
      </View>
      {/* Swipe-up hint */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.swipeHint,
          {
            opacity: nudge.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }),
            transform: [{ translateY: nudge.interpolate({ inputRange: [0, 1], outputRange: [4, -6] }) }],
          },
        ]}>
        <View style={{ transform: [{ rotate: '180deg' }] }}>
          <Icon name="chevron-down" size={22} color="#FFF6E8" strokeWidth={2.4} />
        </View>
      </Animated.View>
    </View>
  );
}

/** One story avatar: gradient ring (saffron → gold) around a round picture. */
function StoryBubble({ src, label, live }: { src: ImageSourcePropType; label: string; live?: boolean }) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!live || reduced) {
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [live, pulse, reduced]);

  const SIZE = 50;
  return (
    <View style={styles.bubbleWrap}>
      <Animated.View
        style={[styles.bubbleBox, { transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.07] }) }] }]}>
        <Svg width={SIZE + 8} height={SIZE + 8} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#F0A24B" />
              <Stop offset="0.5" stopColor="#E4CA8E" />
              <Stop offset="1" stopColor="#B4400F" />
            </LinearGradient>
          </Defs>
          <Rect x="1.5" y="1.5" width={SIZE + 5} height={SIZE + 5} rx={(SIZE + 5) / 2} fill="none" stroke="url(#ring)" strokeWidth="3" />
        </Svg>
        <View style={[styles.bubbleInner, { backgroundColor: colors.artworkFallback }]}>
          <Image source={src} style={styles.bubbleImg} resizeMode="cover" />
        </View>
        {live && (
          <View style={[styles.playBadge, { backgroundColor: colors.primary, borderColor: colors.surface }]}>
            <Icon name="play" size={9} color={colors.onPrimary} />
          </View>
        )}
      </Animated.View>
      <Text style={[styles.bubbleLabel, { color: colors.textSecondary }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function Chip({ icon, label }: { icon: 'play' | 'headphones' | 'lyrics' | 'flame'; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.chip, { backgroundColor: colors.primarySoft }]}>
      <Icon name={icon} size={13} color={colors.primary} />
      <Text style={[styles.chipText, { color: colors.primary }]}>{label}</Text>
    </View>
  );
}

/**
 * Home-screen teaser for upcoming features: swipe-up Reels and Hanuman Katha Stories
 * (video + audio). Purely presentational — nothing here is interactive yet.
 */
export function ComingSoonSection() {
  const { colors } = useTheme();
  return (
    <View>
      <SectionHeader title="आने वाला अपडेट" />

      {/* Reels */}
      <View
        accessible
        accessibilityLabel="भक्ति रील्स। जल्द आ रहा है। ऊपर स्वाइप करके अगली रील देखें।"
        style={[styles.reelCard, { backgroundColor: colors.deep, borderColor: colors.secondary, ...elevation(colors.shadow, 2) }]}>
        <View style={styles.reelText}>
          <SoonBadge />
          <Text style={[styles.cardTitle, { color: colors.onDeep }]}>भक्ति रील्स</Text>
          <Text style={[styles.cardSub, { color: colors.onDeep }]}>
            ऊपर स्वाइप करें और अगली रील पाएं — भजन, चौपाई और दिव्य दर्शन छोटे वीडियो में।
          </Text>
          <View style={styles.swipeRow}>
            <Icon name="chevron-down" size={14} color={colors.primary} />
            <Text style={[styles.swipeText, { color: colors.primary }]}>Swipe up for next</Text>
          </View>
        </View>
        <ReelPhone />
      </View>

      {/* Stories */}
      <View
        accessible
        accessibilityLabel="हनुमान कथा स्टोरीज़। जल्द आ रहा है। वीडियो और ऑडियो के साथ।"
        style={[styles.storyCard, { backgroundColor: colors.surface, borderColor: colors.border, ...elevation(colors.shadow, 1) }]}>
        <View style={styles.storyHead}>
          <View style={styles.storyTitleBox}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>हनुमान कथा स्टोरीज़</Text>
            <Text style={[styles.cardSub, { color: colors.textSecondary }]}>
              हनुमान जी की अलग-अलग कथाएँ — वीडियो और ऑडियो के साथ।
            </Text>
          </View>
          <View style={[styles.badge, { borderColor: colors.secondary, backgroundColor: colors.primarySoft }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>जल्द आ रहा है</Text>
          </View>
        </View>

        <View style={styles.bubbles}>
          <StoryBubble src={IMG[0]} label="जन्म कथा" live />
          <StoryBubble src={IMG[1]} label="लंका दहन" />
          <StoryBubble src={IMG[2]} label="संजीवनी" />
          <StoryBubble src={IMG[3]} label="सीता खोज" />
          <StoryBubble src={IMG[4]} label="राम मिलन" />
        </View>

        <View style={styles.chips}>
          <Chip icon="play" label="वीडियो" />
          <Chip icon="headphones" label="ऑडियो" />
          <Chip icon="lyrics" label="कथा पाठ" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.xs + 2, height: 26, borderRadius: radii.pill, borderWidth: 1 },
  badgeText: { ...typography.label, fontWeight: '700' },
  dot: { width: 7, height: 7, borderRadius: 4 },

  reelCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radii.xl, borderWidth: 1, marginBottom: spacing.sm, overflow: 'hidden' },
  reelText: { flex: 1, minWidth: 0, gap: spacing.xs },
  cardTitle: { ...typography.title, fontSize: 20, lineHeight: 28 },
  cardSub: { ...typography.caption, opacity: 0.85 },
  swipeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  swipeText: { ...typography.label, fontWeight: '700', letterSpacing: 0.4 },

  phone: { width: PHONE_W, height: PHONE_H, borderRadius: 18, borderWidth: 2, overflow: 'hidden', backgroundColor: '#000' },
  reelImg: { width: PHONE_W, height: PHONE_H },
  reelShade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 70, backgroundColor: 'rgba(0,0,0,0.35)' },
  reelActions: { position: 'absolute', right: 6, bottom: 22, gap: 10, alignItems: 'center' },
  reelBar: { position: 'absolute', left: 8, right: 8, bottom: 8, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)' },
  reelBarFill: { width: '40%', height: 3, borderRadius: 2, backgroundColor: '#FFF6E8' },
  swipeHint: { position: 'absolute', alignSelf: 'center', bottom: 30 },

  storyCard: { borderRadius: radii.xl, borderWidth: 1, padding: spacing.md, gap: spacing.md },
  storyHead: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs },
  storyTitleBox: { flex: 1, minWidth: 0, gap: 2 },
  bubbles: { flexDirection: 'row', justifyContent: 'space-between' },
  bubbleWrap: { alignItems: 'center', width: 58, gap: 6 },
  bubbleBox: { width: 58, height: 58 },
  bubbleInner: { position: 'absolute', top: 4, left: 4, width: 50, height: 50, borderRadius: 25, overflow: 'hidden' },
  bubbleImg: { width: '100%', height: '100%' },
  playBadge: { position: 'absolute', right: 0, bottom: 0, width: 18, height: 18, borderRadius: 9, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  bubbleLabel: { ...typography.label, fontSize: 11 },
  chips: { flexDirection: 'row', gap: spacing.xs },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: spacing.xs + 2, height: 28, borderRadius: radii.pill },
  chipText: { ...typography.label, fontWeight: '700' },
});
