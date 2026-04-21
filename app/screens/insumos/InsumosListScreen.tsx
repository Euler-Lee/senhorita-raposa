import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, TextInput, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { supabase } from '../../lib/supabase';
import type { Insumo } from '../../lib/types';
import FoxBackground from '../../components/FoxBackground';
import FoxLoader from '../../components/FoxLoader';
import ConfirmDialog from '../../components/ConfirmDialog';
import { colors, fontSize, fontWeight, radius, shadow, space } from '../../lib/theme';

export default function InsumosListScreen({ navigation }: any) {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busca, setBusca] = useState('');

  const filtrados = useMemo(
    () => insumos.filter(i => i.nome.toLowerCase().includes(busca.toLowerCase())),
    [insumos, busca]
  );

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('insumos').select('*').order('nome');
    if (!error && data) setInsumos(data as Insumo[]);
    setLoading(false);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const { data, error } = await supabase.from('insumos').select('*').order('nome');
    if (!error && data) setInsumos(data as Insumo[]);
    setRefreshing(false);
  }, []);

  useFocusEffect(load);

  async function handleDelete(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setConfirmId(id);
  }

  async function doDelete() {
    if (!confirmId) return;
    await supabase.from('insumos').delete().eq('id', confirmId);
    setConfirmId(null);
    load();
  }

  if (loading) return <FoxLoader />;

  return (
    <View style={styles.container}>
      <FoxBackground opacity={0.04} />
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.search}
          placeholder="Buscar ingrediente..."
          placeholderTextColor={colors.text3}
          value={busca}
          onChangeText={setBusca}
          clearButtonMode="while-editing"
        />
      </View>
      <FlatList
        data={filtrados}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
        contentContainerStyle={filtrados.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>🥕</Text>
            <Text style={styles.emptyTitle}>{busca ? 'Nenhum resultado' : 'Nenhum ingrediente ainda'}</Text>
            <Text style={styles.emptySub}>{busca ? `Sem resultados para "${busca}"` : 'Adicione seus ingredientes e materiais.'}</Text>
          </View>
        }
        renderItem={({ item }) => {
          const custoUnit = Number(item.preco_custo) / Number(item.quantidade_embalagem);
          const un = item.unidade_medida;
          const custoFormatado = ((un === 'g' || un === 'ml') && custoUnit < 0.1)
            ? custoUnit.toFixed(4)
            : custoUnit.toFixed(2).replace('.', ',');
          return (
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.cardContent}
                onPress={() => { Haptics.selectionAsync(); navigation.navigate('InsumoForm', { id: item.id }); }}
              >
                <Text style={styles.nome}>{item.nome}</Text>
                <Text style={styles.meta}>
                  Embalagem: {Number(item.quantidade_embalagem).toFixed(0)}{item.unidade_medida} por R$ {Number(item.preco_custo).toFixed(2).replace('.', ',')}
                </Text>
                <Text style={styles.unitario}>
                  R$ {custoFormatado} por {item.unidade_medida}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                <View style={styles.deleteBtnInner}>
                  <Text style={styles.deleteTxt}>✕</Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        }}
      />
      <TouchableOpacity style={styles.fab} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); navigation.navigate('InsumoForm'); }}>
        <Text style={styles.fabText}>+ Novo Ingrediente</Text>
      </TouchableOpacity>
      <ConfirmDialog
        visible={confirmId !== null}
        title="Excluir ingrediente"
        message="Esta ação não pode ser desfeita."
        onConfirm={doDelete}
        onCancel={() => setConfirmId(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  list: { padding: space[4], paddingBottom: 90 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: space[10] },
  emptyWrap: { alignItems: 'center', paddingHorizontal: 32 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text1, marginBottom: 8, textAlign: 'center' },
  emptySub: { fontSize: fontSize.sm, color: colors.text2, textAlign: 'center', lineHeight: 22 },
  empty: { color: colors.text2, fontSize: fontSize.base, textAlign: 'center', lineHeight: 24 },
  searchWrap: { paddingHorizontal: space[4], paddingTop: space[3], paddingBottom: space[2] },
  search: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: fontSize.base, color: colors.text1,
    ...shadow.xs,
  },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.md, marginBottom: space[3],
    flexDirection: 'row', alignItems: 'stretch',
    borderWidth: 1, borderColor: colors.border,
    ...shadow.xs,
  },
  cardContent: { flex: 1, padding: space[4] },
  nome: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text1, marginBottom: 4 },
  meta: { fontSize: fontSize.sm, color: colors.text2 },
  unitario: { fontSize: fontSize.xs, color: colors.primary, marginTop: 4, fontWeight: fontWeight.semibold },
  deleteBtn: {
    width: 52, justifyContent: 'center', alignItems: 'center',
  },
  deleteBtnInner: {
    width: 34, height: 34, borderRadius: 17,
    borderWidth: 1.5, borderColor: '#F5C0BA',
    backgroundColor: colors.dangerBg,
    justifyContent: 'center', alignItems: 'center',
  },
  deleteTxt: { color: colors.danger, fontWeight: fontWeight.heavy, fontSize: 13, lineHeight: 13 },
  fab: {
    margin: space[4], backgroundColor: colors.primary, borderRadius: radius.md,
    padding: space[4], alignItems: 'center', ...shadow.sm,
  },
  fabText: { color: '#fff', fontSize: fontSize.base, fontWeight: fontWeight.bold },
});
