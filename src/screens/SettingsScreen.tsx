import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayerActions } from '../audio/PlayerProvider';
import { FadeInView } from '../components/FadeInView';
import { Icon } from '../components/Icon';
import { IconButton } from '../components/IconButton';
import { Mandala } from '../components/Ornaments';
import { formatSpeed, PlaybackSpeedSelector } from '../components/PlaybackSpeedSelector';
import { ScreenHeader } from '../components/ScreenHeader';
import { SettingsRow, SettingsSection, SettingsSwitch } from '../components/SettingsSection';
import { ThemeSelector } from '../components/ThemeSelector';
import { APP_NAME, APP_VERSION } from '../config/app';
import { TOTAL_TRACKS } from '../data/tracks';
import { useAppNavigation } from '../navigation/NavigationContext';
import { useLibrary } from '../state/LibraryProvider';
import { useTheme } from '../theme/ThemeProvider';
import { elevation, MIN_TOUCH, radii, spacing, typography } from '../theme/tokens';

type InfoKey = 'about' | 'privacy' | null;

export function SettingsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { contentBottomInset } = useAppNavigation();
  const { prefs, updatePrefs, streak, listenDays, clearHistory } = useLibrary();
  const { setSpeed } = usePlayerActions();
  const [info, setInfo] = useState<InfoKey>(null);

  return (
    <>
      <ScrollView
        style={{ backgroundColor: colors.background }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + spacing.sm, paddingBottom: contentBottomInset }}>
        <FadeInView index={0}>
          <ScreenHeader title="सेटिंग्स" subtitle="अपनी पसंद" />
        </FadeInView>

        <View style={styles.body}>
          <FadeInView index={1}>
            <View style={[styles.brand, elevation(colors.shadow, 2), { backgroundColor: colors.deep }]}>
              <View style={styles.brandMandala} pointerEvents="none">
                <Mandala size={170} color={colors.onDeep} opacity={0.22} />
              </View>
              <View style={[styles.brandOm, { borderColor: colors.onDeep }]}>
                <Text style={[styles.brandOmText, { color: colors.onDeep }]}>ॐ</Text>
              </View>
              <View style={styles.brandText}>
                <Text style={[styles.brandName, { color: colors.onDeep }]} numberOfLines={1}>
                  {APP_NAME}
                </Text>
                <Text style={[styles.brandSub, { color: colors.onDeep }]}>
                  संस्करण {APP_VERSION} · {TOTAL_TRACKS} भजन
                </Text>
              </View>
            </View>
          </FadeInView>

          <FadeInView index={2}>
            <SettingsSection title="आपकी साधना">
              <SettingsRow
                icon="flame"
                title={`${streak} दिन की लगातार श्रद्धा`}
                subtitle={`अब तक कुल ${listenDays.length} दिन सुना`}
              />
              <SettingsRow icon="trash" title="सुनने का इतिहास मिटाएं" onPress={clearHistory} />
            </SettingsSection>
          </FadeInView>

          <FadeInView index={3}>
            <SettingsSection title="दिखावट">
              <ThemeSelector />
            </SettingsSection>
          </FadeInView>

          <FadeInView index={4}>
            <SettingsSection title="प्लेबैक">
              <SettingsRow
                icon="gauge"
                title="प्लेबैक गति"
                subtitle={`हर भजन ${formatSpeed(prefs.speed)} गति से चलेगा`}
                right={<PlaybackSpeedSelector value={prefs.speed} onChange={setSpeed} variant="row" />}
              />
              <SettingsRow
                icon="clock"
                title="जहां छोड़ा वहीं से सुनें"
                subtitle="भजन दोबारा खोलने पर पिछली जगह से शुरू करें"
                right={
                  <SettingsSwitch
                    label="जहां छोड़ा वहीं से सुनें"
                    value={prefs.resumePosition}
                    onValueChange={v => updatePrefs({ resumePosition: v })}
                  />
                }
              />
              <SettingsRow
                icon="skip-forward"
                title="अगला भजन स्वतः चलाएं"
                subtitle="एक भजन पूरा होने पर अगला शुरू करें"
                right={
                  <SettingsSwitch
                    label="अगला भजन स्वतः चलाएं"
                    value={prefs.autoplayNext}
                    onValueChange={v => updatePrefs({ autoplayNext: v })}
                  />
                }
              />
            </SettingsSection>
          </FadeInView>

          <FadeInView index={5}>
            <SettingsSection title="ऐप की जानकारी">
              <SettingsRow icon="info" title="ऐप के बारे में" onPress={() => setInfo('about')} right={<Chevron />} />
              <SettingsRow icon="shield" title="गोपनीयता" onPress={() => setInfo('privacy')} right={<Chevron />} />
            </SettingsSection>
          </FadeInView>
        </View>
      </ScrollView>

      <InfoSheet infoKey={info} onClose={() => setInfo(null)} />
    </>
  );
}

