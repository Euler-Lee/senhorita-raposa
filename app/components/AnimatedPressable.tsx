import React, { useRef } from 'react';
import { Animated, Pressable, StyleProp, ViewStyle } from 'react-native';

type Props = {
  children: React.ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
};

export default function AnimatedPressable({ children, onPress, style, disabled }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const borderOpacity = useRef(new Animated.Value(0)).current;

  function animIn() {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1.055, useNativeDriver: true, speed: 40, bounciness: 12 }),
      Animated.timing(borderOpacity, { toValue: 1, duration: 80, useNativeDriver: false }),
    ]).start();
  }

  function animOut() {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 18, bounciness: 8 }),
      Animated.timing(borderOpacity, { toValue: 0, duration: 280, useNativeDriver: false }),
    ]).start();
  }

  const borderColor = borderOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(212,92,42,0)', 'rgba(212,92,42,0.75)'],
  });

  return (
    <Pressable onPress={onPress} onPressIn={animIn} onPressOut={animOut} disabled={disabled}>
      <Animated.View style={[style, { transform: [{ scale }], borderColor, borderWidth: 2.5, borderRadius: 16 }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
