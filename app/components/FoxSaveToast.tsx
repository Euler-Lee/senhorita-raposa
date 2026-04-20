import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export default function FoxSaveToast({ visible }: { visible: boolean }) {
  const [show, setShow] = useState(false);
  const translateY    = useRef(new Animated.Value(120)).current;
  const opacity       = useRef(new Animated.Value(0)).current;
  const containerScale = useRef(new Animated.Value(0.6)).current;
  const foxRotate     = useRef(new Animated.Value(0)).current;
  const foxScaleY     = useRef(new Animated.Value(1)).current;
  const checkScale    = useRef(new Animated.Value(0)).current;
  const spark1Scale   = useRef(new Animated.Value(0)).current;
  const spark2Scale   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    setShow(true);

    translateY.setValue(120);
    opacity.setValue(0);
    containerScale.setValue(0.6);
    foxRotate.setValue(0);
    foxScaleY.setValue(1);
    checkScale.setValue(0);
    spark1Scale.setValue(0);
    spark2Scale.setValue(0);

    Animated.sequence([
      // 1. Entra com spring animado
      Animated.parallel([
        Animated.spring(translateY,     { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 18 }),
        Animated.spring(containerScale, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 18 }),
        Animated.timing(opacity,        { toValue: 1, duration: 180, useNativeDriver: true }),
      ]),
      // 2. Dança (sacode a cabeça — "isso aí!")
      Animated.sequence([
        Animated.timing(foxRotate, { toValue: -16, duration: 110, useNativeDriver: true }),
        Animated.timing(foxRotate, { toValue:  16, duration: 150, useNativeDriver: true }),
        Animated.timing(foxRotate, { toValue: -12, duration: 120, useNativeDriver: true }),
        Animated.timing(foxRotate, { toValue:  12, duration: 120, useNativeDriver: true }),
        Animated.timing(foxRotate, { toValue:   0, duration: 100, useNativeDriver: true }),
      ]),
      // 3. Pisca o olho (scaleY quase zero = pestanejar)
      Animated.sequence([
        Animated.timing(foxScaleY, { toValue: 0.06, duration: 55, useNativeDriver: true }),
        Animated.spring(foxScaleY, { toValue: 1,    useNativeDriver: true, speed: 35, bounciness: 6 }),
      ]),
      // 4. Estrelinhas + check saltam
      Animated.parallel([
        Animated.spring(checkScale,  { toValue: 1, useNativeDriver: true, speed: 22, bounciness: 24 }),
        Animated.spring(spark1Scale, { toValue: 1, useNativeDriver: true, speed: 18, bounciness: 20 }),
        Animated.spring(spark2Scale, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 18 }),
      ]),
      Animated.delay(800),
      // 5. Sai para cima
      Animated.parallel([
        Animated.timing(translateY,     { toValue: -60, duration: 240, useNativeDriver: true }),
        Animated.timing(opacity,        { toValue: 0,   duration: 240, useNativeDriver: true }),
        Animated.timing(containerScale, { toValue: 0.8, duration: 240, useNativeDriver: true }),
      ]),
    ]).start(() => setShow(false));
  }, [visible]);

  if (!show) return null;

  const rotateStr = foxRotate.interpolate({
    inputRange: [-20, 20],
    outputRange: ['-20deg', '20deg'],
  });

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Animated.View style={[styles.card, { transform: [{ translateY }, { scale: containerScale }], opacity }]}>

        {/* Estrelinhas decorativas */}
        <Animated.Text style={[styles.spark, styles.spark1, { transform: [{ scale: spark1Scale }] }]}>✨</Animated.Text>
        <Animated.Text style={[styles.spark, styles.spark2, { transform: [{ scale: spark2Scale }] }]}>⭐</Animated.Text>

        {/* Raposa dançando + piscando */}
        <View style={styles.foxWrap}>
          <Animated.Text style={[styles.fox, { transform: [{ rotate: rotateStr }, { scaleY: foxScaleY }] }]}>
            🦊
          </Animated.Text>
          <Animated.View style={[styles.checkBadge, { transform: [{ scale: checkScale }] }]}>
            <Text style={styles.checkText}>✓</Text>
          </Animated.View>
        </View>

        <Text style={styles.label}>Isso aí! Salvo 🎉</Text>
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
    backgroundColor: '#FFF8F4',
    borderRadius: 32,
    paddingVertical: 32,
    paddingHorizontal: 44,
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#D45C2A',
    shadowColor: '#D45C2A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 16,
  },
  foxWrap: {
    width: 84,
    height: 84,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  fox: { fontSize: 72 },
  checkBadge: {
    position: 'absolute',
    bottom: -2,
    right: -6,
    backgroundColor: '#D45C2A',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#fff',
  },
  checkText: { color: '#fff', fontSize: 15, fontWeight: '900' },
  spark: { position: 'absolute', fontSize: 22 },
  spark1: { top: 14, right: 18 },
  spark2: { top: 18, left: 16 },
  label: { fontSize: 18, fontWeight: '900', color: '#D45C2A', marginTop: 14 },
});
