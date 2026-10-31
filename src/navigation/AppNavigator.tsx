/**
 * App navigation: @react-navigation bottom tabs with a custom floating tab
 * bar, a floating mini-player above it, and a full-screen player that slides
 * up over everything.
 *
 * Tab screens stay mounted once visited, so scroll positions are kept and
 * audio never restarts when switching tabs.
 */
import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNavigationContainerRef, DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, BackHandler, Easing, StatusBar, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayerState } from '../audio/PlayerProvider';
import { MINI_PLAYER_HEIGHT, MiniPlayer } from '../components/MiniPlayer';
import { FloatingTabBar, TAB_BAR_HEIGHT } from '../components/TabBar';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { BhajansScreen } from '../screens/BhajansScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { JaapScreen } from '../screens/JaapScreen';
import { PaathScreen } from '../screens/PaathScreen';
import { PlayerScreen } from '../screens/PlayerScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { useTheme } from '../theme/ThemeProvider';
import { NavigationContext, NavigationValue, TabKey, useAppNavigation } from './NavigationContext';

const Tab = createBottomTabNavigator();
const navRef = createNavigationContainerRef();

const SIDE = 14; // horizontal margin of the floating bar
const GAP = 8;

/** Floating mini-player and tab bar. A stable component so the bar is never remounted. */
function BottomChrome(props: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { openPlayer } = useAppNavigation();
  const { trackNumber } = usePlayerState();
  return (
    <View style={[styles.bottom, { paddingHorizontal: SIDE, paddingBottom: bottomOffsetFor(insets.bottom) }]} pointerEvents="box-none">
      {trackNumber != null ? <MiniPlayer onOpen={openPlayer} /> : null}
      <FloatingTabBar {...props} />
    </View>
  );
}

const renderTabBar = (props: BottomTabBarProps) => <BottomChrome {...props} />;

const bottomOffsetFor = (safeBottom: number) => Math.max(safeBottom, 10);

export function AppNavigator() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const reduced = useReducedMotion();
  const { trackNumber } = usePlayerState();

  const [tab, setTabState] = useState<TabKey>('home');
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerMounted, setPlayerMounted] = useState(false);
  const slide = useRef(new Animated.Value(0)).current; // 0 hidden, 1 shown

  const setTab = useCallback((next: TabKey) => {
    if (navRef.isReady()) {
      navRef.navigate(next as never);
    }
  }, []);

  const openPlayer = useCallback(() => {
    setPlayerMounted(true);
    setPlayerOpen(true);
    Animated.timing(slide, {
      toValue: 1,
      duration: reduced ? 0 : 380,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [reduced, slide]);

  const closePlayer = useCallback(() => {
    setPlayerOpen(false);
    Animated.timing(slide, {
      toValue: 0,
      duration: reduced ? 0 : 300,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => finished && setPlayerMounted(false));
  }, [reduced, slide]);

  // Android back closes the player first. Registered only while the player is
  // open so it runs before the navigator's own handler (tabs → Home → exit).
  useEffect(() => {
    if (!playerOpen) {
      return;
    }
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      closePlayer();
      return true;
    });
    return () => sub.remove();
  }, [playerOpen, closePlayer]);

  const miniVisible = trackNumber != null;
  const bottomOffset = bottomOffsetFor(insets.bottom);
  const contentBottomInset = bottomOffset + TAB_BAR_HEIGHT + (miniVisible ? MINI_PLAYER_HEIGHT + GAP : 0) + 20;

  const nav = useMemo<NavigationValue>(
    () => ({ tab, setTab, playerOpen, openPlayer, closePlayer, contentBottomInset }),
    [tab, setTab, playerOpen, openPlayer, closePlayer, contentBottomInset],
  );

  const navTheme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return { ...base, colors: { ...base.colors, background: colors.background, card: colors.navBackground, border: colors.navBorder, primary: colors.primary } };
  }, [colors, isDark]);

  return (
    <NavigationContext.Provider value={nav}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <NavigationContainer
          ref={navRef}
          theme={navTheme}
          onStateChange={() => {
            const route = navRef.getCurrentRoute() as { name: string } | undefined;
            const name = route?.name as TabKey | undefined;
            if (name) {
              setTabState(name);
            }
          }}>
          <Tab.Navigator
            initialRouteName="home"
            backBehavior="firstRoute"
            screenOptions={{ headerShown: false, animation: 'fade', sceneStyle: { backgroundColor: colors.background } }}
            tabBar={renderTabBar}>
            <Tab.Screen name="home" component={HomeScreen} />
            <Tab.Screen name="bhajans" component={BhajansScreen} />
            <Tab.Screen name="paath" component={PaathScreen} />
            <Tab.Screen name="jaap" component={JaapScreen} />
            <Tab.Screen name="settings" component={SettingsScreen} />
          </Tab.Navigator>
        </NavigationContainer>

        {playerMounted ? (
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { transform: [{ translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [height, 0] }) }] },
            ]}
            accessibilityViewIsModal>
            <PlayerScreen onClose={closePlayer} />
          </Animated.View>
        ) : null}
      </View>
    </NavigationContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, gap: GAP },
});
