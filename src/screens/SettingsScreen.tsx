import { StyleSheet, Text, View } from 'react-native';
import { APP_COLORS } from '../constants/colors';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: APP_COLORS.text,
    fontSize: 24,
    fontWeight: '700',
  },
});
