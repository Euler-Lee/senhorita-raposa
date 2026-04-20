import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import type { Pedido } from '../../lib/types';

export default function ClienteDetalheScreen({ route, navigation }: any) {
  const { clienteId, nome } = route.params as { clienteId: string; nome: string };
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect_navigation(navigation, nome);

  async function marcarPago(pedido: Pedido) {
    if (pedido.pago) return;
    Alert.alert('Confirmar pagamento', `Marcar "${pedido.descricao}" como pago?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar', onPress: async () => {
          await supabase.from('pedidos').update({ pago: true, data_pagamento: new Date().toISOString() }).eq('id', pedido.id);
          load();
        },
      },
    ]);
  }

  async function handleDelete(id: string) {
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
      {/* Resumo topo */}
      <View style={s.resumo}>
        <View style={s.resumoItem}>
          <Text style={s.resumoLabel}>Total</Text>
          <Text style={s.resumoValor}>R$ {totalGeral.toFixed(2).replace('.', ',')}</Text>
        </View>
        <View style={[s.resumoItem, s.resumoBorder]}>
          <Text style={s.resumoLabel}>Pago</Text>
          <Text style={[s.resumoValor, s.pago]}>R$ {totalPago.toFixed(2).replace('.', ',')}</Text>
        </View>
        <View style={s.resumoItem}>
          <Text style={s.resumoLabel}>Pendente</Text>
          <Text style={[s.resumoValor, s.pendente]}>R$ {totalPendente.toFixed(2).replace('.', ',')}</Text>
        </View>
      </View>

      <FlatList
        data={pedidos}
        keyExtractor={p => p.id}
        contentContainerStyle={pedidos.length === 0 ? s.emptyContainer : s.list}
        ListEmptyComponent={<Text style={s.empty}>Nenhum pedido ainda.{'\n'}Adicione o primeiro pedido.</Text>}
        renderItem={({ item }) => {
          const venc = item.data_vencimento
            ? new Date(item.data_vencimento + 'T00:00:00').toLocaleDateString('pt-BR')
            : null;
          const vencido = item.data_vencimento && !item.pago && new Date(item.data_vencimento) < new Date();
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
                <View style={s.cardBottom}>
                  {venc && (
                    <Text style={[s.venc, vencido && s.vencido]}>
                      {vencido ? '⚠️ Vencido: ' : '📅 Vence: '}{venc}
                    </Text>
                  )}
                  <TouchableOpacity
                    style={[s.statusBtn, item.pago ? s.statusPago : s.statusPendente]}
                    onPress={() => marcarPago(item)}
                  >
                    <Text style={item.pago ? s.statusPagoTxt : s.statusPendenteTxt}>
                      {item.pago ? '✓ Pago' : 'Marcar como pago'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity style={s.deleteBtn} onPress={() => handleDelete(item.id)}>
                <Text style={s.deleteTxt}>X</Text>
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

// Hook auxiliar para atualizar o título
function useEffect_navigation(navigation: any, nome: string) {
  const React = require('react');
  React.useEffect(() => {
    navigation.setOptions({ title: nome });
  }, [nome]);
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4FBF9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  resumo: {
    flexDirection: 'row', backgroundColor: '#1A6B5A',
    paddingVertical: 16, paddingHorizontal: 20,
  },
  resumoItem: { flex: 1, alignItems: 'center' },
  resumoBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#2A9B7A' },
  resumoLabel: { fontSize: 11, color: '#A8D8CE', marginBottom: 4, textTransform: 'uppercase' },
  resumoValor: { fontSize: 15, fontWeight: '800', color: '#fff' },
  pago: { color: '#A8FFD8' },
  pendente: { color: '#FFCB8A' },
  list: { padding: 16, paddingBottom: 90 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  empty: { color: '#5A8A7A', fontSize: 15, textAlign: 'center', lineHeight: 24 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, marginBottom: 12,
    flexDirection: 'row', borderWidth: 1, borderColor: '#C8E6DF', overflow: 'hidden',
  },
  cardPago: { opacity: 0.65, borderColor: '#A8D8CE' },
  cardBody: { flex: 1, padding: 14 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  descricao: { fontSize: 15, fontWeight: '700', color: '#0D2B24', flex: 1, marginRight: 8 },
  valor: { fontSize: 16, fontWeight: '800', color: '#1A6B5A' },
  produtoTag: { fontSize: 12, color: '#5A8A7A', marginBottom: 8 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
  venc: { fontSize: 12, color: '#5A8A7A' },
  vencido: { color: '#C0392B', fontWeight: '700' },
  statusBtn: { borderRadius: 20, paddingVertical: 5, paddingHorizontal: 14 },
  statusPago: { backgroundColor: '#E8F5F1' },
  statusPagoTxt: { color: '#1A6B5A', fontWeight: '700', fontSize: 12 },
  statusPendente: { backgroundColor: '#FEF3E2', borderWidth: 1, borderColor: '#F0A030' },
  statusPendenteTxt: { color: '#C07010', fontWeight: '700', fontSize: 12 },
  deleteBtn: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 14, backgroundColor: '#FEE2E2' },
  deleteTxt: { color: '#C0392B', fontWeight: '700', fontSize: 13 },
  fab: { margin: 16, backgroundColor: '#1A6B5A', borderRadius: 12, padding: 16, alignItems: 'center' },
  fabText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
