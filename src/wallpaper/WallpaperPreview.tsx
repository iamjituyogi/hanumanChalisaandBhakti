import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Image, Modal, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { PressableScale } from '../components/PressableScale';
import { Wallpaper } from '../data/wallpapers';
import { useTheme } from '../theme/ThemeProvider';
import { MIN_TOUCH, radii, spacing, typography } from '../theme/tokens';
import { applyWallpaper, pendingSuccess, WallpaperTarget } from './setWallpaper';
import { WallpaperSuccess } from './WallpaperSuccess';

const FEATHER_STEPS = 16;

type Option = { key: WallpaperTarget; title: string; en: string; where: string };

const OPTIONS: Option[] = [
  { key: 'system', title: 'होम स्क्रीन', en: 'Home', where: 'होम स्क्रीन' },
  { key: 'lock', title: 'लॉक स्क्रीन', en: 'Lock', where: 'लॉक स्क्रीन' },
  { key: 'both', title: 'दोनों', en: 'Both', where: 'होम और लॉक स्क्रीन' },
];

/** Tiny phone drawing that shows which screen(s) the wallpaper will land on. */
function PhoneGlyph({ kind, color, fill }: { kind: WallpaperTarget; color: string; fill: string }) {
  const showHome = kind !== 'lock';
  const showLock = kind !== 'system';
  return (
    <Svg width={34} height={58} viewBox="0 0 34 58">
      <Rect x="1.5" y="1.5" width="31" height="55" rx="6" fill={fill} stroke={color} strokeWidth="2" />
      {showLock && <Rect x="9" y="9" width="16" height="5" rx="2.5" fill={color} />}
      {showHome &&
        [0, 1, 2].flatMap(r =>
          [0, 1, 2].map(c => (
            <Circle key={`${r}${c}`} cx={9 + c * 8} cy={(showLock ? 24 : 15) + r * 8} r="2.4" fill={color} opacity={0.9} />
          )),
        )}
      <Rect x="11" y="51" width="12" height="2" rx="1" fill={color} opacity={0.7} />
    </Svg>
  );
}

/**
 * Mirrors exactly what gets set as the wallpaper: the image fitted to the full screen width,
 * with a blurred copy filling the space above and below (see WallpaperAssetModule.kt).
 */
function WallpaperCanvas({ image }: { image: Wallpaper['image'] }) {
  const { width, height } = useWindowDimensions();
  const src = Image.resolveAssetSource(image);
  const fitH = src?.width && src?.height ? (src.height * width) / src.width : height;
  const top = (height - fitH) / 2;
  const feather = Math.min(fitH / 8, width * 0.2); // keep in sync with WallpaperAssetModule.kt
  const step = feather / FEATHER_STEPS;

  // A slice of the sharp image at [y, y+h) of its own height, drawn at the given opacity.
  const slice = (key: string, y: number, h: number, opacity: number) => (
    <View key={key} style={{ position: 'absolute', left: 0, width, top: top + y, height: h, opacity, overflow: 'hidden' }}>
      <Image source={image} resizeMode="cover" style={{ position: 'absolute', left: 0, top: -y, width, height: fitH }} />
    </View>
  );

  const slices = [slice('mid', feather, fitH - feather * 2, 1)];
  for (let i = 0; i < FEATHER_STEPS; i++) {
    const o = (i + 0.5) / FEATHER_STEPS;
    slices.push(slice(`t${i}`, i * step, step + 0.5, o));
    slices.push(slice(`b${i}`, fitH - (i + 1) * step, step + 0.5, o));
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      <Image source={image} style={StyleSheet.absoluteFill} resizeMode="cover" blurRadius={28} />
      {slices}
    </View>
  );
}

type Props = {
  wallpaper: Wallpaper | null;
  /** Open straight on the success screen (replayed after the app returns to the foreground). */
  initialSuccess?: WallpaperTarget | null;
  onClose: () => void;
};

