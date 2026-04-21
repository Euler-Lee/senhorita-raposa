import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ROWS: string[][] = [
  ['🦊', '🐾', '🦊', '🦊', '🐾', '🦊'],
  ['🐾', '🦊', '🐾', '🐾', '🦊', '🐾'],
  ['🦊', '🦊', '🐾', '🦊', '🦊', '🐾'],
  ['🐾', '🦊', '🦊', '🐾', '🦊', '🦊'],
  ['🦊', '🐾', '🦊', '🐾', '🦊', '🐾'],
  ['🐾', '🦊', '🐾', '🦊', '🐾', '🦊'],
];

export default function FoxBackground({ opacity = 0.048 }: { opacity?: number }) {
  return (
    <View style={[StyleSheet.absoluteFill, { opacity, zIndex: 0, overflow: 'hidden' }]} pointerEvents="none">
      {Array.from({ length: 12 }).map((_, r) => (
        <View key={r} style={[styles.row, r % 2 !== 0 && styles.rowOffset]}>
          {ROWS[r % ROWS.length].map((emoji, c) => (
            <Text key={c} style={styles.icon}>{emoji}</Text>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 7 },
  rowOffset: { marginLeft: 26 },
  icon: { fontSize: 20 },
});
