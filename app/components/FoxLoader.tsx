import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../lib/theme';

export default function FoxLoader({ message = 'Carregando...' }: { message?: string }) {
  const bounce = useRef(new Animated.Value(0)).current;
  const tilt   = useRef(new Animated.Value(0)).current;
  const paw1   = useRef(new Animated.Value(0)).current;
  const paw2   = useRef(new Animated.Value(0)).current;
  const paw3   = useRef(new Animated.Value(0)).current;
  const textOp = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const runBounce = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: -22, duration: 210, useNativeDriver: true }),
        Animated.timing(bounce, { toValue:   0, duration: 190, useNativeDriver: true }),
        Animated.timing(bounce, { toValue: -14, duration: 190, useNativeDriver: true }),
        Animated.timing(bounce, { toValue:   0, duration: 170, useNativeDriver: true }),
        Animated.delay(220),
      ])
    );

    const runTilt = Animated.loop(
      Animated.sequence([
        Animated.timing(tilt, { toValue: -12, duration: 210, useNativeDriver: true }),
        Animated.timing(tilt, { toValue:  12, duration: 210, useNativeDriver: true }),
        Animated.timing(tilt, { toValue:  -8, duration: 190, useNativeDriver: true }),
        Animated.timing(tilt, { toValue:   8, duration: 190, useNativeDriver: true }),
        Animated.timing(tilt, { toValue:   0, duration: 140, useNativeDriver: true }),
        Animated.delay(220),
      ])
    );

    const runPaws = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(paw1, { toValue: 0, duration: 1, useNativeDriver: true }),
          Animated.timing(paw2, { toValue: 0, duration: 1, useNativeDriver: true }),
          Animated.timing(paw3, { toValue: 0, duration: 1, useNativeDriver: true }),
        ]),
        Animated.delay(280),
        Animated.timing(paw1, { toValue: 1, duration: 160, useNativeDriver: true }),
        Animated.delay(130),
        Animated.timing(paw2, { toValue: 1, duration: 160, useNativeDriver: true }),
        Animated.delay(130),
        Animated.timing(paw3, { toValue: 1, duration: 160, useNativeDriver: true }),
        Animated.delay(500),
        Animated.parallel([
          Animated.timing(paw1, { toValue: 0, duration: 220, useNativeDriver: true }),
          Animated.timing(paw2, { toValue: 0, duration: 220, useNativeDriver: true }),
          Animated.timing(paw3, { toValue: 0, duration: 220, useNativeDriver: true }),
        ]),
        Animated.delay(120),
      ])
    );

    const pulseText = Animated.loop(
      Animated.sequence([
        Animated.timing(textOp, { toValue: 0.25, duration: 680, useNativeDriver: true }),
        Animated.timing(textOp, { toValue: 1.0,  duration: 680, useNativeDriver: true }),
      ])
    );

    runBounce.start();
    runTilt.start();
    runPaws.start();
    pulseText.start();

    return () => {
      runBounce.stop();
      runTilt.stop();
      runPaws.stop();
      pulseText.stop();
    };
  }, []);

  const rotation = tilt.interpolate({ inputRange: [-15, 15], outputRange: ['-15deg', '15deg'] });

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.fox, { transform: [{ translateY: bounce }, { rotate: rotation }] }]}>
        🦊
      </Animated.Text>
      <View style={styles.pawRow}>
        <Animated.Text style={[styles.paw, { opacity: paw1 }]}>🐾</Animated.Text>
        <Animated.Text style={[styles.paw, { opacity: paw2 }]}>🐾</Animated.Text>
        <Animated.Text style={[styles.paw, { opacity: paw3 }]}>🐾</Animated.Text>
      </View>
      <Animated.Text style={[styles.text, { opacity: textOp }]}>{message}</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
    paddingBottom: 60,
  },
  fox: { fontSize: 62, marginBottom: 8 },
  pawRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
    height: 30,
    alignItems: 'center',
  },
  paw: { fontSize: 22 },
  text: {
    marginTop: 20,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text2,
    letterSpacing: 0.5,
  },
});
