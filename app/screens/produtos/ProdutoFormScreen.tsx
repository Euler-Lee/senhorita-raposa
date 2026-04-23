import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView,
  Platform, Modal, FlatList,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import type { Insumo, Embalagem } from '../../lib/types';
import FoxBackground from '../../components/FoxBackground';
import FoxSaveToast from '../../components/FoxSaveToast';

type ItemComposicao = { tipo: 'insumo'; item: Insumo } | { tipo: 'embalagem'; item: Embalagem };
type ComposicaoLocal = ItemComposicao & { quantidade: string };

function custoUnitario(entry: ItemComposicao): number {
  if (entry.tipo === 'insumo') {
    return Number(entry.item.preco_custo) / Number(entry.item.quantidade_embalagem);
  }
  return Number(entry.item.custo) / Number(entry.item.quantidade_embalagem);
}

export default function ProdutoFormScreen({ route, navigation }: any) {
  const editId: string | undefined = route.params?.id;

  const [nome, setNome] = useState('');
  const [precoVenda, setPrecoVenda] = useState('');
  const [composicao, setComposicao] = useState<ComposicaoLocal[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [embalagens, setEmbalagens] = useState<Embalagem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAba, setModalAba] = useState<'insumo' | 'embalagem'>('insumo');
  const [itemSelecionado, setItemSelecionado] = useState<ItemComposicao | null>(null);
  const [qtdModal, setQtdModal] = useState('');

  useEffect(() => {
    navigation.setOptions({ title: editId ? 'Editar Receita' : 'Nova Receita' });
    loadData();
  }, [editId]);

  async function loadData() {
    const [{ data: ins }, { data: emb }] = await Promise.all([
      supabase.from('insumos').select('*').order('nome'),
      supabase.from('embalagens').select('*').order('nome'),
    ]);
    setInsumos((ins as Insumo[]) ?? []);
    setEmbalagens((emb as Embalagem[]) ?? []);

    if (editId) {
      const [{ data: prod }, { data: comp }] = await Promise.all([
        supabase.from('produtos').select('*').eq('id', editId).single(),
        supabase.from('composicao_produto').select('*, insumos(*), embalagens(*)').eq('produto_id', editId),
      ]);
      if (prod) {
        setNome(prod.nome);
        setPrecoVenda(prod.preco_venda ? String(prod.preco_venda) : '');
      }
      if (comp) {
        const mapped: ComposicaoLocal[] = comp.map((c: any) => {
          if (c.insumos) {
            return { tipo: 'insumo', item: c.insumos as Insumo, quantidade: String(c.quantidade_utilizada) };
          }
          return { tipo: 'embalagem', item: c.embalagens as Embalagem, quantidade: String(c.quantidade_utilizada) };
        });
        setComposicao(mapped);
      }
    }
    setFetching(false);
  }

  function calcularCustoLocal(): number {
    return composicao.reduce((total, entry) => {
      const qtd = parseFloat(entry.quantidade.replace(',', '.'));
      return total + (isNaN(qtd) ? 0 : custoUnitario(entry) * qtd);
    }, 0);
  }

  function handleConfirmarItem() {
    if (!itemSelecionado || !qtdModal) return;
    const qtd = parseFloat(qtdModal.replace(',', '.'));
    if (isNaN(qtd) || qtd <= 0) { Alert.alert('Erro', 'Informe uma quantidade válida.'); return; }

    setComposicao(prev => {
      const key = `${itemSelecionado.tipo}:${itemSelecionado.item.id}`;
      const idx = prev.findIndex(e => `${e.tipo}:${e.item.id}` === key);
      const nova: ComposicaoLocal = { ...itemSelecionado, quantidade: String(qtd) };
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = nova;
        return updated;
      }
      return [...prev, nova];
    });
    setModalVisible(false);
    setItemSelecionado(null);
    setQtdModal('');
  }

  async function handleSave() {
    if (!nome.trim()) { Alert.alert('Erro', 'Informe o nome do produto.'); return; }
    setLoading(true);

    const payload: Record<string, unknown> = { nome: nome.trim() };
    if (precoVenda) payload.preco_venda = parseFloat(precoVenda.replace(',', '.'));

    let produtoId = editId;

    if (editId) {
      const { error } = await supabase.from('produtos').update(payload).eq('id', editId);
      if (error) { Alert.alert('Erro', error.message); setLoading(false); return; }
    } else {
      const { data, error } = await supabase.from('produtos').insert(payload).select('id').single();
      if (error || !data) { Alert.alert('Erro', error?.message ?? 'Falha ao criar produto.'); setLoading(false); return; }
      produtoId = data.id;
    }

    await supabase.from('composicao_produto').delete().eq('produto_id', produtoId);
    if (composicao.length > 0) {
      const rows = composicao.map(entry => ({
        produto_id: produtoId,
        insumo_id: entry.tipo === 'insumo' ? entry.item.id : null,
        embalagem_id: entry.tipo === 'embalagem' ? entry.item.id : null,
        quantidade_utilizada: parseFloat(entry.quantidade.replace(',', '.')),
      }));
      const { error } = await supabase.from('composicao_produto').insert(rows);
      if (error) { Alert.alert('Erro na composição', error.message); setLoading(false); return; }
    }

    setLoading(false);
    setShowToast(true);
    setTimeout(() => navigation.goBack(), 1500);
  }

  if (fetching) {
    return <View style={styles.center}><ActivityIndicator color="#D45C2A" size="large" /></View>;
  }

  const custoLocal = calcularCustoLocal();
  const vendaNum = precoVenda ? parseFloat(precoVenda.replace(',', '.')) : null;
  const unidadeItem = (entry: ComposicaoLocal) =>
    entry.tipo === 'insumo' ? (entry.item as Insumo).unidade_medida : (entry.item as Embalagem).unidade_medida;

  return (
    <>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FoxBackground opacity={0.04} />
        <FoxSaveToast visible={showToast} />
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

          <Text style={styles.label}>Nome do produto</Text>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Ex: Bolo de chocolate"
            placeholderTextColor="#B08A78"
          />

          <Text style={styles.label}>Preço de venda (R$) — opcional</Text>
          <TextInput
            style={styles.input}
            value={precoVenda}
            onChangeText={setPrecoVenda}
            placeholder="Ex: 45.00"
            placeholderTextColor="#B08A78"
            keyboardType="decimal-pad"
          />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Composição</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => { setModalAba('insumo'); setItemSelecionado(null); setModalVisible(true); }}>
              <Text style={styles.addBtnText}>+ Adicionar</Text>
            </TouchableOpacity>
          </View>

          {composicao.length === 0 ? (
            <Text style={styles.emptyComp}>Nenhum item adicionado ainda.</Text>
          ) : (
            composicao.map((entry, index) => {
              const unit = custoUnitario(entry);
              const qtdNum = parseFloat(entry.quantidade.replace(',', '.'));
              const subtotal = isNaN(qtdNum) ? 0 : unit * qtdNum;
              const tag = entry.tipo === 'embalagem' ? '📦 ' : '';
              return (
                <View key={`${entry.tipo}:${entry.item.id}`} style={styles.compItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.compNome}>{tag}{entry.item.nome}</Text>
                    <Text style={styles.compMeta}>
                      {entry.quantidade} {unidadeItem(entry)}  —  R$ {subtotal.toFixed(4)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setComposicao(prev => prev.filter((_, i) => i !== index))}
                    style={styles.removeBtn}
                  >
                    <Text style={styles.removeTxt}>✕</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}

          {composicao.length > 0 && (
            <View style={styles.custoBox}>
              <View style={styles.custoRow}>
                <Text style={styles.custoLabel}>Custo total</Text>
                <Text style={styles.custoValor}>R$ {custoLocal.toFixed(2)}</Text>
              </View>
              {vendaNum !== null && vendaNum > 0 && (
                <>
                  <View style={styles.custoRow}>
                    <Text style={styles.custoLabel}>Lucro estimado</Text>
                    <Text style={[styles.custoValor, vendaNum - custoLocal >= 0 ? styles.success : styles.danger]}>
                      R$ {(vendaNum - custoLocal).toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.custoRow}>
                    <Text style={styles.custoLabel}>Margem</Text>
                    <Text style={styles.custoValor}>
                      {(((vendaNum - custoLocal) / vendaNum) * 100).toFixed(1)}%
                    </Text>
                  </View>
                </>
              )}
            </View>
          )}

          <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>{editId ? 'Salvar alterações' : 'Cadastrar produto'}</Text>}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar item</Text>

            {itemSelecionado ? (
              <>
                <Text style={styles.modalSelected}>
                  {itemSelecionado.tipo === 'embalagem' ? '📦 ' : ''}{itemSelecionado.item.nome}
                </Text>
                <Text style={styles.label}>
                  Quantidade ({itemSelecionado.tipo === 'insumo'
                    ? (itemSelecionado.item as Insumo).unidade_medida
                    : (itemSelecionado.item as Embalagem).unidade_medida})
                </Text>
                <TextInput
                  style={styles.input}
                  value={qtdModal}
                  onChangeText={setQtdModal}
                  placeholder="Ex: 200"
                  placeholderTextColor="#B08A78"
                  keyboardType="decimal-pad"
                  autoFocus
                />
                <View style={styles.modalRow}>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.modalBtnSecondary]}
                    onPress={() => setItemSelecionado(null)}
                  >
                    <Text style={styles.modalBtnSecondaryText}>Voltar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.modalBtnPrimary]}
                    onPress={handleConfirmarItem}
                  >
                    <Text style={styles.modalBtnPrimaryText}>Adicionar</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                {/* Abas */}
                <View style={styles.abas}>
                  <TouchableOpacity
                    style={[styles.aba, modalAba === 'insumo' && styles.abaAtiva]}
                    onPress={() => setModalAba('insumo')}
                  >
                    <Text style={[styles.abaTxt, modalAba === 'insumo' && styles.abaTxtAtiva]}>🥕 Ingredientes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.aba, modalAba === 'embalagem' && styles.abaAtiva]}
                    onPress={() => setModalAba('embalagem')}
                  >
                    <Text style={[styles.abaTxt, modalAba === 'embalagem' && styles.abaTxtAtiva]}>📦 Embalagens</Text>
                  </TouchableOpacity>
                </View>

                {modalAba === 'insumo' ? (
                  <FlatList
                    data={insumos}
                    keyExtractor={i => i.id}
                    style={{ maxHeight: 260 }}
                    ListEmptyComponent={<Text style={styles.empty}>Nenhum ingrediente cadastrado.</Text>}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.insumoOption}
                        onPress={() => { setItemSelecionado({ tipo: 'insumo', item }); setQtdModal(''); }}
                      >
                        <Text style={styles.insumoOptionNome}>{item.nome}</Text>
                        <Text style={styles.insumoOptionMeta}>{item.unidade_medida}</Text>
                      </TouchableOpacity>
                    )}
                  />
                ) : (
                  <FlatList
                    data={embalagens}
                    keyExtractor={e => e.id}
                    style={{ maxHeight: 260 }}
                    ListEmptyComponent={<Text style={styles.empty}>Nenhuma embalagem cadastrada.</Text>}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.insumoOption}
                        onPress={() => { setItemSelecionado({ tipo: 'embalagem', item }); setQtdModal(''); }}
                      >
                        <Text style={styles.insumoOptionNome}>📦 {item.nome}</Text>
                        <Text style={styles.insumoOptionMeta}>{item.unidade_medida}</Text>
                      </TouchableOpacity>
                    )}
                  />
                )}

                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnSecondary, { marginTop: 12 }]}
                  onPress={() => { setModalVisible(false); setItemSelecionado(null); }}
                >
                  <Text style={styles.modalBtnSecondaryText}>Cancelar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF8F4' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF8F4' },
  container: { padding: 20, paddingBottom: 48 },
  label: { fontSize: 14, fontWeight: '600', color: '#2D1B10', marginBottom: 8, marginTop: 20 },
  input: {
    borderWidth: 1.5, borderColor: '#EDD9C8', borderRadius: 12,
    padding: 14, fontSize: 16, color: '#2D1B10', backgroundColor: '#fff',
  },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 28, marginBottom: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#2D1B10' },
  addBtn: { backgroundColor: '#FEF0E8', borderRadius: 8, paddingVertical: 7, paddingHorizontal: 14 },
  addBtnText: { color: '#D45C2A', fontWeight: '700', fontSize: 13 },
  emptyComp: { color: '#8A6A5A', fontSize: 14, fontStyle: 'italic', marginBottom: 8 },
  compItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#EDD9C8',
  },
  compNome: { fontSize: 14, fontWeight: '600', color: '#2D1B10' },
  compMeta: { fontSize: 12, color: '#8A6A5A', marginTop: 2 },
  removeBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  removeTxt: { color: '#C0392B', fontWeight: '800', fontSize: 16 },
  custoBox: { backgroundColor: '#FEF0E8', borderRadius: 12, padding: 16, marginTop: 16 },
  custoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  custoLabel: { fontSize: 13, color: '#8A6A5A' },
  custoValor: { fontSize: 18, fontWeight: '800', color: '#D45C2A' },
  success: { color: '#2E7D32' },
  danger: { color: '#C0392B' },
  button: { backgroundColor: '#D45C2A', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 32 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  empty: { color: '#8A6A5A', fontSize: 14, textAlign: 'center', padding: 16 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#2D1B10', marginBottom: 16 },
  modalSelected: { fontSize: 16, fontWeight: '700', color: '#D45C2A', marginBottom: 4 },
  modalRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  modalBtn: { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center' },
  modalBtnPrimary: { backgroundColor: '#D45C2A' },
  modalBtnPrimaryText: { color: '#fff', fontWeight: '700' },
  modalBtnSecondary: { backgroundColor: '#EDD9C8' },
  modalBtnSecondaryText: { color: '#2D1B10', fontWeight: '700' },
  abas: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  aba: { flex: 1, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F5EDE7', alignItems: 'center' },
  abaAtiva: { backgroundColor: '#D45C2A' },
  abaTxt: { color: '#8A6A5A', fontWeight: '600', fontSize: 13 },
  abaTxtAtiva: { color: '#fff', fontWeight: '700' },
  insumoOption: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1, borderColor: '#EDD9C8' },
  insumoOptionNome: { fontSize: 15, color: '#2D1B10' },
  insumoOptionMeta: { fontSize: 13, color: '#8A6A5A' },
});

