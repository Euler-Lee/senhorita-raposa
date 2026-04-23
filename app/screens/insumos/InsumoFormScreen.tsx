import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import FoxBackground from '../../components/FoxBackground';
import FoxSaveToast from '../../components/FoxSaveToast';

const UNIDADES = ['g', 'kg', 'ml', 'L', 'un'];

function formatarCusto(valor: number, unidade: string): string {
  // Unidades pequenas (g, ml) precisam de mais casas decimais
  if ((unidade === 'g' || unidade === 'ml') && valor < 0.1) {
    return valor.toFixed(4);
  }
  return valor.toFixed(2).replace('.', ',');
}

export default function InsumoFormScreen({ route, navigation }: any) {
  const editId: string | undefined = route.params?.id;

  const [nome, setNome] = useState('');
  const [unidade, setUnidade] = useState('g');
  const [precoCusto, setPrecoCusto] = useState('');
  const [qtdEmbalagem, setQtdEmbalagem] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!editId);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: editId ? 'Editar Ingrediente' : 'Novo Ingrediente' });
    if (!editId) return;
    supabase.from('insumos').select('*').eq('id', editId).single().then(({ data }) => {
      if (data) {
        setNome(data.nome);
        setUnidade(data.unidade_medida);
        setPrecoCusto(String(data.preco_custo));
        setQtdEmbalagem(String(data.quantidade_embalagem));
      }
      setFetching(false);
    });
  }, [editId]);

  async function handleSave() {
    if (!nome.trim() || !precoCusto || !qtdEmbalagem) {
      Alert.alert('Campos obrigatorios', 'Preencha todos os campos.');
      return;
    }
    const custo = parseFloat(precoCusto.replace(',', '.'));
    const qtd = parseFloat(qtdEmbalagem.replace(',', '.'));
    if (isNaN(custo) || custo <= 0) { Alert.alert('Erro', 'Preco de custo invalido.'); return; }
    if (isNaN(qtd) || qtd <= 0) { Alert.alert('Erro', 'Quantidade invalida.'); return; }

    setLoading(true);
    const payload = { nome: nome.trim(), unidade_medida: unidade, preco_custo: custo, quantidade_embalagem: qtd };
    const { error } = editId
      ? await supabase.from('insumos').update(payload).eq('id', editId)
      : await supabase.from('insumos').insert(payload);
    setLoading(false);

    if (error) { Alert.alert('Erro ao salvar', error.message); return; }
    setShowToast(true);
    setTimeout(() => navigation.goBack(), 1500);
  }

  if (fetching) {
    return <View style={styles.center}><ActivityIndicator color="#D45C2A" size="large" /></View>;
  }

  const custo = parseFloat(precoCusto.replace(',', '.'));
  const qtd = parseFloat(qtdEmbalagem.replace(',', '.'));
  const unitarioValido = !isNaN(custo) && !isNaN(qtd) && custo > 0 && qtd > 0;

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FoxBackground opacity={0.04} />
      <FoxSaveToast visible={showToast} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        <Text style={styles.label}>Nome</Text>
        <TextInput
          style={styles.input}
          value={nome}
          onChangeText={setNome}
          placeholder="Ex: Farinha de trigo"
          placeholderTextColor="#B08A78"
        />

        <Text style={styles.label}>Unidade de medida</Text>
        <View style={styles.chips}>
          {UNIDADES.map(u => (
            <TouchableOpacity
              key={u}
              style={[styles.chip, unidade === u && styles.chipSelected]}
              onPress={() => setUnidade(u)}
            >
              <Text style={[styles.chipText, unidade === u && styles.chipTextSelected]}>{u}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Preco da embalagem (R$)</Text>
        <TextInput
          style={styles.input}
          value={precoCusto}
          onChangeText={setPrecoCusto}
          placeholder="Ex: 8.50"
          placeholderTextColor="#B08A78"
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Quantidade total na embalagem ({unidade})</Text>
        <TextInput
          style={styles.input}
          value={qtdEmbalagem}
          onChangeText={setQtdEmbalagem}
          placeholder={unidade === 'kg' ? 'Ex: 5 (para uma embalagem de 5kg)' : unidade === 'g' ? 'Ex: 1000 (para 1kg = 1000g)' : unidade === 'L' ? 'Ex: 1 (para 1 litro)' : unidade === 'ml' ? 'Ex: 500 (para 500ml)' : 'Ex: 10'}
          placeholderTextColor="#B08A78"
          keyboardType="decimal-pad"
        />

        {unitarioValido && (
          <View style={styles.preview}>
            <Text style={styles.previewLine}>
              Você paga por cada {unidade}{' '}
              <Text style={styles.previewLineValue}>R$ {formatarCusto(custo / qtd, unidade)}</Text>
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>{editId ? 'Salvar alterações' : 'Cadastrar ingrediente'}</Text>}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF8F4' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF8F4' },
  container: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: '600', color: '#2D1B10', marginBottom: 8, marginTop: 20 },
  input: {
    borderWidth: 1.5, borderColor: '#EDD9C8', borderRadius: 12,
    padding: 14, fontSize: 16, color: '#2D1B10', backgroundColor: '#fff',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1.5, borderColor: '#EDD9C8', borderRadius: 20,
    paddingVertical: 7, paddingHorizontal: 16, backgroundColor: '#fff',
  },
  chipSelected: { backgroundColor: '#D45C2A', borderColor: '#D45C2A' },
  chipText: { color: '#8A6A5A', fontSize: 14 },
  chipTextSelected: { color: '#fff', fontWeight: '700' },
  preview: {
    backgroundColor: '#FEF0E8', borderRadius: 12, padding: 14,
    marginTop: 20,
  },
  previewLine: { fontSize: 15, color: '#8A6A5A' },
  previewLineValue: { fontSize: 15, fontWeight: '800', color: '#D45C2A' },
  button: {
    backgroundColor: '#D45C2A', borderRadius: 12,
    padding: 16, alignItems: 'center', marginTop: 32,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
