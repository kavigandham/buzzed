// Wraps content with a springy press-down/release scale animation (native driver).
// The shared press-feedback primitive for buttons, tiles and tappable rows.

import { ReactNode, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleProp,
  ViewStyle,
} from 'react-native';

interface Props {
  children: ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  scaleTo?: number;
  style?: StyleProp<ViewStyle>;
  hitSlop?: number;
}

export default function PressableScale({
  children,
  onPress,
  onLongPress,
  disabled,
  scaleTo = 0.96,
  style,
  hitSlop,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const animate = (toValue: number) =>
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: 40,
      bounciness: 7,
    }).start();

  return (
    <Pressable
      style={style}
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      hitSlop={hitSlop}
      onPressIn={() => !disabled && animate(scaleTo)}
      onPressOut={() => !disabled && animate(1)}
    >
      <Animated.View style={{ transform: [{ scale }], flexGrow: 1, alignSelf: 'stretch' }}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
