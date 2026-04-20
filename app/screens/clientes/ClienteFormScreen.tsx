import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import FoxBackground from '../../components/FoxBackground';
import FoxSaveToast from '../../components/FoxSaveToast';

export default function ClienteFormScreen({ route, navigation }: any) {
  const editId: string | undefined = route.params?.id;

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!editId);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: editId ? 'Editar Cliente' : 'Novo Cliente' });
    if (!editId) return;
    supabase.from('clientes').select('*').eq('id', editId).single().then(({ data }) => {
      if (data) { setNome(data.nome); setTelefone(data.telefone ?? ''); }
      setFetching(false);
    });
  }, [editId]);

  async function handleSave() {
    if (!nome.trim()) { Alert.alert('Campo obrigatorio', 'Informe o nome do cliente.'); return; }
    setLoading(true);
    const payload = { nome: nome.trim(), telefone: telefone.trim() || null };
    const { error } = editId
      ? await supabase.from('clientes').update(payload).eq('id', editId)
      : await supabase.from('clientes').insert(payload);
    setLoading(false);
    if (error) { Alert.alert('Erro', error.message); return; }
    setShowToast(true);
    setTimeout(() => navigation.goBack(), 1500);
  }

  if (fetching) return <View style={s.center}><ActivityIndicator color="#1A6B5A" /></View>;

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FoxBackground opacity={0.04} />
      <FoxSaveToast visible={showToast} />
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">

        <Text style={s.label}>Nome *</Text>
        <TextInput style={s.input} value={nome} onChangeText={setNome}
          placeholder="Ex: Maria Silva" placeholderTextColor="#7AADA0" />

        <Text style={s.label}>Telefone / WhatsApp</Text>
        <TextInput style={s.input} value={telefone} onChangeText={setTelefone}
          placeholder="Ex: (11) 99999-9999" placeholderTextColor="#7AADA0"
          keyboardType="phone-pad" />

        <TouchableOpacity style={s.button} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>{editId ? 'Salvar' : 'Cadastrar cliente'}</Text>}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4FBF9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: '600', color: '#0D2B24', marginBottom: 8, marginTop: 20 },
  input: {
    borderWidth: 1.5, borderColor: '#C8E6DF', borderRadius: 12,
    padding: 14, fontSize: 16, color: '#0D2B24', backgroundColor: '#fff',
  },
  button: { backgroundColor: '#1A6B5A', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 32 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
