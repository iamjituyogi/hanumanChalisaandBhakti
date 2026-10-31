import React from 'react';
import { ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { CHALISA } from '../data/chalisa';
import { useLibrary } from '../state/LibraryProvider';
import { useTheme } from '../theme/ThemeProvider';
import { MIN_TOUCH, radii, spacing, typography } from '../theme/tokens';
import { Icon } from './Icon';
import { IconButton } from './IconButton';
import { OrnamentDivider } from './Ornaments';

const MIN_SIZE = 16;
const MAX_SIZE = 32;

/** Hindi lyrics of the Chalisa, optionally with the meaning under each verse. */
export function LyricsView({ withMeaning }: { withMeaning: boolean }) {
  const { colors } = useTheme();
  const { prefs, updatePrefs } = useLibrary();
  const size = prefs.lyricsSize;

  const shareAll = () => {
    const text = CHALISA.map(v => `${v.lines.join('\n')}${withMeaning ? `\n(${v.meaning})` : ''}`).join('\n\n');
    Share.share({ title: 'श्री हनुमान चालीसा', message: `${text}\n\n🙏 जय श्री राम 🙏` });
  };

  return (
    <View style={styles.flex}>
      <View style={styles.tools}>
        <IconButton
          icon="minus"
          size={20}
          disabled={size <= MIN_SIZE}
          onPress={() => updatePrefs({ lyricsSize: size - 2 })}
          accessibilityLabel="अक्षर छोटे करें"
        />
        <Icon name="type" size={20} color={colors.secondary} />
        <IconButton
          icon="plus"
          size={20}
          disabled={size >= MAX_SIZE}
          onPress={() => updatePrefs({ lyricsSize: size + 2 })}
          accessibilityLabel="अक्षर बड़े करें"
        />
        <View style={styles.flex} />
        <IconButton icon="share" size={20} onPress={shareAll} accessibilityLabel="पूरी चालीसा शेयर करें" />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {CHALISA.map(v => (
          <View key={v.id} style={styles.verse}>
            <Text style={[styles.label, { color: colors.secondary }]}>{v.label}</Text>
            <Text style={[styles.lines, { color: colors.textPrimary, fontSize: size, lineHeight: size * 1.65 }]} selectable>
              {v.lines.join('\n')}
            </Text>
            {withMeaning ? (
              <View style={[styles.meaning, { backgroundColor: colors.primarySoft }]}>
                <Text style={[styles.meaningText, { color: colors.textSecondary, fontSize: Math.max(14, size - 4), lineHeight: Math.max(14, size - 4) * 1.55 }]} selectable>
                  {v.meaning}
                </Text>
              </View>
            ) : null}
            <OrnamentDivider width={70} />
          </View>
        ))}
        <Text style={[styles.end, { color: colors.secondary }]}>॥ जय श्री राम ॥</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tools: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xs, minHeight: MIN_TOUCH },
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  verse: { alignItems: 'center', gap: spacing.xs, marginBottom: spacing.md },
  label: { ...typography.label },
  lines: { textAlign: 'center', fontWeight: '600' },
  meaning: { borderRadius: radii.md, padding: spacing.sm, alignSelf: 'stretch' },
  meaningText: { textAlign: 'center' },
  end: { ...typography.title, textAlign: 'center', marginTop: spacing.sm },
});
