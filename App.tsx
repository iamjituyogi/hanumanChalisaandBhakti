/**
 * Hanuman Chalisa & Bhakti
 *
 * Provider order matters:
 *   Theme → UpdateGate (force-update check) → Library (persisted prefs and data) → Player (needs prefs) → Navigator
 *
 * @format
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppUpdateGate from './src/components/AppUpdateGate';
import { PlayerProvider } from './src/audio/PlayerProvider';
import { AppNavigator } from './src/navigation/AppNavigator';
import { LibraryProvider, useLibrary } from './src/state/LibraryProvider';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';

function Gate({ children }: { children: React.ReactNode }) {
  const { ready, colors } = useTheme();
  const { loaded } = useLibrary();
  // Wait for persisted theme and library (a few ms) so there is no flash of the wrong theme.
  if (!ready || !loaded) {
    return <View style={[styles.flex, { backgroundColor: colors.background }]} />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppUpdateGate>
          <LibraryProvider>
            <Gate>
              <PlayerProvider>
                <AppNavigator />
              </PlayerProvider>
            </Gate>
          </LibraryProvider>
        </AppUpdateGate>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });

export default App;
