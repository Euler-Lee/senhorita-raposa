import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import FoxSaveToast from '../../components/FoxSaveToast';
import FoxBackground from '../../components/FoxBackground';

const UNIDADES = ['un', 'm', 'cm', 'kg', 'g', 'rolo'];

function formatarCusto(valor: number, un: string): string {
  if ((un === 'g' || un === 'cm') && valor < 0.1) return valor.toFixed(4);
  return valor.toFixed(2).replace('.', ',');
}

export default function EmbalagemFormScreen({ route, navigation }: any) {
  const editId: string | undefined = route.params?.id;

  const [nome, setNome] = useState('');
  const [unidade, setUnidade] = useState('un');
  const [custo, setCusto] = useState('');
  const [qtd, setQtd] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!editId);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: editId ? 'Editar Embalagem' : 'Nova Embalagem' });
    if (!editId) return;
    supabase.from('embalagens').select('*').eq('id', editId).single().then(({ data }) => {
      if (data) {
        setNome(data.nome);
        setUnidade(data.unidade_medida);
        setCusto(String(data.custo));
        setQtd(String(data.quantidade_embalagem));
      }
      setFetching(false);
    });
  }, [editId]);

  async function handleSave() {
    if (!nome.trim() || !custo || !qtd) { Alert.alert('Campos obrigatórios', 'Preencha todos os campos.'); return; }
    const custoNum = parseFloat(custo.replace(',', '.'));
    const qtdNum = parseFloat(qtd.replace(',', '.'));
    if (isNaN(custoNum) || custoNum <= 0) { Alert.alert('Erro', 'Custo inválido.'); return; }
    if (isNaN(qtdNum) || qtdNum <= 0) { Alert.alert('Erro', 'Quantidade inválida.'); return; }

    setLoading(true);
    const payload = { nome: nome.trim(), unidade_medida: unidade, custo: custoNum, quantidade_embalagem: qtdNum };
    const { error } = editId
      ? await supabase.from('embalagens').update(payload).eq('id', editId)
      : await supabase.from('embalagens').insert(payload);
    setLoading(false);

    if (error) { Alert.alert('Erro ao salvar', error.message); return; }
    setShowToast(true);
    setTimeout(() => navigation.goBack(), 1500);
  }

  if (fetching) return <View style={s.center}><ActivityIndicator color="#7A3A9A" /></View>;

  const custoNum = parseFloat(custo.replace(',', '.'));
  const qtdNum = parseFloat(qtd.replace(',', '.'));
  const previewOk = !isNaN(custoNum) && !isNaN(qtdNum) && custoNum > 0 && qtdNum > 0;

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FoxBackground opacity={0.04} />
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">

        <Text style={s.label}>Nome da embalagem</Text>
        <TextInput style={s.input} value={nome} onChangeText={setNome}
          placeholder="Ex: Caixinha kraft 500ml" placeholderTextColor="#B08ACA" />

        <Text style={s.label}>Unidade de medida</Text>
        <View style={s.chips}>
          {UNIDADES.map(u => (
            <TouchableOpacity key={u} style={[s.chip, unidade === u && s.chipSel]} onPress={() => setUnidade(u)}>
              <Text style={[s.chipTxt, unidade === u && s.chipTxtSel]}>{u}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.label}>Custo do lote (R$)</Text>
        <TextInput style={s.input} value={custo} onChangeText={setCusto}
          placeholder="Ex: 45.00 (paguei R$45 por 50 caixinhas)" placeholderTextColor="#B08ACA"
          keyboardType="decimal-pad" />

        <Text style={s.label}>Quantidade no lote ({unidade})</Text>
        <TextInput style={s.input} value={qtd} onChangeText={setQtd}
          placeholder={unidade === 'un' ? 'Ex: 50 (50 unidades no lote)' : 'Ex: 10'}
          placeholderTextColor="#B08ACA" keyboardType="decimal-pad" />

        {previewOk && (
          <View style={s.preview}>
            <Text style={s.previewLabel}>Custo por {unidade}:</Text>
            <Text style={s.previewValue}>R$ {formatarCusto(custoNum / qtdNum, unidade)}</Text>
            <Text style={s.previewHint}>
              R$ {custoNum.toFixed(2).replace('.', ',')} ÷ {qtdNum}{unidade} = R$ {formatarCusto(custoNum / qtdNum, unidade)}/{unidade}
            </Text>
          </View>
        )}

        <TouchableOpacity style={s.button} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>{editId ? 'Salvar' : 'Cadastrar embalagem'}</Text>}
        </TouchableOpacity>

      </ScrollView>
      <FoxSaveToast visible={showToast} />
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAF4FF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 20, paddingBottom: 48 },
  label: { fontSize: 14, fontWeight: '600', color: '#2D1B3A', marginBottom: 8, marginTop: 20 },
  input: { borderWidth: 1.5, borderColor: '#E0CCEA', borderRadius: 12, padding: 14, fontSize: 16, color: '#2D1B3A', backgroundColor: '#fff' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1.5, borderColor: '#E0CCEA', borderRadius: 20, paddingVertical: 7, paddingHorizontal: 16, backgroundColor: '#fff' },
  chipSel: { backgroundColor: '#7A3A9A', borderColor: '#7A3A9A' },
  chipTxt: { color: '#8A6AAA', fontSize: 14 },
  chipTxtSel: { color: '#fff', fontWeight: '700' },
  preview: { backgroundColor: '#F3EBF9', borderRadius: 12, padding: 16, marginTop: 20 },
  previewLabel: { fontSize: 13, color: '#8A6AAA', marginBottom: 4 },
  previewValue: { fontSize: 26, fontWeight: '800', color: '#7A3A9A', marginBottom: 4 },
  previewHint: { fontSize: 12, color: '#B08ACA' },
  button: { backgroundColor: '#7A3A9A', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 32 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
