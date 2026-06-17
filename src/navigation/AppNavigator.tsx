// Bottom tab navigator: Home | Library | Cabinet | Calendar | Settings.
// Dark theme tab bar. Icons from Expo's Ionicons.
// Stack is intentionally not introduced yet — modals come in a later phase.

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { APP_COLORS } from '../constants/colors';
import MainScreen from '../screens/MainScreen';
import DrinkLibraryScreen from '../screens/DrinkLibraryScreen';
import MyCabinetScreen from '../screens/MyCabinetScreen';
import CalendarScreen from '../screens/CalendarScreen';
import SettingsScreen from '../screens/SettingsScreen';

export type RootTabParamList = {
  Home: undefined;
  Library: undefined;
  Cabinet: undefined;
  Calendar: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const TAB_ICONS: Record<keyof RootTabParamList, keyof typeof Ionicons.glyphMap> = {
  Home: 'home',
  Library: 'list',
  Cabinet: 'cube',
  Calendar: 'calendar',
  Settings: 'settings',
};

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: APP_COLORS.accent,
        tabBarInactiveTintColor: APP_COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: APP_COLORS.surface,
          borderTopColor: APP_COLORS.border,
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={TAB_ICONS[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={MainScreen} />
      <Tab.Screen name="Library" component={DrinkLibraryScreen} />
      <Tab.Screen name="Cabinet" component={MyCabinetScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
