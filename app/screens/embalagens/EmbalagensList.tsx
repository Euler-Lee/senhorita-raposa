import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import type { Embalagem } from '../../lib/types';
import { colors, fontSize, fontWeight, radius, shadow, space } from '../../lib/theme';

export default function EmbalagensList({ navigation }: any) {
  const [embalagens, setEmbalagens] = useState<Embalagem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('embalagens').select('*').order('nome');
    setEmbalagens((data as Embalagem[]) ?? []);
    setLoading(false);
  }, []);

  useFocusEffect(load);

  async function handleDelete(id: string) {
    if (Platform.OS === 'web') {
      await supabase.from('embalagens').delete().eq('id', id);
      load();
      return;
    }
    Alert.alert('Excluir embalagem', 'Esta ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive',
        onPress: async () => {
          await supabase.from('embalagens').delete().eq('id', id);
          load();
        },
      },
    ]);
  }

  if (loading) return <View style={s.center}><ActivityIndicator color="#7A3A9A" size="large" /></View>;

  return (
    <View style={s.container}>
      <FlatList
        data={embalagens}
        keyExtractor={i => i.id}
        contentContainerStyle={embalagens.length === 0 ? s.emptyContainer : s.list}
        ListEmptyComponent={
          <Text style={s.empty}>Nenhuma embalagem cadastrada ainda.{'\n'}Adicione caixas, sacos, rótulos e mais.</Text>
        }
        renderItem={({ item }) => {
          const unitario = Number(item.custo) / Number(item.quantidade_embalagem);
          const un = item.unidade_medida;
          const custoFmt = unitario < 0.1 ? unitario.toFixed(4) : unitario.toFixed(2).replace('.', ',');
          return (
            <View style={s.card}>
              <TouchableOpacity
                style={s.cardContent}
                onPress={() => navigation.navigate('EmbalagemForm', { id: item.id })}
              >
                <Text style={s.nome}>{item.nome}</Text>
                <Text style={s.meta}>
                  Embalagem: {Number(item.quantidade_embalagem).toFixed(0)}{un} por R$ {Number(item.custo).toFixed(2).replace('.', ',')}
                </Text>
                <Text style={s.unitario}>R$ {custoFmt} por {un}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.deleteBtn} onPress={() => handleDelete(item.id)}>
                <Text style={s.deleteTxt}>✕</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
      <TouchableOpacity style={s.fab} onPress={() => navigation.navigate('EmbalagemForm')}>
        <Text style={s.fabText}>+ Nova Embalagem</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
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
  nome: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text1, marginBottom: 4 },
  meta: { fontSize: fontSize.sm, color: colors.text2 },
  unitario: { fontSize: fontSize.xs, color: colors.purple, marginTop: 4, fontWeight: fontWeight.semibold },
  deleteBtn: {
    width: 52, justifyContent: 'center', alignItems: 'center',
    backgroundColor: colors.dangerBg, borderTopRightRadius: radius.md, borderBottomRightRadius: radius.md,
  },
  deleteTxt: { color: colors.danger, fontWeight: fontWeight.heavy, fontSize: fontSize.base },
  fab: { margin: space[4], backgroundColor: colors.purple, borderRadius: radius.md, padding: space[4], alignItems: 'center', ...shadow.sm },
  fabText: { color: '#fff', fontSize: fontSize.base, fontWeight: fontWeight.bold },
});
