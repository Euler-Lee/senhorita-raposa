import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export default function FoxSaveToast({ visible }: { visible: boolean }) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const bounce = useRef(new Animated.Value(0)).current;
  const thumbScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    scale.setValue(0);
    opacity.setValue(0);
    bounce.setValue(0);
    thumbScale.setValue(0);

    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 18 }),
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]),
      Animated.spring(thumbScale, { toValue: 1, useNativeDriver: true, speed: 22, bounciness: 24 }),
      Animated.spring(bounce, { toValue: -12, useNativeDriver: true, speed: 20, bounciness: 20 }),
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
        <View style={styles.emojiWrap}>
          <Text style={styles.fox}>🦊</Text>
          <Animated.Text style={[styles.thumbs, { transform: [{ scale: thumbScale }] }]}>👍</Animated.Text>
        </View>
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
    borderRadius: 28,
    paddingVertical: 28,
    paddingHorizontal: 40,
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#D45C2A',
    shadowColor: '#D45C2A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  emojiWrap: {
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fox: {
    fontSize: 72,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  thumbs: {
    fontSize: 34,
    position: 'absolute',
    bottom: -2,
    right: -6,
  },
  label: { fontSize: 20, fontWeight: '900', color: '#D45C2A', marginTop: 10 },
});
