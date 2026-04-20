import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, ScrollView, TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import type { Pedido, Cliente } from '../lib/types';

type ResumoCliente = {
  cliente: Cliente;
  totalGeral: number;
  totalPago: number;
  totalPendente: number;
  pedidos: Pedido[];
};

export default function FinanceiroScreen({ navigation }: any) {
  const [dados, setDados] = useState<ResumoCliente[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('pedidos')
      .select('*, clientes(id, nome, telefone, criado_em, user_id)')
      .order('criado_em', { ascending: false });

    const pedidos = (data as Pedido[]) ?? [];

    const mapaClientes: Record<string, ResumoCliente> = {};
    for (const p of pedidos) {
      const cId = p.cliente_id;
      if (!mapaClientes[cId]) {
        mapaClientes[cId] = {
          cliente: p.clientes as Cliente,
          totalGeral: 0,
          totalPago: 0,
          totalPendente: 0,
          pedidos: [],
        };
      }
      mapaClientes[cId].pedidos.push(p);
      mapaClientes[cId].totalGeral += Number(p.valor);
      if (p.pago) mapaClientes[cId].totalPago += Number(p.valor);
      else mapaClientes[cId].totalPendente += Number(p.valor);
    }

    setDados(Object.values(mapaClientes));
    setLoading(false);
  }, []);

  useFocusEffect(load);

  const totalVendido = dados.reduce((s, d) => s + d.totalGeral, 0);
  const totalRecebido = dados.reduce((s, d) => s + d.totalPago, 0);
  const totalPendente = dados.reduce((s, d) => s + d.totalPendente, 0);

  if (loading) return <View style={s.center}><ActivityIndicator color="#1A5A7A" size="large" /></View>;

  return (
    <ScrollView style={s.root} contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>

      {/* Resumo geral */}
      <View style={s.headerCard}>
        <Text style={s.headerTitle}>Resumo Geral</Text>
        <View style={s.headerRow}>
          <View style={s.headerStat}>
            <Text style={s.headerStatLabel}>Total vendido</Text>
            <Text style={s.headerStatValor}>R$ {totalVendido.toFixed(2).replace('.', ',')}</Text>
          </View>
          <View style={[s.headerStat, s.headerBorder]}>
            <Text style={s.headerStatLabel}>Recebido</Text>
            <Text style={[s.headerStatValor, s.verde]}>R$ {totalRecebido.toFixed(2).replace('.', ',')}</Text>
          </View>
          <View style={s.headerStat}>
            <Text style={s.headerStatLabel}>Pendente</Text>
            <Text style={[s.headerStatValor, s.laranja]}>R$ {totalPendente.toFixed(2).replace('.', ',')}</Text>
          </View>
        </View>
      </View>

      {/* Por cliente */}
      <Text style={s.sectionTitle}>Por cliente</Text>

      {dados.length === 0 ? (
        <Text style={s.empty}>Nenhum pedido registrado ainda.</Text>
      ) : (
        dados.map((item) => (
          <TouchableOpacity
            key={item.cliente?.id}
            style={s.card}
            onPress={() => navigation.navigate(
              'ClientesTab',
              { screen: 'ClienteDetalhe', params: { clienteId: item.cliente?.id, nome: item.cliente?.nome } }
            )}
          >
            <View style={s.cardHeader}>
              <Text style={s.avatar}>{item.cliente?.nome?.charAt(0).toUpperCase()}</Text>
              <Text style={s.clienteNome}>{item.cliente?.nome}</Text>
              <Text style={s.totalCliente}>R$ {item.totalGeral.toFixed(2).replace('.', ',')}</Text>
            </View>
            <View style={s.cardStats}>
              <View style={s.statItem}>
                <Text style={s.statLabel}>Recebido</Text>
                <Text style={[s.statValor, s.verde]}>R$ {item.totalPago.toFixed(2).replace('.', ',')}</Text>
              </View>
              <View style={s.statItem}>
                <Text style={s.statLabel}>Pendente</Text>
                <Text style={[s.statValor, item.totalPendente > 0 ? s.laranja : s.neutro]}>
                  R$ {item.totalPendente.toFixed(2).replace('.', ',')}
                </Text>
              </View>
              <View style={s.statItem}>
                <Text style={s.statLabel}>Pedidos</Text>
                <Text style={s.statValor}>{item.pedidos.length}</Text>
              </View>
            </View>
            {item.pedidos.some(p => !p.pago && p.data_vencimento && new Date(p.data_vencimento) < new Date()) && (
              <View style={s.alertaVenc}>
                <Text style={s.alertaTxt}>⚠️ Possui pagamento(s) vencido(s)</Text>
              </View>
            )}
          </TouchableOpacity>
        ))
      )}

    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EFF5FA' },
  container: { padding: 16, paddingBottom: 48 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerCard: {
    backgroundColor: '#1A5A7A', borderRadius: 16, padding: 20, marginBottom: 20,
  },
  headerTitle: { fontSize: 13, color: '#A8D0E6', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  headerRow: { flexDirection: 'row' },
  headerStat: { flex: 1, alignItems: 'center' },
  headerBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#2A7A9A' },
  headerStatLabel: { fontSize: 11, color: '#A8D0E6', marginBottom: 6 },
  headerStatValor: { fontSize: 16, fontWeight: '800', color: '#fff' },
  verde: { color: '#68E8A8' },
  laranja: { color: '#FFC86A' },
  neutro: { color: '#aaa' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#0D2B3A', marginBottom: 12 },
  empty: { color: '#5A8AAA', fontSize: 15, textAlign: 'center', marginTop: 40 },
  card: {
    backgroundColor: '#fff', borderRadius: 14, marginBottom: 12,
    borderWidth: 1, borderColor: '#C8DDE8', overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    gap: 10, borderBottomWidth: 1, borderColor: '#EAF2F8',
  },
  avatar: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#1A5A7A',
    color: '#fff', fontSize: 16, fontWeight: '800', textAlign: 'center', lineHeight: 36,
  },
  clienteNome: { fontSize: 16, fontWeight: '700', color: '#0D2B3A', flex: 1 },
  totalCliente: { fontSize: 16, fontWeight: '800', color: '#1A5A7A' },
  cardStats: { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 11, color: '#7AAAC0', marginBottom: 4 },
  statValor: { fontSize: 14, fontWeight: '700', color: '#0D2B3A' },
  alertaVenc: { backgroundColor: '#FEF3E2', padding: 8, paddingHorizontal: 14 },
  alertaTxt: { fontSize: 12, color: '#C07010', fontWeight: '600' },
});
