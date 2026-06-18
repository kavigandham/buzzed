// Full-screen warm gradient backdrop with subtle looping motion. Two diagonal
// gradients cross-fade via an Animated opacity loop (native driver). Replaces the
// static <LinearGradient> wrapper screens used before; this is the shared backdrop.
//
// The Animated.Value is useRef-stable so the per-second context ticker re-render
// never restarts the loop, and the loop is stopped on unmount.

import { ReactNode, useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { APP_COLORS } from '../../constants/colors';
import { GRADIENTS } from '../../constants/theme';

interface Props {
  children?: ReactNode;
  style?: ViewStyle;
}

export default function AnimatedGradientBackground({ children, style }: Props) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration: 9000, useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 9000, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [t]);

  const altOpacity = t.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <View style={[styles.fill, { backgroundColor: APP_COLORS.background }, style]}>
      <LinearGradient
        colors={GRADIENTS.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: altOpacity }]}>
        <LinearGradient
          colors={GRADIENTS.backgroundAlt}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <View style={styles.fill}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