function Chevron() {
  const { colors } = useTheme();
  return <Icon name="chevron-right" size={18} color={colors.iconMuted} />;
}

function InfoSheet({ infoKey, onClose }: { infoKey: InfoKey; onClose: () => void }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const content =
    infoKey === 'about'
      ? {
          title: 'ऐप के बारे में',
          body: [
            `${APP_NAME} में श्री हनुमान चालीसा, बजरंग बाण, हनुमान अष्टक, आरती और भजन — कुल ${TOTAL_TRACKS} पाठ ऑडियो में उपलब्ध हैं।`,
            'हनुमान चालीसा के पूरे बोल और हर चौपाई का सरल हिंदी अर्थ भी दिया गया है। जाप काउंटर से माला गिनें और रोज़ का रिकॉर्ड देखें।',
            'सभी ऑडियो ऐप में ही मौजूद हैं, इसलिए बिना इंटरनेट के भी सुने जा सकते हैं।',
          ],
        }
      : infoKey === 'privacy'
      ? {
          title: 'गोपनीयता',
          body: [
            'यह ऐप आपसे कोई खाता या व्यक्तिगत जानकारी नहीं माँगता।',
            'आपकी पसंद, सुनने का इतिहास और जाप की गिनती केवल आपके फ़ोन में सुरक्षित रहती है।',
          ],
        }
      : null;

  return (
    <Modal visible={content != null} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }]} onPress={onClose} accessibilityLabel="बंद करें" />
      {content ? (
        <View style={[styles.sheet, { backgroundColor: colors.dialog, borderColor: colors.border, paddingBottom: insets.bottom + spacing.md }]}>
          <View style={[styles.handle, { backgroundColor: colors.borderStrong }]} />
          <View style={styles.sheetHead}>
            <Text style={[styles.sheetTitle, { color: colors.textPrimary }]} accessibilityRole="header">
              {content.title}
            </Text>
            <IconButton icon="close" onPress={onClose} accessibilityLabel="बंद करें" />
          </View>
          {content.body.map((p, i) => (
            <Text key={i} style={[styles.sheetBody, { color: colors.textSecondary }]}>
              {p}
            </Text>
          ))}
        </View>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: spacing.md, gap: spacing.md },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radii.xl, overflow: 'hidden' },
  brandMandala: { position: 'absolute', right: -50, top: -40 },
  brandOm: { width: 56, height: 56, borderRadius: 28, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  brandOmText: { fontSize: 28, fontWeight: '600' },
  brandText: { flex: 1, minWidth: 0 },
  brandName: { ...typography.heading, fontWeight: '700' },
  brandSub: { ...typography.caption, opacity: 0.85 },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, borderWidth: StyleSheet.hairlineWidth, padding: spacing.md, paddingTop: spacing.sm, gap: spacing.xs },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, marginBottom: spacing.xs },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: MIN_TOUCH },
  sheetTitle: { ...typography.title },
  sheetBody: { ...typography.body, marginBottom: spacing.xs },
});
