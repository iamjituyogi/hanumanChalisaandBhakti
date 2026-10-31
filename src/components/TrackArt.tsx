import React, { useState } from 'react';
import { Image, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { getTrack } from '../data/tracks';
import { useTheme } from '../theme/ThemeProvider';

type Props = {
  track: number;
  style?: StyleProp<ViewStyle>;
  radius?: number;
};

/**
 * Bundled track artwork, cropped to fill its box. If the image fails to
 * decode it falls back to a warm panel with Om.
 */
export function TrackArt({ track, style, radius = 12 }: Props) {
  const { colors } = useTheme();
  const [failed, setFailed] = useState(false);
  const item = getTrack(track);

  return (
    <View
      style={[styles.frame, { borderRadius: radius, backgroundColor: colors.artworkFallback }, style]}
      accessibilityIgnoresInvertColors>
      {item && !failed ? (
        <Image source={item.image} style={styles.image} resizeMode="cover" onError={() => setFailed(true)} accessible={false} />
      ) : (
        <View style={styles.fallback}>
          <Text style={[styles.om, { color: colors.secondary }]}>ॐ</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  om: { fontSize: 24, fontWeight: '600' },
});
