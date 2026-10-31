import React from 'react';
import { StyleSheet, View } from 'react-native';
import { usePlayerActions, usePlayerState } from '../audio/PlayerProvider';
import { useTheme } from '../theme/ThemeProvider';
import { spacing } from '../theme/tokens';
import { IconButton } from './IconButton';
import { PlayPauseButton } from './PlayPauseButton';

/** −10s · Previous · Play/Pause · Next · +10s. */
export function AudioPlayerControls() {
  const { colors } = useTheme();
  const { status, hasPrevious, hasNext } = usePlayerState();
  const { togglePlayPause, previous, next, retry, seekBy } = usePlayerActions();

  return (
    <View style={styles.row}>
      <IconButton
        icon="rewind-10"
        size={28}
        color={colors.icon}
        onPress={() => seekBy(-10)}
        accessibilityLabel="10 सेकंड पीछे"
        style={styles.side}
      />
      <IconButton
        icon="skip-back"
        size={30}
        color={colors.icon}
        onPress={previous}
        disabled={!hasPrevious}
        accessibilityLabel="पिछला"
        style={styles.side}
      />
      <PlayPauseButton status={status} onPress={status === 'error' ? retry : togglePlayPause} size={76} />
      <IconButton
        icon="skip-forward"
        size={30}
        color={colors.icon}
        onPress={next}
        disabled={!hasNext}
        accessibilityLabel="अगला"
        style={styles.side}
      />
      <IconButton
        icon="forward-10"
        size={28}
        color={colors.icon}
        onPress={() => seekBy(10)}
        accessibilityLabel="10 सेकंड आगे"
        style={styles.side}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  side: { width: 50, height: 50 },
});
