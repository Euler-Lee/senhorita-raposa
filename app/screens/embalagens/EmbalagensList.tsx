import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, TextInput, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { supabase } from '../../lib/supabase';
import type { Embalagem } from '../../lib/types';
import FoxBackground from '../../components/FoxBackground';
import FoxLoader from '../../components/FoxLoader';
import ConfirmDialog from '../../components/ConfirmDialog';
import { colors, fontSize, fontWeight, radius, shadow, space } from '../../lib/theme';

export default function EmbalagensList({ navigation }: any) {
  const [embalagens, setEmbalagens] = useState<Embalagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busca, setBusca] = useState('');

  const filtrados = useMemo(
    () => embalagens.filter(e => e.nome.toLowerCase().includes(busca.toLowerCase())),
    [embalagens, busca]
  );

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('embalagens').select('*').order('nome');
    setEmbalagens((data as Embalagem[]) ?? []);
    setLoading(false);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const { data } = await supabase.from('embalagens').select('*').order('nome');
    setEmbalagens((data as Embalagem[]) ?? []);
    setRefreshing(false);
  }, []);

  useFocusEffect(load);

  async function handleDelete(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setConfirmId(id);
  }

  async function doDelete() {
    if (!confirmId) return;
    await supabase.from('embalagens').delete().eq('id', confirmId);
    setConfirmId(null);
    load();
  }

  if (loading) return <FoxLoader />;

  return (
    <View style={s.container}>
      <FoxBackground opacity={0.04} />
      <View style={s.searchWrap}>
        <TextInput
          style={s.search}
          placeholder="Buscar embalagem..."
          placeholderTextColor={colors.text3}
          value={busca}
          onChangeText={setBusca}
          clearButtonMode="while-editing"
        />
      </View>
      <FlatList
        data={filtrados}
        keyExtractor={i => i.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.purple} colors={[colors.purple]} />}
        contentContainerStyle={filtrados.length === 0 ? s.emptyContainer : s.list}
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            <Text style={s.emptyIcon}>📦</Text>
            <Text style={s.emptyTitle}>{busca ? 'Nenhum resultado' : 'Nenhuma embalagem ainda'}</Text>
            <Text style={s.emptySub}>{busca ? `Sem resultados para "${busca}"` : 'Adicione caixas, sacos, rótulos e mais.'}</Text>
          </View>
        }
        renderItem={({ item }) => {
          const unitario = Number(item.custo) / Number(item.quantidade_embalagem);
          const un = item.unidade_medida;
          const custoFmt = unitario < 0.1 ? unitario.toFixed(4) : unitario.toFixed(2).replace('.', ',');
          return (
            <View style={s.card}>
              <TouchableOpacity
                style={s.cardContent}
                onPress={() => { Haptics.selectionAsync(); navigation.navigate('EmbalagemForm', { id: item.id }); }}
              >
                <Text style={s.nome}>{item.nome}</Text>
                <Text style={s.meta}>
                  Embalagem: {Number(item.quantidade_embalagem).toFixed(0)}{un} por R$ {Number(item.custo).toFixed(2).replace('.', ',')}
                </Text>
                <Text style={s.unitario}>R$ {custoFmt} por {un}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.deleteBtn} onPress={() => handleDelete(item.id)}>
                <View style={s.deleteBtnInner}>
                  <Text style={s.deleteTxt}>✕</Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        }}
      />
      <TouchableOpacity style={s.fab} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); navigation.navigate('EmbalagemForm'); }}>
        <Text style={s.fabText}>+ Nova Embalagem</Text>
      </TouchableOpacity>
      <ConfirmDialog
        visible={confirmId !== null}
        title="Excluir embalagem"
        message="Esta ação não pode ser desfeita."
        onConfirm={doDelete}
        onCancel={() => setConfirmId(null)}
      />
    </View>
  );
}

const s = StyleSheet.create({
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
    borderWidth: 1, borderColor: colors.border, ...shadow.xs,
  },
  cardContent: { flex: 1, padding: space[4] },
  nome: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text1, marginBottom: 4 },
  meta: { fontSize: fontSize.sm, color: colors.text2 },
  unitario: { fontSize: fontSize.xs, color: colors.purple, marginTop: 4, fontWeight: fontWeight.semibold },
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
  fab: { margin: space[4], backgroundColor: colors.purple, borderRadius: radius.md, padding: space[4], alignItems: 'center', ...shadow.sm },
  fabText: { color: '#fff', fontSize: fontSize.base, fontWeight: fontWeight.bold },
});
