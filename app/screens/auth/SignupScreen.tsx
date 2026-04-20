import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { supabase } from '../../lib/supabase';

export default function SignupScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!email.trim() || !password) {
      Alert.alert('Campos obrigatorios', 'Preencha todos os campos.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Senha fraca', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      Alert.alert('Erro ao criar conta', error.message);
      return;
    }
    Alert.alert('Conta criada', 'Verifique seu e-mail para confirmar o cadastro.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Criar Conta</Text>
        <Text style={styles.subtitle}>Senhorita Raposa</Text>

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#B08A78"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Senha (min. 6 caracteres)"
          placeholderTextColor="#B08A78"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Criar conta</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Ja tem conta? Entrar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF8F4' },
  container: { flexGrow: 1, justifyContent: 'center', padding: 28 },
  title: { fontSize: 28, fontWeight: '800', color: '#D45C2A', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#8A6A5A', textAlign: 'center', marginBottom: 48 },
  input: {
    borderWidth: 1.5, borderColor: '#EDD9C8', borderRadius: 12,
    padding: 14, fontSize: 16, color: '#2D1B10',
    backgroundColor: '#fff', marginBottom: 14,
  },
  button: {
    backgroundColor: '#D45C2A', borderRadius: 12,
    padding: 16, alignItems: 'center', marginTop: 8, marginBottom: 20,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  link: { color: '#D45C2A', textAlign: 'center', fontSize: 14 },
});
