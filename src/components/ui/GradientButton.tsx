// Primary action button for the warm redesign. `primary` renders a glowing
// bronze gradient with dark text; `outline` / `danger` are bordered text buttons.
// Built on PressableScale for springy press feedback.

import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { APP_COLORS } from '../../constants/colors';
import { GRADIENTS, RADII, SPACING, TYPE } from '../../constants/theme';
import PressableScale from './PressableScale';
import Glow from './Glow';

type Variant = 'primary' | 'outline' | 'danger';

interface Props {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function GradientButton({
  title,
  onPress,
  variant = 'primary',
  disabled,
  style,
}: Props) {
  if (variant === 'primary') {
    return (
      <PressableScale onPress={onPress} disabled={disabled} style={style}>
        <Glow color={APP_COLORS.accent} intensity={0.5} radius={18}>
          <LinearGradient
            colors={GRADIENTS.button}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.base, disabled && styles.disabled]}
          >
            <Text style={[styles.text, { color: APP_COLORS.onAccent }]}>{title}</Text>
          </LinearGradient>
        </Glow>
      </PressableScale>
    );
  }

  const color = variant === 'danger' ? APP_COLORS.danger : APP_COLORS.accent;
  return (
    <PressableScale onPress={onPress} disabled={disabled} style={style}>
      <View style={[styles.base, styles.bordered, { borderColor: color }, disabled && styles.disabled]}>
        <Text style={[styles.text, { color }]}>{title}</Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: RADII.md,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bordered: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  disabled: { opacity: 0.5 },
  text: { ...TYPE.body, fontSize: 17, fontWeight: '800' },
});
