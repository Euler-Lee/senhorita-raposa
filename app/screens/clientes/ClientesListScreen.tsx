import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import type { Cliente } from '../../lib/types';

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
  container: { flex: 1, backgroundColor: '#F4FBF9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4FBF9' },
  list: { padding: 16, paddingBottom: 90 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  empty: { color: '#5A8A7A', fontSize: 16, textAlign: 'center', lineHeight: 24 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, marginBottom: 12,
    flexDirection: 'row', alignItems: 'stretch',
    borderWidth: 1, borderColor: '#C8E6DF',
  },
  cardContent: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  avatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A6B5A',
    color: '#fff', fontSize: 18, fontWeight: '800', textAlign: 'center',
    lineHeight: 40,
  },
  nome: { fontSize: 16, fontWeight: '700', color: '#0D2B24' },
  tel: { fontSize: 13, color: '#5A8A7A', marginTop: 2 },
  actions: { flexDirection: 'column' },
  editBtn: { flex: 1, width: 52, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E8F5F1' },
  editTxt: { color: '#1A6B5A', fontWeight: '700', fontSize: 11 },
  deleteBtn: { flex: 1, width: 52, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FEE2E2', borderTopRightRadius: 12, borderBottomRightRadius: 12 },
  deleteTxt: { color: '#C0392B', fontWeight: '700', fontSize: 16 },
  fab: {
    margin: 16, backgroundColor: '#1A6B5A', borderRadius: 12,
    padding: 16, alignItems: 'center',
  },
  fabText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
