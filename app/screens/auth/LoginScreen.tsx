import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { supabase } from '../../lib/supabase';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Campos obrigatorios', 'Preencha e-mail e senha.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      if (error.message.includes('Email not confirmed')) {
        Alert.alert('E-mail nao confirmado', 'Verifique sua caixa de entrada e clique no link de confirmacao antes de entrar.');
      } else if (error.message.includes('Invalid login credentials')) {
        Alert.alert('Credenciais invalidas', 'E-mail ou senha incorretos.');
      } else {
        Alert.alert('Erro ao entrar', error.message);
      }
    }
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.brand}>Senhorita Raposa</Text>
        <Text style={styles.subtitle}>Precificacao inteligente</Text>

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
          placeholder="Senha"
          placeholderTextColor="#B08A78"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Entrar</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.link}>Ainda nao tem conta? Criar conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF8F4' },
  container: { flexGrow: 1, justifyContent: 'center', padding: 28 },
  brand: { fontSize: 34, fontWeight: '800', color: '#D45C2A', textAlign: 'center', marginBottom: 4 },
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
