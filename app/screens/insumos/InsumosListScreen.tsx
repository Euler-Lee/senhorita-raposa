import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import type { Insumo } from '../../lib/types';
import FoxBackground from '../../components/FoxBackground';
import { colors, fontSize, fontWeight, radius, shadow, space } from '../../lib/theme';

export default function InsumosListScreen({ navigation }: any) {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('insumos').select('*').order('nome');
    if (!error && data) setInsumos(data as Insumo[]);
    setLoading(false);
  }, []);

  useFocusEffect(load);

  async function handleDelete(id: string) {
    if (Platform.OS === 'web') {
      await supabase.from('insumos').delete().eq('id', id);
      load();
      return;
    }
    Alert.alert('Excluir ingrediente', 'Esta ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive',
        onPress: async () => {
          await supabase.from('insumos').delete().eq('id', id);
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
        data={insumos}
        keyExtractor={item => item.id}
        contentContainerStyle={insumos.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhum ingrediente cadastrado ainda.{"\n"}Adicione seus ingredientes e materiais.</Text>
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
                onPress={() => navigation.navigate('InsumoForm', { id: item.id })}
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
                <Text style={styles.deleteTxt}>X</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('InsumoForm')}>
        <Text style={styles.fabText}>+ Novo Ingrediente</Text>
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
    borderWidth: 1, borderColor: colors.border,
    ...shadow.xs,
  },
  cardContent: { flex: 1, padding: space[4] },
  nome: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text1, marginBottom: 4 },
  meta: { fontSize: fontSize.sm, color: colors.text2 },
  unitario: { fontSize: fontSize.xs, color: colors.primary, marginTop: 4, fontWeight: fontWeight.semibold },
  deleteBtn: {
    width: 52, justifyContent: 'center', alignItems: 'center',
    backgroundColor: colors.dangerBg, borderTopRightRadius: radius.md, borderBottomRightRadius: radius.md,
  },
  deleteTxt: { color: colors.danger, fontWeight: fontWeight.heavy, fontSize: fontSize.base },
  fab: {
    margin: space[4], backgroundColor: colors.primary, borderRadius: radius.md,
    padding: space[4], alignItems: 'center', ...shadow.sm,
  },
  fabText: { color: '#fff', fontSize: fontSize.base, fontWeight: fontWeight.bold },
});
