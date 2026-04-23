import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator,
  ScrollView, TextInput, TouchableOpacity,
} from 'react-native';
import { calcularCustoPorProdutoId, calcularPrecoSugerido } from '../lib/calculos';
import { supabase } from '../lib/supabase';
import type { ProdutoComCusto } from '../lib/types';
import ConfirmDialog from '../components/ConfirmDialog';

const MARGENS_RAPIDAS = ['20', '30', '40', '50', '60'];

export default function PrecificacaoScreen({ route, navigation }: any) {
  const { produtoId } = route.params as { produtoId: string };
  const [produto, setProduto] = useState<ProdutoComCusto | null>(null);
  const [loading, setLoading] = useState(true);
  const [margemDesejada, setMargemDesejada] = useState('30');
  const [saving, setSaving] = useState(false);
  const [dlg, setDlg] = useState<{ title: string; msg: string } | null>(null);
  const [okDlg, setOkDlg] = useState<string | null>(null);

  useEffect(() => {
    calcularCustoPorProdutoId(produtoId).then(data => {
      setProduto(data);
      navigation.setOptions({ title: data?.nome ?? 'Precificacao' });
      setLoading(false);
    });
  }, [produtoId]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color="#D45C2A" size="large" /></View>;
  }
  if (!produto) {
    return <View style={styles.center}><Text style={styles.errorText}>Produto nao encontrado.</Text></View>;
  }

  const margem = parseFloat(margemDesejada.replace(',', '.')) || 0;
  const precoSugerido = calcularPrecoSugerido(produto.custo_total, margem);
  const lucroSugerido = precoSugerido - produto.custo_total;

  async function handleUsarPreco() {
    setSaving(true);
    const { error } = await supabase
      .from('produtos')
      .update({ preco_venda: precoSugerido, margem_lucro: margem })
      .eq('id', produtoId);
    setSaving(false);
    if (error) { setDlg({ title: 'Erro ao salvar', msg: error.message }); return; }
    setOkDlg(`Preço de venda atualizado para R$ ${precoSugerido.toFixed(2)}`);
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
        visible={!!okDlg}
        title="Preço salvo! 🦊"
        message={okDlg ?? ''}
        variant="info"
        confirmOnly
        confirmLabel="OK"
        onConfirm={() => { setOkDlg(null); navigation.goBack(); }}
      />
      <ScrollView style={styles.root} contentContainerStyle={styles.container}>
      <Text style={styles.title}>{produto.nome}</Text>

      {/* Situacao atual */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Situacao atual</Text>
        <Row label="Custo total" value={`R$ ${produto.custo_total.toFixed(2)}`} />
        {produto.preco_venda !== null ? (
          <>
            <Row label="Preco de venda" value={`R$ ${Number(produto.preco_venda).toFixed(2)}`} />
            <Row
              label="Lucro"
              value={`R$ ${Number(produto.lucro).toFixed(2)}`}
              highlight={Number(produto.lucro) >= 0}
            />
            <Row
              label="Margem real"
              value={`${Number(produto.margem_calculada).toFixed(1)}%`}
              highlight={Number(produto.margem_calculada) >= 30}
            />
          </>
        ) : (
          <Text style={styles.semPreco}>Preco de venda nao definido.</Text>
        )}
      </View>

      {/* Calculadora */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Calculadora de preco</Text>
        <Text style={styles.inputLabel}>Margem de lucro desejada (%)</Text>
        <TextInput
          style={styles.margemInput}
          value={margemDesejada}
          onChangeText={setMargemDesejada}
          keyboardType="decimal-pad"
          placeholderTextColor="#B08A78"
        />
        <View style={styles.chips}>
          {MARGENS_RAPIDAS.map(m => (
            <TouchableOpacity
              key={m}
              style={[styles.chip, margemDesejada === m && styles.chipSelected]}
              onPress={() => setMargemDesejada(m)}
            >
              <Text style={[styles.chipText, margemDesejada === m && styles.chipTextSelected]}>{m}%</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>Preco sugerido</Text>
          <Text style={styles.resultValor}>R$ {precoSugerido.toFixed(2)}</Text>
          <Text style={styles.resultSub}>
            Lucro: R$ {lucroSugerido.toFixed(2)}  —  Margem: {margem}%
          </Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleUsarPreco} disabled={saving}>
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Usar este preco</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
    </> 
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={rowS.row}>
      <Text style={rowS.label}>{label}</Text>
      <Text style={[rowS.value, highlight === true ? rowS.success : highlight === false ? rowS.danger : null]}>
        {value}
      </Text>
    </View>
  );
}

const rowS = StyleSheet.create({
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderColor: '#EDD9C8',
  },
  label: { fontSize: 14, color: '#8A6A5A' },
  value: { fontSize: 16, fontWeight: '700', color: '#2D1B10' },
  success: { color: '#2E7D32' },
  danger: { color: '#C0392B' },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF8F4' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF8F4' },
  container: { padding: 20, paddingBottom: 48 },
  title: { fontSize: 22, fontWeight: '800', color: '#2D1B10', marginBottom: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 18,
    marginBottom: 16, borderWidth: 1, borderColor: '#EDD9C8',
  },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#8A6A5A', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  semPreco: { color: '#8A6A5A', fontSize: 14, fontStyle: 'italic', paddingTop: 8 },
  errorText: { color: '#C0392B', fontSize: 16 },
  inputLabel: { fontSize: 13, color: '#8A6A5A', marginBottom: 8 },
  margemInput: {
    borderWidth: 1.5, borderColor: '#EDD9C8', borderRadius: 10,
    padding: 12, fontSize: 24, color: '#D45C2A', fontWeight: '800',
    textAlign: 'center', backgroundColor: '#FFF8F4',
  },
  chips: { flexDirection: 'row', gap: 8, marginTop: 12, justifyContent: 'center', flexWrap: 'wrap' },
  chip: {
    borderWidth: 1.5, borderColor: '#EDD9C8', borderRadius: 20,
    paddingVertical: 6, paddingHorizontal: 18,
  },
  chipSelected: { backgroundColor: '#D45C2A', borderColor: '#D45C2A' },
  chipText: { color: '#8A6A5A', fontSize: 14 },
  chipTextSelected: { color: '#fff', fontWeight: '700' },
  resultBox: {
    backgroundColor: '#FEF0E8', borderRadius: 12,
    padding: 20, marginTop: 16, alignItems: 'center',
  },
  resultLabel: { fontSize: 13, color: '#8A6A5A' },
  resultValor: { fontSize: 38, fontWeight: '900', color: '#D45C2A', marginVertical: 4 },
  resultSub: { fontSize: 13, color: '#8A6A5A', textAlign: 'center' },
  button: {
    backgroundColor: '#D45C2A', borderRadius: 12,
    padding: 16, alignItems: 'center', marginTop: 16,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
