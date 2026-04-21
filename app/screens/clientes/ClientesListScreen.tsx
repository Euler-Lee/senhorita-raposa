import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, TextInput, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { supabase } from '../../lib/supabase';
import FoxLoader from '../../components/FoxLoader';
import FoxBackground from '../../components/FoxBackground';
import ConfirmDialog from '../../components/ConfirmDialog';
import { colors, fontSize, fontWeight, radius, shadow, space } from '../../lib/theme';

export default function ClientesListScreen({ navigation }: any) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busca, setBusca] = useState('');

  const filtrados = useMemo(
    () => clientes.filter(c => c.nome.toLowerCase().includes(busca.toLowerCase())),
    [clientes, busca]
  );

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('clientes').select('*').order('nome');
    setClientes((data as Cliente[]) ?? []);
    setLoading(false);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const { data } = await supabase.from('clientes').select('*').order('nome');
    setClientes((data as Cliente[]) ?? []);
    setRefreshing(false);
  }, []);

  useFocusEffect(load);

  async function handleDelete(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setConfirmId(id);
  }

  async function doDelete() {
    if (!confirmId) return;
    await supabase.from('clientes').delete().eq('id', confirmId);
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
          placeholder="Buscar cliente..."
          placeholderTextColor={colors.text3}
          value={busca}
          onChangeText={setBusca}
          clearButtonMode="while-editing"
        />
      </View>
      <FlatList
        data={filtrados}
        keyExtractor={i => i.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.green} colors={[colors.green]} />}
        contentContainerStyle={filtrados.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>{busca ? 'Nenhum resultado' : 'Nenhum cliente ainda'}</Text>
            <Text style={styles.emptySub}>{busca ? `Sem resultados para "${busca}"` : 'Adicione seus primeiros clientes.'}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.cardContent}
              onPress={() => { Haptics.selectionAsync(); navigation.navigate('ClienteDetalhe', { clienteId: item.id, nome: item.nome }); }}
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
                onPress={() => { Haptics.selectionAsync(); navigation.navigate('ClienteForm', { id: item.id }); }}
              >
                <View style={styles.editBtnInner}>
                  <Text style={styles.editTxt}>✏️</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                <View style={styles.deleteBtnInner}>
                  <Text style={styles.deleteTxt}>✕</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <TouchableOpacity style={styles.fab} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); navigation.navigate('ClienteForm'); }}>
        <Text style={styles.fabText}>+ Novo Cliente</Text>
      </TouchableOpacity>
      <ConfirmDialog
        visible={confirmId !== null}
        title="Excluir cliente"
        message="Todos os pedidos deste cliente também serão excluídos."
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
  editBtn: { flex: 1, width: 52, justifyContent: 'center', alignItems: 'center' },
  editBtnInner: {
    width: 34, height: 34, borderRadius: 17,
    borderWidth: 1.5, borderColor: colors.greenBorder,
    backgroundColor: colors.greenBg,
    justifyContent: 'center', alignItems: 'center',
  },
  editTxt: { fontSize: 14, lineHeight: 16 },
  deleteBtn: { flex: 1, width: 52, justifyContent: 'center', alignItems: 'center', borderTopRightRadius: radius.md, borderBottomRightRadius: radius.md },
  deleteBtnInner: {
    width: 34, height: 34, borderRadius: 17,
    borderWidth: 1.5, borderColor: '#F5C0BA',
    backgroundColor: colors.dangerBg,
    justifyContent: 'center', alignItems: 'center',
  },
  deleteTxt: { color: colors.danger, fontWeight: fontWeight.bold, fontSize: 13, lineHeight: 13 },
  fab: { margin: space[4], backgroundColor: colors.green, borderRadius: radius.md, padding: space[4], alignItems: 'center', ...shadow.sm },
  fabText: { color: '#fff', fontSize: fontSize.base, fontWeight: fontWeight.bold },
});
