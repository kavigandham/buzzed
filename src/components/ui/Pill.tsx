// Category / segmented filter pill. Consolidates the duplicated pill styling that
// lived in Library, the Cabinet sort selector and the DrinkSelectionModal.

import { StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';

import { APP_COLORS } from '../../constants/colors';
import { RADII, TYPE } from '../../constants/theme';
import PressableScale from './PressableScale';

interface Props {
  label: string;
  active?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function Pill({ label, active, onPress, style }: Props) {
  return (
    <PressableScale onPress={onPress} scaleTo={0.93} style={style}>
      <PillBody label={label} active={active} />
    </PressableScale>
  );
}

function PillBody({ label, active }: { label: string; active?: boolean }) {
  return (
    <Text
      numberOfLines={1}
      style={[styles.pill, active ? styles.active : styles.inactive, active ? styles.textActive : styles.textInactive]}
    >
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  pill: {
    ...TYPE.body,
    fontSize: 14,
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    overflow: 'hidden',
  },
  active: { backgroundColor: APP_COLORS.accent, borderColor: APP_COLORS.accent },
  inactive: { backgroundColor: APP_COLORS.surface, borderColor: APP_COLORS.border },
  textActive: { color: APP_COLORS.onAccent },
  textInactive: { color: APP_COLORS.textSecondary },
});
