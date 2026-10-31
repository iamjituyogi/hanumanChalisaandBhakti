import React, { useMemo, useRef, useState } from 'react';
import {
  AccessibilityActionEvent,
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { usePlayerActions, usePlayerProgress, usePlayerState } from '../audio/PlayerProvider';
import { useTheme } from '../theme/ThemeProvider';
import { spacing, typography } from '../theme/tokens';
import { clamp, formatTime, progressRatio } from '../utils/time';

const THUMB = 16;
const A11Y_STEP_S = 15;

/**
 * Seekable progress bar driven by real player position and duration.
 * Dragging previews the target time locally and seeks once, on release.
 */
export function AudioProgressBar() {
  const { colors } = useTheme();
  const { duration, status } = usePlayerState();
  const { position, buffered } = usePlayerProgress();
  const { seekTo } = usePlayerActions();

  const [width, setWidth] = useState(0);
  const [dragRatio, setDragRatio] = useState<number | null>(null);
  const widthRef = useRef(0);
  const durationRef = useRef(duration);
  durationRef.current = duration;

  const canSeek = duration > 0 && status !== 'error' && status !== 'loading';
  const canSeekRef = useRef(canSeek);
  canSeekRef.current = canSeek;

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => canSeekRef.current,
        onMoveShouldSetPanResponder: () => canSeekRef.current,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: e => {
          setDragRatio(clamp(e.nativeEvent.locationX / (widthRef.current || 1), 0, 1));
        },
        onPanResponderMove: e => {
          setDragRatio(clamp(e.nativeEvent.locationX / (widthRef.current || 1), 0, 1));
        },
        onPanResponderRelease: e => {
          const r = clamp(e.nativeEvent.locationX / (widthRef.current || 1), 0, 1);
          seekTo(r * durationRef.current);
          setDragRatio(null);
        },
        onPanResponderTerminate: () => setDragRatio(null),
      }),
    [seekTo],
  );

  const onLayout = (e: LayoutChangeEvent) => {
    widthRef.current = e.nativeEvent.layout.width;
    setWidth(e.nativeEvent.layout.width);
  };

  const ratio = dragRatio ?? progressRatio(position, duration);
  const bufferedRatio = progressRatio(buffered, duration);
  const shownPosition = dragRatio != null ? dragRatio * duration : position;

  const onAccessibilityAction = (e: AccessibilityActionEvent) => {
    if (!canSeek) {
      return;
    }
    const delta = e.nativeEvent.actionName === 'increment' ? A11Y_STEP_S : -A11Y_STEP_S;
    seekTo(clamp(position + delta, 0, duration));
  };

  return (
    <View>
      <View
        style={styles.touchArea}
        onLayout={onLayout}
        {...responder.panHandlers}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel="प्रगति पट्टी"
        accessibilityHint="आगे या पीछे जाने के लिए ऊपर या नीचे स्वाइप करें"
        accessibilityValue={{
          min: 0,
          max: Math.round(duration),
          now: Math.round(position),
          text: `${formatTime(position)} / ${formatTime(duration)}`,
        }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={onAccessibilityAction}>
        <View style={[styles.track, { backgroundColor: colors.progressTrack }]} pointerEvents="none">
          <View
            style={[styles.fill, { width: `${bufferedRatio * 100}%`, backgroundColor: colors.progressBuffered }]}
          />
          <View style={[styles.fill, { width: `${ratio * 100}%`, backgroundColor: colors.progressFill }]} />
        </View>
        {width > 0 && canSeek ? (
          <View
            pointerEvents="none"
            style={[
              styles.thumb,
              {
                left: ratio * width - THUMB / 2,
                backgroundColor: colors.progressFill,
                borderColor: colors.background,
                transform: [{ scale: dragRatio != null ? 1.3 : 1 }],
              },
            ]}
          />
        ) : null}
      </View>
      <View style={styles.times}>
        <Text style={[styles.time, { color: colors.textSecondary }]}>{formatTime(shownPosition)}</Text>
        <Text style={[styles.time, { color: colors.textSecondary }]}>
          {duration > 0 ? formatTime(duration) : '--:--'}
        </Text>
      </View>
    </View>
  );
}

/** Thin, non-interactive progress line used by the mini-player. */
export function MiniProgressLine() {
  const { colors } = useTheme();
  const { duration } = usePlayerState();
  const { position } = usePlayerProgress();
  return (
    <View style={[styles.miniTrack, { backgroundColor: colors.progressTrack }]}>
      <View
        style={[
          styles.fill,
          { width: `${progressRatio(position, duration) * 100}%`, backgroundColor: colors.progressFill },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  touchArea: { height: 40, justifyContent: 'center' },
  track: { height: 4, borderRadius: 2, overflow: 'hidden' },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 2 },
  thumb: {
    position: 'absolute',
    top: 20 - THUMB / 2,
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    borderWidth: 2,
  },
  times: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -spacing.xxs },
  time: { ...typography.caption, fontVariant: ['tabular-nums'] },
  miniTrack: { height: 2, overflow: 'hidden' },
});
