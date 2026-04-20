import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export default function FoxSaveToast({ visible }: { visible: boolean }) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    scale.setValue(0);
    opacity.setValue(0);
    bounce.setValue(0);

    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 18 }),
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]),
      Animated.spring(bounce, { toValue: -10, useNativeDriver: true, speed: 20, bounciness: 20 }),
      Animated.spring(bounce, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 20 }),
      Animated.delay(600),
      Animated.parallel([
        Animated.timing(scale, { toValue: 0.8, duration: 220, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]),
    ]).start();
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Animated.View style={[styles.card, { transform: [{ scale }, { translateY: bounce }], opacity }]}>
        <Text style={styles.fox}>🦊</Text>
        <Text style={styles.thumbs}>👍</Text>
        <Text style={styles.label}>Salvo!</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 36,
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#D45C2A',
    shadowColor: '#D45C2A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  fox: { fontSize: 52 },
  thumbs: { fontSize: 28, marginTop: -8 },
  label: { fontSize: 20, fontWeight: '900', color: '#D45C2A', marginTop: 8 },
});
