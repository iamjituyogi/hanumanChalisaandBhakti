import React, { useEffect, useState } from 'react';
import { BackHandler, Linking, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { APP_NAME } from '../config/app';
import { useTheme } from '../theme/ThemeProvider';
import { radii, spacing, typography } from '../theme/tokens';
import { isValidStoreUrl } from '../utils/appVersion';
import { Mandala } from './Ornaments';
import { PressableScale } from './PressableScale';

const PLAY_STORE_LISTING_URL =
  'https://play.google.com/store/apps/details?id=com.hanumanchalisaandbhakti';
const DEFAULT_MESSAGE =
  'बेहतर अनुभव और नई सुविधाओं के लिए कृपया ऐप का नया संस्करण अपडेट करें।';
const OPEN_ERROR =
  'स्टोर नहीं खुल सका। कृपया प्ले स्टोर खोलकर ऐप को मैन्युअली अपडेट करें।';

type Props = {
  installedVersion: string;
  requiredVersion: string | null;
  message: string | null;
  storeUrl: string | null;
};

function VersionRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[typography.body, { color: colors.textSecondary }]}>{label}</Text>
      <View style={[styles.badge, { backgroundColor: highlight ? colors.primarySoft : colors.surfaceMuted }]}>
        <Text style={[typography.bodyStrong, { color: highlight ? colors.primary : colors.textPrimary }]}>
          {value?.trim() || '—'}
        </Text>
      </View>
    </View>
  );
}

/**
 * Mandatory update screen. AppUpdateGate renders it IN PLACE of the whole app
 * (not a dismissible modal), so there is no close button, navigation or "later";
 * only the hardware back button needs swallowing. It disappears by itself once
 * the installed version is current.
 */
export default function UpdateModal({ installedVersion, requiredVersion, message, storeUrl }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  const handleUpdate = async () => {
    setError(null);
    const url = isValidStoreUrl(storeUrl) ? storeUrl : PLAY_STORE_LISTING_URL;
    try {
      await Linking.openURL(url);
    } catch {
      setError(OPEN_ERROR);
    }
  };

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mandala}>
          <Mandala size={96} color={colors.secondary} opacity={0.9} />
        </View>
        <Text accessibilityRole="header" style={[typography.title, styles.center, { color: colors.textPrimary }]}>
          अपडेट उपलब्ध है
        </Text>
        <Text style={[typography.heading, styles.center, { color: colors.primary }]}>{APP_NAME}</Text>
        <Text style={[typography.body, styles.center, { color: colors.textSecondary }]}>
          {message || DEFAULT_MESSAGE}
        </Text>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <VersionRow label="वर्तमान संस्करण" value={installedVersion} />
          <VersionRow label="नया संस्करण" value={requiredVersion ?? ''} highlight />
        </View>

        {error ? (
          <Text accessibilityRole="alert" style={[typography.caption, styles.center, { color: colors.danger }]}>
            {error}
          </Text>
        ) : null}

        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="अभी अपडेट करें"
          onPress={handleUpdate}
          style={[styles.button, { backgroundColor: colors.primary }]}
        >
          <Text style={[typography.bodyStrong, { color: colors.onPrimary }]}>
            {Platform.OS === 'ios' ? 'App Store खोलें' : 'अभी अपडेट करें'}
          </Text>
        </PressableScale>
        <Text style={[typography.caption, styles.center, { color: colors.textTertiary }]}>
          यह अपडेट अनिवार्य है
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', gap: spacing.md, paddingHorizontal: spacing.lg },
  mandala: { alignSelf: 'center' },
  center: { textAlign: 'center' },
  card: { borderWidth: 1, borderRadius: radii.lg, padding: spacing.md, gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs, borderRadius: radii.pill },
  button: { minHeight: 52, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center' },
});
