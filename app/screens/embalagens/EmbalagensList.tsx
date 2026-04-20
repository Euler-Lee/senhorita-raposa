import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import type { Embalagem } from '../../lib/types';

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
  container: { flex: 1, backgroundColor: '#FAF4FF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAF4FF' },
  list: { padding: 16, paddingBottom: 90 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  empty: { color: '#8A6AAA', fontSize: 16, textAlign: 'center', lineHeight: 24 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, marginBottom: 12,
    flexDirection: 'row', alignItems: 'stretch',
    borderWidth: 1, borderColor: '#E0CCEA',
  },
  cardContent: { flex: 1, padding: 14 },
  nome: { fontSize: 16, fontWeight: '700', color: '#2D1B3A', marginBottom: 4 },
  meta: { fontSize: 13, color: '#8A6AAA' },
  unitario: { fontSize: 12, color: '#7A3A9A', marginTop: 4, fontWeight: '600' },
  deleteBtn: {
    width: 52, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#FEE2E2', borderTopRightRadius: 12, borderBottomRightRadius: 12,
  },
  deleteTxt: { color: '#C0392B', fontWeight: '800', fontSize: 16 },
  fab: { margin: 16, backgroundColor: '#7A3A9A', borderRadius: 12, padding: 16, alignItems: 'center' },
  fabText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
