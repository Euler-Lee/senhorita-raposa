import React, { useRef, useEffect } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet, Animated, Pressable,
} from 'react-native';
import { colors } from '../lib/theme';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  visible, title, message, confirmLabel = 'Excluir', onConfirm, onCancel,
}: Props) {
  const scale = useRef(new Animated.Value(0.88)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scale.setValue(0.88);
      opacity.setValue(0);
      Animated.parallel([
        Animated.spring(scale,   { toValue: 1, useNativeDriver: true, speed: 22, bounciness: 14 }),
        Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  function handleCancel() {
    Animated.parallel([
      Animated.timing(scale,   { toValue: 0.88, duration: 140, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0,    duration: 140, useNativeDriver: true }),
    ]).start(() => onCancel());
  }

  function handleConfirm() {
    Animated.parallel([
      Animated.timing(scale,   { toValue: 0.88, duration: 140, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0,    duration: 140, useNativeDriver: true }),
    ]).start(() => onConfirm());
  }

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent onRequestClose={handleCancel}>
      <Pressable style={styles.overlay} onPress={handleCancel}>
        <Animated.View style={[styles.card, { transform: [{ scale }], opacity }]}>
          <Pressable>
            <View style={styles.iconRow}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconEmoji}>🗑️</Text>
              </View>
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            <View style={styles.buttons}>
              <TouchableOpacity style={styles.btnCancel} onPress={handleCancel} activeOpacity={0.75}>
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnConfirm} onPress={handleConfirm} activeOpacity={0.8}>
                <Text style={styles.btnConfirmText}>{confirmLabel}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(24,17,10,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  card: {
    backgroundColor: '#FFFCF9',
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#EAC898',
    width: '100%',
    maxWidth: 360,
    paddingTop: 28,
    paddingHorizontal: 28,
    paddingBottom: 24,
    shadowColor: '#7A3800',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    elevation: 16,
  },
  iconRow: { alignItems: 'center', marginBottom: 16 },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.dangerBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F5C0BA',
  },
  iconEmoji: { fontSize: 30 },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text1,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: colors.text2,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  buttons: { flexDirection: 'row', gap: 12 },
  btnCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: '#F7F4F1',
  },
  btnCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text2,
  },
  btnConfirm: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: colors.danger,
    alignItems: 'center',
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnConfirmText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },
});
