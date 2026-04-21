import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '../../lib/supabase';
import FoxBackground from '../../components/FoxBackground';
import { colors, fontSize, fontWeight, radius, shadow, space } from '../../lib/theme';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Campos obrigatórios', 'Preencha e-mail e senha.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      if (error.message.includes('Email not confirmed')) {
        Alert.alert('E-mail não confirmado', 'Verifique sua caixa de entrada e clique no link de confirmação antes de entrar.');
      } else if (error.message.includes('Invalid login credentials')) {
        Alert.alert('Credenciais inválidas', 'E-mail ou senha incorretos.');
      } else {
        Alert.alert('Erro ao entrar', error.message);
      }
    }
  }

  async function handleGoogle() {
    setLoadingGoogle(true);
    const redirectTo = makeRedirectUri({ scheme: 'sra' });
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error || !data.url) {
      Alert.alert('Erro', 'Não foi possível iniciar o login com Google.');
      setLoadingGoogle(false);
      return;
    }
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type === 'success') {
      const fragment = result.url.includes('#')
        ? result.url.split('#')[1]
        : result.url.split('?')[1];
      const params = new URLSearchParams(fragment ?? '');
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      if (access_token && refresh_token) {
        await supabase.auth.setSession({ access_token, refresh_token });
      }
    }
    setLoadingGoogle(false);
  }

  const busy = loading || loadingGoogle;

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FoxBackground opacity={0.04} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.foxEmoji}>🦊</Text>
        <Text style={styles.brand}>Senhorita Raposa</Text>
        <Text style={styles.subtitle}>Precificação inteligente</Text>

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
          placeholder="Senha"
          placeholderTextColor={colors.text3}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={busy}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Entrar</Text>}
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.googleBtn} onPress={handleGoogle} disabled={busy}>
          {loadingGoogle
            ? <ActivityIndicator color={colors.text1} />
            : (
              <View style={styles.googleInner}>
                <Text style={styles.googleG}>G</Text>
                <Text style={styles.googleText}>Entrar com Google</Text>
              </View>
            )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.linkWrap}>
          <Text style={styles.link}>Ainda não tem conta? <Text style={styles.linkBold}>Criar conta</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 40 },
  foxEmoji: { fontSize: 56, textAlign: 'center', marginBottom: 8 },
  brand: { fontSize: 32, fontWeight: fontWeight.black, color: colors.primary, textAlign: 'center', marginBottom: 4 },
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
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { marginHorizontal: 12, fontSize: fontSize.sm, color: colors.text3 },
  googleBtn: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.lg,
    paddingVertical: 14, alignItems: 'center', backgroundColor: colors.surface,
    marginBottom: 16, ...shadow.xs,
  },
  googleInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  googleG: { fontSize: 18, fontWeight: '800', color: '#4285F4' },
  googleText: { fontSize: fontSize.base, color: colors.text1, fontWeight: fontWeight.semibold },
  linkWrap: { marginTop: 8 },
  link: { color: colors.text2, textAlign: 'center', fontSize: fontSize.sm },
  linkBold: { color: colors.primary, fontWeight: fontWeight.bold },
});
