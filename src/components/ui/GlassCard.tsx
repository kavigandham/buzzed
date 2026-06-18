// Frosted-glass surface: a dark BlurView with a warm tint overlay and a hairline
// bronze border. The standard container for content blocks and list rows.
//
// NOTE: do not place this inside the Calendar's ViewShot capture subtree — BlurView
// does not capture reliably. Use a solid surface there instead.

import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

import { GLASS, RADII, SPACING } from '../../constants/theme';

interface Props {
  children: ReactNode;
  style?: StyleProp<ViewStyle>; // applied to the padded content layer
  intensity?: number;
  strong?: boolean; // more opaque tint (for modals over content)
  radius?: number;
}

export default function GlassCard({
  children,
  style,
  intensity = 22,
  strong = false,
  radius = RADII.lg,
}: Props) {
  return (
    <View style={[styles.wrap, { borderRadius: radius }]}>
      <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: strong ? GLASS.tintStrong : GLASS.tint },
        ]}
      />
      <View style={[styles.content, style]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  content: { padding: SPACING.lg },
});
