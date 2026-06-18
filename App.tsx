import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DrinkProvider, useDrink } from './src/contexts/DrinkContext';
import AppNavigator from './src/navigation/AppNavigator';
import AgeGateScreen from './src/screens/AgeGateScreen';
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

// Decides what to show once storage has loaded: the first-launch age gate until
// the user accepts, otherwise the main tab app. Renders nothing while loading to
// avoid a flash of the wrong surface.
function Root() {
  const { isLoading, hasAcceptedLegal } = useDrink();

  if (isLoading) return null;
  if (!hasAcceptedLegal) return <AgeGateScreen />;

  return (
    <NavigationContainer theme={navTheme}>
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <DrinkProvider>
        <Root />
        <StatusBar style="light" />
      </DrinkProvider>
    </SafeAreaProvider>
  );
}
