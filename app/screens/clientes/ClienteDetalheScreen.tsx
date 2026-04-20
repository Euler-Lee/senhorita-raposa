import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import type { Pedido } from '../../lib/types';

export default function ClienteDetalheScreen({ route, navigation }: any) {
  const { clienteId, nome } = route.params as { clienteId: string; nome: string };
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({ title: nome });
  }, [nome]);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('pedidos')
      .select('*, produtos(nome)')
      .eq('cliente_id', clienteId)
      .order('criado_em', { ascending: false });
    setPedidos((data as Pedido[]) ?? []);
    setLoading(false);
  }, [clienteId]);

  useFocusEffect(load);

  async function executarPago(pedidoId: string) {
    await supabase
      .from('pedidos')
      .update({ pago: true, data_pagamento: new Date().toISOString() })
      .eq('id', pedidoId);
    load();
  }

  function marcarPago(pedido: Pedido) {
    if (pedido.pago) return;
    if (Platform.OS === 'web') {
      executarPago(pedido.id);
      return;
    }
    Alert.alert('Confirmar pagamento', `Marcar "${pedido.descricao}" como pago?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: () => executarPago(pedido.id) },
    ]);
  }

  async function handleDelete(id: string) {
    if (Platform.OS === 'web') {
      await supabase.from('pedidos').delete().eq('id', id);
      load();
      return;
    }
    Alert.alert('Excluir pedido', 'Esta ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive',
        onPress: async () => { await supabase.from('pedidos').delete().eq('id', id); load(); },
      },
    ]);
  }

  const totalGeral = pedidos.reduce((s, p) => s + Number(p.valor), 0);
  const totalPago = pedidos.filter(p => p.pago).reduce((s, p) => s + Number(p.valor), 0);
  const totalPendente = totalGeral - totalPago;

  if (loading) return <View style={s.center}><ActivityIndicator color="#1A6B5A" size="large" /></View>;

  return (
    <View style={s.root}>
      <View style={s.resumo}>
        <View style={s.resumoItem}>
          <Text style={s.resumoLabel}>Total</Text>
          <Text style={s.resumoValor}>R$ {totalGeral.toFixed(2).replace('.', ',')}</Text>
        </View>
        <View style={[s.resumoItem, s.resumoBorder]}>
          <Text style={s.resumoLabel}>Pago</Text>
          <Text style={[s.resumoValor, s.corPago]}>R$ {totalPago.toFixed(2).replace('.', ',')}</Text>
        </View>
        <View style={s.resumoItem}>
          <Text style={s.resumoLabel}>Pendente</Text>
          <Text style={[s.resumoValor, totalPendente > 0 ? s.corPendente : s.corPago]}>
            R$ {totalPendente.toFixed(2).replace('.', ',')}
          </Text>
        </View>
      </View>

      <FlatList
        data={pedidos}
        keyExtractor={p => p.id}
        contentContainerStyle={pedidos.length === 0 ? s.emptyContainer : s.list}
        ListEmptyComponent={<Text style={s.empty}>Nenhum pedido ainda.{'\n'}Toque em "+ Novo Pedido".</Text>}
        renderItem={({ item }) => {
          const venc = item.data_vencimento
            ? new Date(item.data_vencimento + 'T12:00:00').toLocaleDateString('pt-BR')
            : null;
          return (
            <View style={[s.card, item.pago && s.cardPago]}>
              <View style={s.cardBody}>
                <View style={s.cardTop}>
                  <Text style={s.descricao}>{item.descricao}</Text>
                  <Text style={s.valor}>R$ {Number(item.valor).toFixed(2).replace('.', ',')}</Text>
                </View>
                {(item as any).produtos?.nome && (
                  <Text style={s.produtoTag}>🎂 {(item as any).produtos.nome}</Text>
                )}
                {venc && <Text style={s.venc}>📅 Vence: {venc}</Text>}
                <View style={s.cardBottom}>
                  {item.pago ? (
                    <View style={s.tagPago}><Text style={s.tagPagoTxt}>✓ Pago</Text></View>
                  ) : (
                    <TouchableOpacity style={s.btnPendente} onPress={() => marcarPago(item)}>
                      <Text style={s.btnPendenteTxt}>⏳ Pendente — toque para marcar como pago</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              <TouchableOpacity style={s.deleteBtn} onPress={() => handleDelete(item.id)}>
                <Text style={s.deleteTxt}>✕</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      <TouchableOpacity
        style={s.fab}
        onPress={() => navigation.navigate('PedidoForm', { clienteId, clienteNome: nome })}
      >
        <Text style={s.fabText}>+ Novo Pedido</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4FBF9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  resumo: { flexDirection: 'row', backgroundColor: '#1A6B5A', paddingVertical: 16, paddingHorizontal: 20 },
  resumoItem: { flex: 1, alignItems: 'center' },
  resumoBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#2A9B7A' },
  resumoLabel: { fontSize: 11, color: '#A8D8CE', marginBottom: 4, textTransform: 'uppercase' },
  resumoValor: { fontSize: 15, fontWeight: '800', color: '#fff' },
  corPago: { color: '#A8FFD8' },
  corPendente: { color: '#FFCB8A' },
  list: { padding: 16, paddingBottom: 90 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  empty: { color: '#5A8A7A', fontSize: 15, textAlign: 'center', lineHeight: 24 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, marginBottom: 12,
    flexDirection: 'row', borderWidth: 1, borderColor: '#C8E6DF', overflow: 'hidden',
  },
  cardPago: { opacity: 0.6, borderColor: '#A8D8CE' },
  cardBody: { flex: 1, padding: 14 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  descricao: { fontSize: 15, fontWeight: '700', color: '#0D2B24', flex: 1, marginRight: 8 },
  valor: { fontSize: 16, fontWeight: '800', color: '#1A6B5A' },
  produtoTag: { fontSize: 12, color: '#5A8A7A', marginBottom: 6 },
  venc: { fontSize: 12, color: '#5A8A7A', marginBottom: 8 },
  cardBottom: { marginTop: 4 },
  tagPago: { backgroundColor: '#E8F5F1', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 14, alignSelf: 'flex-start' },
  tagPagoTxt: { color: '#1A6B5A', fontWeight: '700', fontSize: 13 },
  btnPendente: {
    backgroundColor: '#FEF3E2', borderRadius: 20, paddingVertical: 8,
    paddingHorizontal: 14, borderWidth: 1.5, borderColor: '#F0A030', alignSelf: 'flex-start',
  },
  btnPendenteTxt: { color: '#C07010', fontWeight: '700', fontSize: 12 },
  deleteBtn: { width: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FEE2E2' },
  deleteTxt: { color: '#C0392B', fontWeight: '800', fontSize: 15 },
  fab: { margin: 16, backgroundColor: '#1A6B5A', borderRadius: 12, padding: 16, alignItems: 'center' },
  fabText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
