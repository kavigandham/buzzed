import { StyleSheet, Text, View } from 'react-native';
import { APP_COLORS } from '../constants/colors';

export default function MainScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buzzed.</Text>
      <Text style={styles.subtitle}>Home</Text>
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
    fontSize: 40,
    fontWeight: '800',
  },
  subtitle: {
    color: APP_COLORS.textSecondary,
    fontSize: 16,
    marginTop: 8,
  },
});
