import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { listarProdutosComCusto } from '../../lib/calculos';
import { supabase } from '../../lib/supabase';
import type { ProdutoComCusto } from '../../lib/types';
import { colors, fontSize, fontWeight, radius, shadow, space } from '../../lib/theme';
import { colors, fontSize, fontWeight, radius, shadow, space } from '../../lib/theme';

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
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  list: { padding: space[4], paddingBottom: 90 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: space[10] },
  empty: { color: colors.text2, fontSize: fontSize.base, textAlign: 'center', lineHeight: 24 },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.md, marginBottom: space[3],
    flexDirection: 'row', alignItems: 'stretch',
    borderWidth: 1, borderColor: colors.border, ...shadow.xs,
  },
  cardContent: { flex: 1, padding: space[4] },
  nome: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text1, marginBottom: space[2] },
  row: { flexDirection: 'row', gap: 16 },
  stat: {},
  statLabel: { fontSize: fontSize.xs, color: colors.text3, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.4 },
  statValue: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.text1 },
  success: { color: colors.success },
  danger: { color: colors.danger },
  actions: { flexDirection: 'column', justifyContent: 'center' },
  editBtn: { flex: 1, width: 52, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primaryBg },
  editTxt: { color: colors.primary, fontWeight: fontWeight.bold, fontSize: fontSize.xs },
  deleteBtn: { flex: 1, width: 52, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.dangerBg, borderTopRightRadius: radius.md, borderBottomRightRadius: radius.md },
  deleteTxt: { color: colors.danger, fontWeight: fontWeight.heavy, fontSize: fontSize.base },
  fab: { margin: space[4], backgroundColor: colors.primary, borderRadius: radius.md, padding: space[4], alignItems: 'center', ...shadow.sm },
  fabText: { color: '#fff', fontSize: fontSize.base, fontWeight: fontWeight.bold },
});
