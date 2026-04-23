import React, { useRef, useEffect } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet, Animated, Pressable,
} from 'react-native';
import { colors } from '../lib/theme';

/**
 * variant='danger'  → ícone 🗑️  fundo vermelho  (exclusão)
 * variant='warning' → ícone ⚠️  fundo âmbar     (atenção / validação)
 * variant='info'    → ícone 🦊  fundo fox        (informação / sucesso)
 *
 * confirmOnly=true  → exibe apenas um botão centralizado (sem Cancelar)
 */
type Variant = 'danger' | 'warning' | 'info';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  variant?: Variant;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmOnly?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
};

const VARIANT_CFG: Record<Variant, { icon: string; circleBg: string; circleBorder: string; btnBg: string }> = {
  danger:  { icon: '🗑️', circleBg: colors.dangerBg,  circleBorder: '#F5C0BA', btnBg: colors.danger },
  warning: { icon: '⚠️',  circleBg: '#FFF3E0',         circleBorder: '#F0C080', btnBg: '#D45C2A' },
  info:    { icon: '🦊',  circleBg: '#FEF0E8',         circleBorder: '#F0C080', btnBg: colors.primary },
};

export default function ConfirmDialog({
  visible, title, message,
  variant = 'danger',
  confirmLabel, cancelLabel = 'Cancelar',
  confirmOnly = false,
  onConfirm, onCancel,
}: Props) {
  const scale   = useRef(new Animated.Value(0.88)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const cfg = VARIANT_CFG[variant];
  const defaultConfirmLabel = confirmOnly ? 'Entendi' : confirmLabel ?? 'Excluir';

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

  function dismiss(cb: () => void) {
    Animated.parallel([
      Animated.timing(scale,   { toValue: 0.88, duration: 140, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0,    duration: 140, useNativeDriver: true }),
    ]).start(() => cb());
  }

  const handleCancel  = () => dismiss(onCancel ?? onConfirm);
  const handleConfirm = () => dismiss(onConfirm);

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent onRequestClose={handleCancel}>
      <Pressable style={styles.overlay} onPress={confirmOnly ? undefined : handleCancel}>
        <Animated.View style={[styles.card, { transform: [{ scale }], opacity }]}>
          <Pressable>
            <View style={styles.iconRow}>
              <View style={[styles.iconCircle, { backgroundColor: cfg.circleBg, borderColor: cfg.circleBorder }]}>
                <Text style={styles.iconEmoji}>{cfg.icon}</Text>
              </View>
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>

            {confirmOnly ? (
              <TouchableOpacity
                style={[styles.btnConfirm, { backgroundColor: cfg.btnBg }, styles.btnSolo]}
                onPress={handleConfirm}
                activeOpacity={0.8}
              >
                <Text style={styles.btnConfirmText}>{defaultConfirmLabel}</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.buttons}>
                <TouchableOpacity style={styles.btnCancel} onPress={handleCancel} activeOpacity={0.75}>
                  <Text style={styles.btnCancelText}>{cancelLabel}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btnConfirm, { backgroundColor: cfg.btnBg }]}
                  onPress={handleConfirm}
                  activeOpacity={0.8}
                >
                  <Text style={styles.btnConfirmText}>{confirmLabel ?? 'Excluir'}</Text>
                </TouchableOpacity>
              </View>
            )}
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
    width: 64, height: 64, borderRadius: 32,
    justifyContent: 'center', alignItems: 'center', borderWidth: 2,
  },
  iconEmoji: { fontSize: 30 },
  title: {
    fontSize: 18, fontWeight: '800', color: colors.text1,
    textAlign: 'center', marginBottom: 8,
  },
  message: {
    fontSize: 14, color: colors.text2,
    textAlign: 'center', lineHeight: 20, marginBottom: 28,
  },
  buttons: { flexDirection: 'row', gap: 12 },
  btnSolo: { marginHorizontal: 24 },
  btnCancel: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    borderWidth: 1.5, borderColor: colors.border,
    alignItems: 'center', backgroundColor: '#F7F4F1',
  },
  btnCancelText: { fontSize: 15, fontWeight: '700', color: colors.text2 },
  btnConfirm: {
    flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center',
    shadowColor: '#7A3800', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  btnConfirmText: { fontSize: 15, fontWeight: '800', color: '#fff' },
});
