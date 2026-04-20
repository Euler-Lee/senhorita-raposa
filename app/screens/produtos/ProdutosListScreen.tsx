import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { listarProdutosComCusto } from '../../lib/calculos';
import { supabase } from '../../lib/supabase';
import type { ProdutoComCusto } from '../../lib/types';
import FoxBackground from '../../components/FoxBackground';

export default function ProdutosListScreen({ navigation }: any) {
  const [produtos, setProdutos] = useState<ProdutoComCusto[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await listarProdutosComCusto();
    setProdutos(data);
    setLoading(false);
  }, []);

  useFocusEffect(load);

  async function handleDelete(id: string) {
    if (Platform.OS === 'web') {
      await supabase.from('produtos').delete().eq('id', id);
      load();
      return;
    }
    Alert.alert('Excluir produto', 'Esta ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive',
        onPress: async () => {
          await supabase.from('produtos').delete().eq('id', id);
          load();
        },
      },
    ]);
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color="#D45C2A" size="large" /></View>;
  }

  return (
    <View style={styles.container}>
      <FoxBackground opacity={0.04} />
      <FlatList
        data={produtos}
        keyExtractor={item => item.id}
        contentContainerStyle={produtos.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhum produto cadastrado ainda.{'\n'}Crie seu primeiro produto para precificar.</Text>
        }
        renderItem={({ item }) => {
          const margem = item.margem_calculada !== null ? Number(item.margem_calculada) : null;
          const margemBoa = margem !== null && margem >= 30;
          return (
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.cardContent}
                onPress={() => navigation.navigate('Precificacao', { produtoId: item.id })}
              >
                <Text style={styles.nome}>{item.nome}</Text>
                <View style={styles.row}>
                  <View style={styles.stat}>
                    <Text style={styles.statLabel}>Custo</Text>
                    <Text style={styles.statValue}>R$ {Number(item.custo_total).toFixed(2)}</Text>
                  </View>
                  {item.preco_venda !== null && (
                    <View style={styles.stat}>
                      <Text style={styles.statLabel}>Venda</Text>
                      <Text style={styles.statValue}>R$ {Number(item.preco_venda).toFixed(2)}</Text>
                    </View>
                  )}
                  {margem !== null && (
                    <View style={styles.stat}>
                      <Text style={styles.statLabel}>Margem</Text>
                      <Text style={[styles.statValue, margemBoa ? styles.success : styles.danger]}>
                        {margem.toFixed(1)}%
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => navigation.navigate('ProdutoForm', { id: item.id })}
                >
                  <Text style={styles.editTxt}>Ed.</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                  <Text style={styles.deleteTxt}>X</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('ProdutoForm')}>
        <Text style={styles.fabText}>+ Novo Produto</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F4' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF8F4' },
  list: { padding: 16, paddingBottom: 90 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  empty: { color: '#8A6A5A', fontSize: 16, textAlign: 'center', lineHeight: 24 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, marginBottom: 12,
    flexDirection: 'row', alignItems: 'stretch',
    borderWidth: 1, borderColor: '#EDD9C8',
  },
  cardContent: { flex: 1, padding: 14 },
  nome: { fontSize: 16, fontWeight: '700', color: '#2D1B10', marginBottom: 10 },
  row: { flexDirection: 'row', gap: 16 },
  stat: {},
  statLabel: { fontSize: 11, color: '#8A6A5A', marginBottom: 2 },
  statValue: { fontSize: 14, fontWeight: '700', color: '#2D1B10' },
  success: { color: '#2E7D32' },
  danger: { color: '#C0392B' },
  actions: { flexDirection: 'column', justifyContent: 'center' },
  editBtn: { flex: 1, width: 52, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FEF0E8' },
  editTxt: { color: '#D45C2A', fontWeight: '700', fontSize: 11 },
  deleteBtn: { flex: 1, width: 52, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FEE2E2', borderTopRightRadius: 12, borderBottomRightRadius: 12 },
  deleteTxt: { color: '#C0392B', fontWeight: '800', fontSize: 16 },
  fab: {
    margin: 16, backgroundColor: '#D45C2A', borderRadius: 12,
    padding: 16, alignItems: 'center',
  },
  fabText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
