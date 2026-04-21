import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView,
  Platform, Modal, FlatList,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import type { Produto } from '../../lib/types';
import FoxBackground from '../../components/FoxBackground';
import FoxSaveToast from '../../components/FoxSaveToast';

type Rascunho = {
  key: string;
  produto: Produto | null;
  descricao: string;
  valor: string;
  dataVenc: string;
};

function novoRascunho(): Rascunho {
  return { key: Math.random().toString(36).slice(2), produto: null, descricao: '', valor: '', dataVenc: '' };
}

export default function ClienteFormScreen({ route, navigation }: any) {
  const editId: string | undefined = route.params?.id;

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!editId);
  const [showToast, setShowToast] = useState(false);

  const [rascunhos, setRascunhos] = useState<Rascunho[]>([novoRascunho()]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [modalIdx, setModalIdx] = useState<number | null>(null);
  const [qtdExistentes, setQtdExistentes] = useState(0);

  useEffect(() => {
    navigation.setOptions({ title: editId ? 'Editar Cliente' : 'Novo Cliente' });
    supabase.from('produtos').select('*').order('nome').then(({ data }) => {
      setProdutos((data as Produto[]) ?? []);
    });
    if (!editId) return;
    supabase.from('clientes').select('*').eq('id', editId).single().then(({ data }) => {
      if (data) { setNome(data.nome); setTelefone(data.telefone ?? ''); }
      setFetching(false);
    });
    supabase.from('pedidos').select('id', { count: 'exact', head: true }).eq('cliente_id', editId).then(({ count }) => {
      setQtdExistentes(count ?? 0);
    });
  }, [editId]);

  function update(idx: number, patch: Partial<Rascunho>) {
    setRascunhos(prev => prev.map((r, i) => i === idx ? { ...r, ...patch } : r));
  }

  function formatarData(text: string, idx: number) {
    const n = text.replace(/\D/g, '').slice(0, 8);
    let f = n;
    if (n.length > 2) f = n.slice(0, 2) + '/' + n.slice(2);
    if (n.length > 4) f = n.slice(0, 2) + '/' + n.slice(2, 4) + '/' + n.slice(4);
    update(idx, { dataVenc: f });
  }

  function dataISO(data: string): string | null {
    const p = data.split('/');
    if (p.length !== 3 || p[2].length < 4) return null;
    return `${p[2]}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}`;
  }

  async function handleSave() {
    if (!nome.trim()) { Alert.alert('Campo obrigatório', 'Informe o nome do cliente.'); return; }

    const validos = rascunhos.filter(r => r.descricao.trim() || r.valor.trim());
    for (const r of validos) {
      if (!r.descricao.trim()) { Alert.alert('Pedido incompleto', 'Preencha a descrição de todos os pedidos.'); return; }
      const v = parseFloat(r.valor.replace(',', '.'));
      if (!r.valor || isNaN(v) || v <= 0) { Alert.alert('Pedido incompleto', 'Informe um valor válido para todos os pedidos.'); return; }
      if (r.dataVenc && !dataISO(r.dataVenc)) { Alert.alert('Data inválida', 'Use o formato DD/MM/AAAA.'); return; }
    }

    setLoading(true);
    const payload = { nome: nome.trim(), telefone: telefone.trim() || null };
    let clienteId = editId;

    if (editId) {
      const { error } = await supabase.from('clientes').update(payload).eq('id', editId);
      if (error) { setLoading(false); Alert.alert('Erro', error.message); return; }
    } else {
      const { data, error } = await supabase.from('clientes').insert(payload).select().single();
      if (error || !data) { setLoading(false); Alert.alert('Erro', error?.message ?? 'Erro ao criar cliente.'); return; }
      clienteId = data.id;
    }

    for (const r of validos) {
      const v = parseFloat(r.valor.replace(',', '.'));
      await supabase.from('pedidos').insert({
        cliente_id: clienteId,
        produto_id: r.produto?.id ?? null,
        descricao: r.descricao.trim(),
        valor: v,
        data_vencimento: r.dataVenc ? dataISO(r.dataVenc) : null,
        pago: false,
      });
    }

    setLoading(false);
    setShowToast(true);
    setTimeout(() => navigation.goBack(), 1500);
  }

  if (fetching) return <View style={s.center}><ActivityIndicator color="#1A6B5A" /></View>;

  return (
    <>
      <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FoxBackground opacity={0.04} />
        <FoxSaveToast visible={showToast} />
        <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">

          {/* ── Dados do cliente ── */}
          <Text style={s.secTitle}>Dados do cliente</Text>

          <Text style={s.label}>Nome *</Text>
          <TextInput style={s.input} value={nome} onChangeText={setNome}
            placeholder="Ex: Maria Silva" placeholderTextColor="#7AADA0" />

          <Text style={s.label}>Telefone / WhatsApp</Text>
          <TextInput style={s.input} value={telefone} onChangeText={setTelefone}
            placeholder="Ex: (11) 99999-9999" placeholderTextColor="#7AADA0"
            keyboardType="phone-pad" />

          {/* ── Pedidos ── */}
          <View style={s.divider} />

          <View style={s.secRow}>
            <Text style={s.secTitle}>Pedidos</Text>
            {editId && qtdExistentes > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('ClienteDetalhe', { clienteId: editId, nome })}>
                <Text style={s.verLink}>
                  {qtdExistentes} existente{qtdExistentes > 1 ? 's' : ''} →
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={s.secSub}>
            {editId ? 'Adicione novos pedidos abaixo.' : 'Já adicione os produtos que este cliente comprou.'}
          </Text>

          {rascunhos.map((r, idx) => (
            <View key={r.key} style={s.card}>
              <View style={s.cardHeader}>
                <Text style={s.cardNum}>Pedido {idx + 1}</Text>
                {rascunhos.length > 1 && (
                  <TouchableOpacity onPress={() => setRascunhos(prev => prev.filter((_, i) => i !== idx))}>
                    <Text style={s.removeTxt}>✕ remover</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Text style={s.label}>Produto (opcional)</Text>
              <TouchableOpacity style={s.prodBtn} onPress={() => setModalIdx(idx)}>
                <Text style={r.produto ? s.prodSel : s.prodPh}>
                  {r.produto ? `🎂 ${r.produto.nome}` : 'Selecionar produto...'}
                </Text>
                {r.produto && (
                  <TouchableOpacity onPress={() => update(idx, { produto: null, descricao: '', valor: '' })}>
                    <Text style={s.limpar}>✕</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>

              <Text style={s.label}>Descrição *</Text>
              <TextInput style={s.input} value={r.descricao}
                onChangeText={v => update(idx, { descricao: v })}
                placeholder="Ex: Bolo de aniversário 2 kg" placeholderTextColor="#7AADA0" />

              <View style={s.row}>
                <View style={s.col}>
                  <Text style={s.label}>Valor (R$) *</Text>
                  <TextInput style={s.input} value={r.valor}
                    onChangeText={v => update(idx, { valor: v })}
                    placeholder="0,00" placeholderTextColor="#7AADA0" keyboardType="decimal-pad" />
                </View>
                <View style={[s.col, { marginLeft: 10 }]}>
                  <Text style={s.label}>Vencimento</Text>
                  <TextInput style={s.input} value={r.dataVenc}
                    onChangeText={v => formatarData(v, idx)}
                    placeholder="DD/MM/AAAA" placeholderTextColor="#7AADA0"
                    keyboardType="numeric" maxLength={10} />
                </View>
              </View>
            </View>
          ))}

          <TouchableOpacity style={s.addBtn} onPress={() => setRascunhos(p => [...p, novoRascunho()])}>
            <Text style={s.addTxt}>+ Adicionar outro pedido</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.saveTxt}>{editId ? 'Salvar alterações' : 'Cadastrar cliente'}</Text>}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de produto */}
      <Modal visible={modalIdx !== null} animationType="slide" transparent>
        <View style={s.overlay}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>Selecionar produto</Text>
            <FlatList
              data={produtos}
              keyExtractor={p => p.id}
              style={{ maxHeight: 360 }}
              ListEmptyComponent={<Text style={s.emptyTxt}>Nenhum produto cadastrado.</Text>}
              renderItem={({ item }) => (
                <TouchableOpacity style={s.prodOpt} onPress={() => {
                  if (modalIdx !== null) {
                    update(modalIdx, {
                      produto: item,
                      descricao: item.nome,
                      valor: item.preco_venda ? String(item.preco_venda) : rascunhos[modalIdx].valor,
                    });
                    setModalIdx(null);
                  }
                }}>
                  <Text style={s.prodOptNome}>{item.nome}</Text>
                  {item.preco_venda !== null && (
                    <Text style={s.prodOptPreco}>R$ {Number(item.preco_venda).toFixed(2).replace('.', ',')}</Text>
                  )}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={s.cancelBtn} onPress={() => setModalIdx(null)}>
              <Text style={s.cancelTxt}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4FBF9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 20, paddingBottom: 52 },

  secRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  secTitle: { fontSize: 15, fontWeight: '700', color: '#0D2B24' },
  secSub: { fontSize: 12, color: '#5A8A7A', marginBottom: 14, marginTop: 2 },
  verLink: { fontSize: 13, color: '#1A6B5A', fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#C8E6DF', marginVertical: 22 },

  label: { fontSize: 13, fontWeight: '600', color: '#0D2B24', marginBottom: 6, marginTop: 14 },
  input: {
    borderWidth: 1.5, borderColor: '#C8E6DF', borderRadius: 12,
    padding: 13, fontSize: 15, color: '#0D2B24', backgroundColor: '#fff',
  },
  row: { flexDirection: 'row' },
  col: { flex: 1 },

  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    marginBottom: 12, borderWidth: 1.5, borderColor: '#C8E6DF',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardNum: { fontSize: 12, fontWeight: '700', color: '#1A6B5A', textTransform: 'uppercase', letterSpacing: 0.5 },
  removeTxt: { fontSize: 12, color: '#C0392B', fontWeight: '600' },

  prodBtn: {
    borderWidth: 1.5, borderColor: '#C8E6DF', borderRadius: 12,
    padding: 13, backgroundColor: '#fff', flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
  },
  prodSel: { color: '#0D2B24', fontSize: 15, fontWeight: '600' },
  prodPh: { color: '#7AADA0', fontSize: 15 },
  limpar: { color: '#C0392B', fontWeight: '800', fontSize: 16 },

  addBtn: {
    borderWidth: 1.5, borderColor: '#1A6B5A', borderRadius: 12,
    padding: 14, alignItems: 'center', borderStyle: 'dashed', marginBottom: 8,
  },
  addTxt: { color: '#1A6B5A', fontSize: 14, fontWeight: '700' },

  saveBtn: { backgroundColor: '#1A6B5A', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 16 },
  saveTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 36 },
  modalTitle: { fontSize: 17, fontWeight: '800', color: '#0D2B24', marginBottom: 16 },
  prodOpt: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderColor: '#E8F5F1' },
  prodOptNome: { fontSize: 15, color: '#0D2B24', fontWeight: '600' },
  prodOptPreco: { fontSize: 15, color: '#1A6B5A', fontWeight: '700' },
  cancelBtn: { marginTop: 16, padding: 14, backgroundColor: '#F0FAF7', borderRadius: 12, alignItems: 'center' },
  cancelTxt: { color: '#1A6B5A', fontWeight: '700', fontSize: 15 },
  emptyTxt: { textAlign: 'center', color: '#5A8A7A', padding: 24 },
});
