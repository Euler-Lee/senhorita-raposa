import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import FoxBackground from '../../components/FoxBackground';
import ConfirmDialog from '../../components/ConfirmDialog';
import { colors, fontSize, fontWeight, radius, shadow, space } from '../../lib/theme';

export default function SignupScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [dlg, setDlg] = useState<{ title: string; msg: string } | null>(null);
  const [successDlg, setSuccessDlg] = useState(false);

  async function handleSignup() {
    if (!email.trim() || !password) {
      setDlg({ title: 'Campos obrigatórios', msg: 'Preencha todos os campos.' });
      return;
    }
    if (password.length < 6) {
      setDlg({ title: 'Senha fraca', msg: 'A senha deve ter pelo menos 6 caracteres.' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      setDlg({ title: 'Erro ao criar conta', msg: error.message });
      return;
    }
    setSuccessDlg(true);
  }

  return (
    <>
      <ConfirmDialog
        visible={!!dlg}
        title={dlg?.title ?? ''}
        message={dlg?.msg ?? ''}
        variant="warning"
        confirmOnly
        onConfirm={() => setDlg(null)}
      />
      <ConfirmDialog
        visible={successDlg}
        title="Conta criada! 🦊"
        message="Verifique seu e-mail para confirmar o cadastro antes de entrar."
        variant="info"
        confirmOnly
        confirmLabel="OK"
        onConfirm={() => { setSuccessDlg(false); navigation.goBack(); }}
      />
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FoxBackground opacity={0.04} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.foxEmoji}>🦊</Text>
        <Text style={styles.title}>Criar Conta</Text>
        <Text style={styles.subtitle}>Junte-se à Senhorita Raposa</Text>

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor={colors.text3}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Senha (mínimo 6 caracteres)"
          placeholderTextColor={colors.text3}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Criar conta</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.linkWrap}>
          <Text style={styles.link}>Já tem conta? <Text style={styles.linkBold}>Entrar</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 40 },
  foxEmoji: { fontSize: 56, textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 32, fontWeight: fontWeight.black, color: colors.primary, textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: fontSize.sm, color: colors.text2, textAlign: 'center', marginBottom: 40 },
  input: {
    borderWidth: 1.5, borderColor: colors.foxBorder, borderRadius: radius.lg,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: fontSize.base, color: colors.text1,
    backgroundColor: colors.surface, marginBottom: 12,
    ...shadow.xs,
  },
  button: {
    backgroundColor: colors.primary, borderRadius: radius.lg,
    paddingVertical: 16, alignItems: 'center', marginTop: 4, marginBottom: 16,
    ...shadow.sm,
  },
  buttonText: { color: '#fff', fontSize: fontSize.base, fontWeight: fontWeight.bold },
  linkWrap: { marginTop: 8 },
  link: { color: colors.text2, textAlign: 'center', fontSize: fontSize.sm },
  linkBold: { color: colors.primary, fontWeight: fontWeight.bold },
});