export function WallpaperPreview({ wallpaper, initialSuccess, onClose }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [target, setTarget] = useState<WallpaperTarget>('both');
  const [phase, setPhase] = useState<'idle' | 'applying' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);

  // Live preview overlay cross-fades: lock clock / home icon grid.
  const lockOp = useRef(new Animated.Value(1)).current;
  const homeOp = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(lockOp, { toValue: target === 'system' ? 0 : 1, duration: 220, useNativeDriver: true }),
      Animated.timing(homeOp, { toValue: target === 'lock' ? 0 : 1, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [target, lockOp, homeOp]);

  useEffect(() => {
    if (wallpaper) {
      setTarget(initialSuccess ?? 'both');
      setPhase(initialSuccess ? 'success' : 'idle');
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallpaper]);

  if (!wallpaper) {
    return null;
  }
  const busy = phase === 'applying';
  const current = OPTIONS.find(o => o.key === target)!;

  const save = async () => {
    setError(null);
    setPhase('applying');
    try {
      // Hold briefly so the "applying" state is perceptible even when the set is instant.
      await Promise.all([applyWallpaper(wallpaper.image, target), new Promise<void>(r => setTimeout(r, 700))]);
      pendingSuccess.set({ wallpaperId: wallpaper.id, target });
      setPhase('success');
    } catch {
      setPhase('idle');
      setError('वॉलपेपर सेट नहीं हो सका। कृपया पुनः प्रयास करें।');
    }
  };

  return (
    <Modal visible animationType="fade" statusBarTranslucent onRequestClose={() => {
        if (!busy) {
          onClose();
        }
      }}>
      <View style={[styles.flex, { backgroundColor: colors.deep }]}>
        <WallpaperCanvas image={wallpaper.image} />

        {/* Fake lock-screen clock */}
        <Animated.View pointerEvents="none" style={[styles.lockClock, { top: insets.top + 90, opacity: lockOp }]}>
          <Text style={styles.time}>10:08</Text>
          <Text style={styles.date}>मंगलवार, हनुमान जयंती</Text>
        </Animated.View>

        {/* Fake home-screen app grid */}
        <Animated.View pointerEvents="none" style={[styles.homeGrid, { opacity: homeOp, top: insets.top + 230 }]}>
          {Array.from({ length: 4 }, (_, i) => (
            <View key={i} style={styles.appIcon} />
          ))}
        </Animated.View>

        <View style={[styles.topShade, { height: insets.top + 90 }]} pointerEvents="none" />

        <PressableScale
          onPress={onClose}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="बंद करें"
          style={[styles.close, { top: insets.top + spacing.xs }]}>
          <Icon name="close" size={22} color="#FFF6E8" />
        </PressableScale>

        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md, borderColor: colors.secondary }]}>
          <View style={[styles.grabber, { backgroundColor: colors.secondary }]} />
          <Text style={[styles.name, { color: colors.onDeep }]}>{wallpaper.title}</Text>
          <Text style={styles.tag}>{wallpaper.subtitle}</Text>

          <Text style={styles.ask}>कहाँ लगाना चाहेंगे?</Text>
          <View style={styles.options} accessibilityRole="radiogroup">
            {OPTIONS.map(o => {
              const on = o.key === target;
              return (
                <PressableScale
                  key={o.key}
                  disabled={busy}
                  onPress={() => setTarget(o.key)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={`${o.title}, ${o.en}`}
                  style={[
                    styles.option,
                    on
                      ? { backgroundColor: 'rgba(240,162,75,0.16)', borderColor: colors.primary }
                      : { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.14)' },
                  ]}>
                  <PhoneGlyph kind={o.key} color={on ? colors.primary : '#CDBFA6'} fill="rgba(0,0,0,0.25)" />
                  <Text style={[styles.optTitle, { color: on ? '#FFF6E8' : '#D9CDB6' }]}>{o.title}</Text>
                  <Text style={[styles.optEn, { color: on ? colors.primary : '#9C917D' }]}>{o.en}</Text>
                  {on && (
                    <View style={[styles.tick, { backgroundColor: colors.primary }]}>
                      <Icon name="check" size={12} color={colors.onPrimary} strokeWidth={3} />
                    </View>
                  )}
                </PressableScale>
              );
            })}
          </View>

          {error && (
            <View style={[styles.error, { backgroundColor: colors.dangerSurface }]} accessibilityRole="alert">
              <Icon name="alert" size={16} color={colors.danger} />
              <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
            </View>
          )}

          <PressableScale
            onPress={save}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel={`Set wallpaper on ${current.en}`}
            style={[styles.cta, { backgroundColor: colors.primary, opacity: busy ? 0.85 : 1 }]}>
            {busy ? (
              <>
                <ActivityIndicator color={colors.onPrimary} />
                <Text style={[styles.ctaText, { color: colors.onPrimary }]}>सेट हो रहा है…</Text>
              </>
            ) : (
              <>
                <Icon name="check" size={20} color={colors.onPrimary} strokeWidth={2.4} />
                <Text style={[styles.ctaText, { color: colors.onPrimary }]}>वॉलपेपर सेट करें</Text>
              </>
            )}
          </PressableScale>
        </View>

        <WallpaperSuccess
          visible={phase === 'success'}
          where={current.where}
          onDone={() => {
            pendingSuccess.clear();
            onClose();
          }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topShade: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: 'rgba(10,4,1,0.35)' },
  close: {
    position: 'absolute',
    left: spacing.md,
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    borderRadius: MIN_TOUCH / 2,
    backgroundColor: 'rgba(10,4,1,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockClock: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  time: { fontSize: 72, lineHeight: 80, fontWeight: '300', color: '#FFF6E8', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 12 },
  date: { ...typography.bodyStrong, color: '#FFF6E8', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 8 },
  homeGrid: { position: 'absolute', left: spacing.lg, right: spacing.lg, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.md },
  appIcon: { width: 52, height: 52, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.22)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(18,8,4,0.9)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
  },
  grabber: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, opacity: 0.7, marginBottom: spacing.sm },
  name: { ...typography.title, textAlign: 'center' },
  tag: { ...typography.caption, textAlign: 'center', color: '#B9AD96', marginBottom: spacing.md },
  ask: { ...typography.label, color: '#B9AD96', marginBottom: spacing.xs },
  options: { flexDirection: 'row', gap: spacing.xs },
  option: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: spacing.sm, borderRadius: radii.lg, borderWidth: 1.5 },
  optTitle: { ...typography.bodyStrong, fontSize: 14, marginTop: 6 },
  optEn: { ...typography.label },
  tick: { position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  error: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm, padding: spacing.xs, borderRadius: radii.md },
  errorText: { ...typography.caption, flex: 1 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, minHeight: MIN_TOUCH + 8, borderRadius: radii.pill, marginTop: spacing.md },
  ctaText: { ...typography.heading, fontWeight: '700' },
});
