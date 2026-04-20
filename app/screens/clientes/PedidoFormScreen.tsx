import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView,
  Platform, Modal, FlatList,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import type { Produto } from '../../lib/types';

export default function PedidoFormScreen({ route, navigation }: any) {
  const { clienteId, clienteNome } = route.params as { clienteId: string; clienteNome: string };

  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [dataVenc, setDataVenc] = useState('');
  const [produtoSel, setProdutoSel] = useState<Produto | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: `Pedido — ${clienteNome}` });
    supabase.from('produtos').select('*').order('nome').then(({ data }) => {
      setProdutos((data as Produto[]) ?? []);
    });
  }, []);

  function handleSelecionarProduto(p: Produto) {
    setProdutoSel(p);
    setDescricao(p.nome);
    if (p.preco_venda) setValor(String(p.preco_venda));
    setModalVisible(false);
  }

  function formatarDataInput(text: string) {
    const nums = text.replace(/\D/g, '').slice(0, 8);
    let f = nums;
    if (nums.length > 2) f = nums.slice(0, 2) + '/' + nums.slice(2);
    if (nums.length > 4) f = nums.slice(0, 2) + '/' + nums.slice(2, 4) + '/' + nums.slice(4);
    setDataVenc(f);
  }

  function dataParaISO(data: string): string | null {
    const partes = data.split('/');
    if (partes.length !== 3 || partes[2].length < 4) return null;
    return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
  }

  async function handleSave() {
    if (!descricao.trim()) { Alert.alert('Erro', 'Informe a descrição do pedido.'); return; }
    const valorNum = parseFloat(valor.replace(',', '.'));
    if (!valor || isNaN(valorNum) || valorNum <= 0) { Alert.alert('Erro', 'Informe um valor válido.'); return; }

    let dataISO: string | null = null;
    if (dataVenc) {
      dataISO = dataParaISO(dataVenc);
      if (!dataISO) { Alert.alert('Erro', 'Data inválida. Use o formato DD/MM/AAAA.'); return; }
    }

    setLoading(true);
    const { error } = await supabase.from('pedidos').insert({
      cliente_id: clienteId,
      produto_id: produtoSel?.id ?? null,
      descricao: descricao.trim(),
      valor: valorNum,
      data_vencimento: dataISO,
      pago: false,
    });
    setLoading(false);
    if (error) { Alert.alert('Erro', error.message); return; }
    navigation.goBack();
  }

  return (
    <>
      <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">

          <Text style={s.label}>Vincular a um produto cadastrado (opcional)</Text>
          <TouchableOpacity style={s.produtoBtn} onPress={() => setModalVisible(true)}>
            <Text style={produtoSel ? s.produtoBtnSel : s.produtoBtnPlaceholder}>
              {produtoSel ? `🎂 ${produtoSel.nome}` : 'Selecionar produto...'}
            </Text>
            {produtoSel && (
              <TouchableOpacity onPress={() => { setProdutoSel(null); setDescricao(''); setValor(''); }}>
                <Text style={s.limpar}>✕</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          <Text style={s.label}>Descrição do pedido *</Text>
          <TextInput style={s.input} value={descricao} onChangeText={setDescricao}
            placeholder="Ex: Bolo de aniversário, 2kg" placeholderTextColor="#7AADA0" />

          <Text style={s.label}>Valor (R$) *</Text>
          <TextInput style={s.input} value={valor} onChangeText={setValor}
            placeholder="Ex: 85,00" placeholderTextColor="#7AADA0" keyboardType="decimal-pad" />

          <Text style={s.label}>Data de vencimento</Text>
          <TextInput style={s.input} value={dataVenc} onChangeText={formatarDataInput}
            placeholder="DD/MM/AAAA" placeholderTextColor="#7AADA0" keyboardType="numeric"
            maxLength={10} />

          <TouchableOpacity style={s.button} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Salvar pedido</Text>}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>Selecionar produto</Text>
            <FlatList
              data={produtos}
              keyExtractor={p => p.id}
              style={{ maxHeight: 350 }}
              ListEmptyComponent={<Text style={s.empty}>Nenhum produto cadastrado.</Text>}
              renderItem={({ item }) => (
                <TouchableOpacity style={s.produtoOpt} onPress={() => handleSelecionarProduto(item)}>
                  <Text style={s.produtoOptNome}>{item.nome}</Text>
                  {item.preco_venda !== null && (
                    <Text style={s.produtoOptPreco}>
                      R$ {Number(item.preco_venda).toFixed(2).replace('.', ',')}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={s.cancelBtn} onPress={() => setModalVisible(false)}>
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
  container: { padding: 20, paddingBottom: 48 },
  label: { fontSize: 14, fontWeight: '600', color: '#0D2B24', marginBottom: 8, marginTop: 20 },
  input: {
    borderWidth: 1.5, borderColor: '#C8E6DF', borderRadius: 12,
    padding: 14, fontSize: 16, color: '#0D2B24', backgroundColor: '#fff',
  },
  produtoBtn: {
    borderWidth: 1.5, borderColor: '#C8E6DF', borderRadius: 12,
    padding: 14, backgroundColor: '#fff', flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
  },
  produtoBtnSel: { fontSize: 15, color: '#0D2B24', fontWeight: '600' },
  produtoBtnPlaceholder: { fontSize: 15, color: '#7AADA0' },
  limpar: { fontSize: 16, color: '#C0392B', fontWeight: '700', paddingLeft: 8 },
  button: { backgroundColor: '#1A6B5A', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 32 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  empty: { color: '#5A8A7A', textAlign: 'center', padding: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0D2B24', marginBottom: 16 },
  produtoOpt: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 14, borderBottomWidth: 1, borderColor: '#C8E6DF',
  },
  produtoOptNome: { fontSize: 15, color: '#0D2B24' },
  produtoOptPreco: { fontSize: 15, fontWeight: '700', color: '#1A6B5A' },
  cancelBtn: { marginTop: 16, backgroundColor: '#E8F5F1', borderRadius: 12, padding: 14, alignItems: 'center' },
  cancelTxt: { color: '#1A6B5A', fontWeight: '700' },
});
