import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DrinkProvider } from './src/contexts/DrinkContext';
import AppNavigator from './src/navigation/AppNavigator';
import { APP_COLORS } from './src/constants/colors';

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: APP_COLORS.background,
    card: APP_COLORS.surface,
    text: APP_COLORS.text,
    border: APP_COLORS.border,
    primary: APP_COLORS.accent,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <DrinkProvider>
        <NavigationContainer theme={navTheme}>
          <AppNavigator />
          <StatusBar style="light" />
        </NavigationContainer>
      </DrinkProvider>
    </SafeAreaProvider>
  );
}
