// Consistent screen title header with an optional right-aligned action.

import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { APP_COLORS } from '../../constants/colors';
import { SPACING, TYPE } from '../../constants/theme';

interface Props {
  title: string;
  right?: ReactNode;
}

export default function ScreenHeader({ title, right }: Props) {
  return (
    <View style={styles.row}>
      <Text style={[TYPE.title, styles.title]}>{title}</Text>
      {right ? <View>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  title: { color: APP_COLORS.text },
});
