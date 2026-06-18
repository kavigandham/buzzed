// Cross-platform glow wrapper. iOS renders a colored shadow; Android (which
// ignores colored shadows) gets a soft translucent halo layer behind the child
// plus neutral elevation for depth. Used by GradientButton and the LevelMeter.

import { ReactNode } from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';

import { withAlpha } from '../../constants/theme';

interface Props {
  color: string;
  intensity?: number; // shadow opacity on iOS (0..1)
  radius?: number; // shadow blur radius on iOS
  children: ReactNode;
  style?: ViewStyle;
}

export default function Glow({ color, intensity = 0.55, radius = 22, children, style }: Props) {
  const ios = {
    shadowColor: color,
    shadowOpacity: intensity,
    shadowRadius: radius,
    shadowOffset: { width: 0, height: 0 },
  };

  if (Platform.OS === 'ios') {
    return <View style={[ios, style]}>{children}</View>;
  }

  // Android: halo behind + neutral elevation.
  return (
    <View style={[styles.androidWrap, style]}>
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          styles.halo,
          { backgroundColor: withAlpha(color, Math.min(0.4, intensity * 0.6)) },
        ]}
      />
      <View style={styles.androidElevation}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  androidWrap: { position: 'relative' },
  halo: { borderRadius: 24, transform: [{ scale: 1.06 }] },
  androidElevation: { elevation: 8 },
});
