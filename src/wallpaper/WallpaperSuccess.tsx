import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { PressableScale } from '../components/PressableScale';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useTheme } from '../theme/ThemeProvider';
import { MIN_TOUCH, radii, spacing, typography } from '../theme/tokens';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const CHECK_LEN = 62; // approx length of the check path
const SPARKS = 14;
const BADGE = 112;

type Props = { visible: boolean; where: string; onDone: () => void };

/**
 * Celebration shown after the wallpaper is set: ripple rings, a springing gold
 * badge, a self-drawing check mark and a burst of sparks. Falls back to the
 * final frame when reduce-motion is on.
 */
export function WallpaperSuccess({ visible, where, onDone }: Props) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();

  const backdrop = useRef(new Animated.Value(0)).current;
  const badge = useRef(new Animated.Value(0)).current;
  const check = useRef(new Animated.Value(0)).current;
  const burst = useRef(new Animated.Value(0)).current;
  const text = useRef(new Animated.Value(0)).current;
  const rings = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (!visible) {
      [backdrop, badge, check, burst, text, ...rings].forEach(v => v.setValue(0));
      return;
    }
    if (reduced) {
      backdrop.setValue(1);
      badge.setValue(1);
      check.setValue(1);
      text.setValue(1);
      return;
    }
    const ease = Easing.out(Easing.cubic);
    Animated.parallel([
      Animated.timing(backdrop, { toValue: 1, duration: 320, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(120),
        Animated.spring(badge, { toValue: 1, friction: 5, tension: 70, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.delay(420),
        Animated.timing(check, { toValue: 1, duration: 520, easing: ease, useNativeDriver: false }),
      ]),
      Animated.sequence([
        Animated.delay(480),
        Animated.timing(burst, { toValue: 1, duration: 900, easing: ease, useNativeDriver: true }),
      ]),
      ...rings.map((r, i) =>
        Animated.sequence([
          Animated.delay(200 + i * 260),
          Animated.timing(r, { toValue: 1, duration: 1300, easing: ease, useNativeDriver: true }),
        ]),
      ),
      Animated.sequence([
        Animated.delay(780),
        Animated.timing(text, { toValue: 1, duration: 480, easing: ease, useNativeDriver: true }),
      ]),
    ]).start();
  }, [visible, reduced, backdrop, badge, check, burst, text, rings]);

  const sparks = useMemo(
    () =>
      Array.from({ length: SPARKS }, (_, i) => {
        const a = (i / SPARKS) * Math.PI * 2;
        const far = i % 2 === 0 ? 118 : 92;
        return { dx: Math.cos(a) * far, dy: Math.sin(a) * far, size: i % 2 === 0 ? 8 : 5 };
      }),
    [],
  );

  if (!visible) {
    return null;
  }

  const dash = check.interpolate({ inputRange: [0, 1], outputRange: [CHECK_LEN, 0] });

  return (
    <Animated.View style={[styles.root, { opacity: backdrop, backgroundColor: 'rgba(16,6,2,0.97)' }]}>
      <View style={styles.stage}>
        {rings.map((r, i) => (
          <Animated.View
            key={i}
            style={[
              styles.ring,
              {
                borderColor: colors.onDeep,
                opacity: r.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.55, 0] }),
                transform: [{ scale: r.interpolate({ inputRange: [0, 1], outputRange: [0.6, 2.6] }) }],
              },
            ]}
          />
        ))}

        {sparks.map((s, i) => (
          <Animated.View
            key={i}
            style={[
              styles.spark,
              {
                width: s.size,
                height: s.size,
                borderRadius: s.size / 2,
                backgroundColor: i % 3 === 0 ? colors.primary : colors.onDeep,
                opacity: burst.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0] }),
                transform: [
                  { translateX: burst.interpolate({ inputRange: [0, 1], outputRange: [0, s.dx] }) },
                  { translateY: burst.interpolate({ inputRange: [0, 1], outputRange: [0, s.dy] }) },
                  { scale: burst.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0.3, 1.2, 0.4] }) },
                ],
              },
            ]}
          />
        ))}

        <Animated.View style={[styles.badge, { transform: [{ scale: badge }] }]}>
          <Svg width={BADGE} height={BADGE} viewBox="0 0 112 112">
            <Circle cx="56" cy="56" r="54" fill={colors.primary} />
            <Circle cx="56" cy="56" r="48" fill="none" stroke={colors.onDeep} strokeWidth="2" opacity={0.85} />
            <Circle cx="56" cy="56" r="42" fill="none" stroke={colors.onDeep} strokeWidth="1" strokeDasharray="2 5" opacity={0.6} />
            <AnimatedPath
              d="M36 57 L50 71 L77 42"
              fill="none"
              stroke={colors.onPrimary}
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={`${CHECK_LEN}`}
              strokeDashoffset={dash as unknown as number}
            />
          </Svg>
        </Animated.View>
      </View>

      <Animated.View
        style={[
          styles.copy,
          { opacity: text, transform: [{ translateY: text.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }] },
        ]}>
        <Text style={[styles.title, { color: colors.onDeep }]} accessibilityRole="alert">
          वॉलपेपर सफलतापूर्वक सेट हो गया!
        </Text>
        <Text style={[styles.sub, { color: colors.onDeep }]}>{where} पर आपके प्रभु विराजमान हैं।</Text>
        <Text style={[styles.en, { color: colors.onDeep }]}>Wallpaper set successfully</Text>
        <Text style={[styles.jai, { color: colors.primary }]}>॥ जय श्री राम ॥</Text>

        <PressableScale
          onPress={onDone}
          accessibilityRole="button"
          accessibilityLabel="Done"
          style={[styles.btn, { backgroundColor: colors.primary }]}>
          <Text style={[styles.btnText, { color: colors.onPrimary }]}>ठीक है</Text>
        </PressableScale>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  stage: { width: BADGE, height: BADGE, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  ring: { position: 'absolute', width: BADGE, height: BADGE, borderRadius: BADGE / 2, borderWidth: 2 },
  spark: { position: 'absolute' },
  badge: { width: BADGE, height: BADGE },
  copy: { alignItems: 'center', gap: spacing.xs },
  title: { ...typography.title, textAlign: 'center' },
  sub: { ...typography.body, textAlign: 'center', opacity: 0.85 },
  en: { ...typography.caption, textAlign: 'center', opacity: 0.6, letterSpacing: 0.4 },
  jai: { ...typography.bodyStrong, marginTop: spacing.sm, letterSpacing: 1 },
  btn: {
    minHeight: MIN_TOUCH + 4,
    minWidth: 180,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  btnText: { ...typography.heading, fontWeight: '700' },
});
