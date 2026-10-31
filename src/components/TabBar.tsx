import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { TabKey } from '../navigation/NavigationContext';
import { useTheme } from '../theme/ThemeProvider';
import { elevation, radii } from '../theme/tokens';
import { Icon, IconName } from './Icon';

export const TAB_BAR_HEIGHT = 68;
const PAD = 6;

const TABS: Record<TabKey, { label: string; icon: IconName; activeIcon?: IconName }> = {
  home: { label: 'होम', icon: 'home' },
  bhajans: { label: 'भजन', icon: 'headphones' },
  paath: { label: 'पाठ', icon: 'book' },
  jaap: { label: 'जाप', icon: 'beads' },
  settings: { label: 'सेटिंग्स', icon: 'settings' },
};

/**
 * Floating pill tab bar for @react-navigation/bottom-tabs. A highlight pill
 * glides under the active tab and its icon springs up slightly.
 */
export function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const [width, setWidth] = useState(0);
  const x = useRef(new Animated.Value(state.index)).current;

  useEffect(() => {
    if (reduced) {
      x.setValue(state.index);
      return;
    }
    Animated.spring(x, { toValue: state.index, useNativeDriver: true, speed: 16, bounciness: 8 }).start();
  }, [state.index, reduced, x]);

  const itemW = width > 0 ? (width - PAD * 2) / state.routes.length : 0;
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View
      accessibilityRole="tablist"
      onLayout={onLayout}
      style={[
        styles.bar,
        elevation(colors.shadow, 3),
        { backgroundColor: colors.navBackground, borderColor: colors.navBorder },
      ]}>
      {itemW > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pill,
            {
              width: itemW,
              backgroundColor: colors.primarySoft,
              transform: [{ translateX: x.interpolate({ inputRange: [0, state.routes.length - 1], outputRange: [PAD, PAD + itemW * (state.routes.length - 1)] }) }],
            },
          ]}
        />
      ) : null}
      {state.routes.map((route, i) => {
        const key = route.name as TabKey;
        const tab = TABS[key];
        const selected = state.index === i;
        const color = selected ? colors.navActive : colors.navInactive;
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!selected && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };
        return (
          <TabItem
            key={route.key}
            label={tab.label}
            icon={selected && tab.activeIcon ? tab.activeIcon : tab.icon}
            color={color}
            selected={selected}
            onPress={onPress}
            onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
          />
        );
      })}
    </View>
  );
}

function TabItem({
  label,
  icon,
  color,
  selected,
  onPress,
  onLongPress,
}: {
  label: string;
  icon: IconName;
  color: string;
  selected: boolean;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const { colors } = useTheme();
  const lift = useRef(new Animated.Value(selected ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(lift, { toValue: selected ? 1 : 0, useNativeDriver: true, speed: 18, bounciness: 12 }).start();
  }, [selected, lift]);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      android_ripple={{ color: colors.border, borderless: true }}
      style={styles.item}>
      <Animated.View
        style={{
          transform: [
            { translateY: lift.interpolate({ inputRange: [0, 1], outputRange: [0, -1] }) },
            { scale: lift.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) },
          ],
        }}>
        <Icon name={icon} size={23} color={color} strokeWidth={selected ? 2 : 1.8} />
      </Animated.View>
      <Text style={[styles.label, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    height: TAB_BAR_HEIGHT,
    padding: PAD,
    borderRadius: radii.xl + 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
  pill: { position: 'absolute', top: PAD, bottom: PAD, left: 0, borderRadius: radii.xl },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  label: { fontSize: 11, lineHeight: 15 },
});
