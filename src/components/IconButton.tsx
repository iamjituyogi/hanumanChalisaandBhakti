import React from 'react';
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { MIN_TOUCH } from '../theme/tokens';
import { Icon, IconName } from './Icon';

type Props = {
  icon: IconName;
  onPress: () => void;
  accessibilityLabel: string;
  color?: string;
  size?: number;
  disabled?: boolean;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Icon-only control with a 48dp touch target and a required accessibility label. */
export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  color,
  size = 24,
  disabled,
  selected,
  style,
}: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled, selected }}
      hitSlop={4}
      android_ripple={{ color: colors.border, borderless: true, radius: MIN_TOUCH / 2 + 2 }}
      style={({ pressed }) => [
        styles.base,
        { opacity: disabled ? 0.35 : pressed ? 0.6 : 1 },
        style,
      ]}>
      <Icon name={icon} size={size} color={color ?? colors.icon} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minWidth: MIN_TOUCH,
    minHeight: MIN_TOUCH,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
