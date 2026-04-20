import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function FoxBackground({ opacity = 0.048 }: { opacity?: number }) {
  const rows = Array.from({ length: 12 });
  const cols = Array.from({ length: 6 });
  return (
    <View style={[StyleSheet.absoluteFill, { opacity, zIndex: 0, overflow: 'hidden' }]} pointerEvents="none">
      {rows.map((_, r) => (
        <View key={r} style={[styles.row, r % 2 !== 0 && styles.rowOffset]}>
          {cols.map((_, c) => (
            <Text key={c} style={styles.fox}>🦊</Text>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 6 },
  rowOffset: { marginLeft: 30 },
  fox: { fontSize: 22 },
});
