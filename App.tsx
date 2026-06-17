import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { DrinkProvider } from './src/contexts/DrinkContext';

export default function App() {
  return (
    <DrinkProvider>
      <View style={styles.container}>
        <Text>Buzzed. — coming together.</Text>
        <StatusBar style="auto" />
      </View>
    </DrinkProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
