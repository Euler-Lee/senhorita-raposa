import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { colors, fontSize, fontWeight, radius, shadow, space } from '../../lib/theme';

export default function ClientesListScreen({ navigation }: any) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('clientes').select('*').order('nome');
    setClientes((data as Cliente[]) ?? []);
    setLoading(false);
  }, []);

  useFocusEffect(load);

  async function handleDelete(id: string) {
    if (Platform.OS === 'web') {
      await supabase.from('clientes').delete().eq('id', id);
      load();
      return;
    }
    Alert.alert('Excluir cliente', 'Todos os pedidos deste cliente também serão excluídos.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive',
        onPress: async () => {
          await supabase.from('clientes').delete().eq('id', id);
          load();
        },
      },
    ]);
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color="#1A6B5A" size="large" /></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={clientes}
        keyExtractor={i => i.id}
        contentContainerStyle={clientes.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhum cliente cadastrado ainda.{'\n'}Adicione seus primeiros clientes.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.cardContent}
              onPress={() => navigation.navigate('ClienteDetalhe', { clienteId: item.id, nome: item.nome })}
            >
              <Text style={styles.avatar}>{item.nome.charAt(0).toUpperCase()}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.nome}>{item.nome}</Text>
                {item.telefone ? <Text style={styles.tel}>{item.telefone}</Text> : null}
              </View>
            </TouchableOpacity>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => navigation.navigate('ClienteForm', { id: item.id })}
              >
                <Text style={styles.editTxt}>Ed.</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteTxt}>X</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('ClienteForm')}>
        <Text style={styles.fabText}>+ Novo Cliente</Text>
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
  cardContent: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: space[4], gap: 12 },
  avatar: {
    width: 40, height: 40, borderRadius: radius.full, backgroundColor: colors.green,
    color: '#fff', fontSize: fontSize.md, fontWeight: fontWeight.heavy, textAlign: 'center',
    lineHeight: 40,
  },
  nome: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text1 },
  tel: { fontSize: fontSize.sm, color: colors.text2, marginTop: 2 },
  actions: { flexDirection: 'column' },
  editBtn: { flex: 1, width: 52, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.greenBg },
  editTxt: { color: colors.green, fontWeight: fontWeight.bold, fontSize: fontSize.xs },
  deleteBtn: { flex: 1, width: 52, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.dangerBg, borderTopRightRadius: radius.md, borderBottomRightRadius: radius.md },
  deleteTxt: { color: colors.danger, fontWeight: fontWeight.bold, fontSize: fontSize.base },
  fab: { margin: space[4], backgroundColor: colors.green, borderRadius: radius.md, padding: space[4], alignItems: 'center', ...shadow.sm },
  fabText: { color: '#fff', fontSize: fontSize.base, fontWeight: fontWeight.bold },
});
