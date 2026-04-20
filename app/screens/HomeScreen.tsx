import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

type Bloco = {
  icone: string;
  titulo: string;
  descricao: string;
  cor: string;
  corFundo: string;
  onPress: () => void;
};

export default function HomeScreen({ navigation }: any) {
  const blocos: Bloco[] = [
    {
      icone: '🛒',
      titulo: 'Insumos',
      descricao: 'Cadastre ingredientes e materiais com custo por unidade',
      cor: '#C0572A',
      corFundo: '#FEF0E8',
      onPress: () => navigation.navigate('InsumosTab'),
    },
    {
      icone: '🎂',
      titulo: 'Produtos',
      descricao: 'Monte receitas, calcule custos e defina preços de venda',
      cor: '#9C4A1A',
      corFundo: '#FDE8D8',
      onPress: () => navigation.navigate('ProdutosTab'),
    },
    {
      icone: '👤',
      titulo: 'Clientes & Pedidos',
      descricao: 'Cadastre clientes, registre vendas e controle pagamentos',
      cor: '#1A6B5A',
      corFundo: '#E8F5F1',
      onPress: () => navigation.navigate('ClientesTab'),
    },
    {
      icone: '💰',
      titulo: 'Financeiro',
      descricao: 'Veja o total vendido, recebido e pendente por cliente',
      cor: '#1A5A7A',
      corFundo: '#E8F2F8',
      onPress: () => navigation.navigate('FinanceiroTab'),
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8F4" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Senhorita Raposa</Text>
            <Text style={styles.sub}>Precificação inteligente</Text>
          </View>
          <TouchableOpacity onPress={() => supabase.auth.signOut()} style={styles.sairBtn}>
            <Text style={styles.sairTxt}>Sair</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>O que deseja fazer?</Text>

        <View style={styles.grid}>
          {blocos.map((b) => (
            <TouchableOpacity
              key={b.titulo}
              style={[styles.bloco, { backgroundColor: b.corFundo, borderColor: b.cor + '33' }]}
              onPress={b.onPress}
              activeOpacity={0.75}
            >
              <Text style={styles.blocoIcone}>{b.icone}</Text>
              <Text style={[styles.blocoTitulo, { color: b.cor }]}>{b.titulo}</Text>
              <Text style={styles.blocoDesc}>{b.descricao}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF8F4' },
  container: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 28,
  },
  brand: { fontSize: 26, fontWeight: '900', color: '#D45C2A' },
  sub: { fontSize: 13, color: '#8A6A5A', marginTop: 2 },
  sairBtn: {
    paddingVertical: 6, paddingHorizontal: 14,
    backgroundColor: '#FEE2E2', borderRadius: 20, marginTop: 4,
  },
  sairTxt: { color: '#C0392B', fontWeight: '700', fontSize: 13 },
  sectionTitle: {
    fontSize: 16, fontWeight: '700', color: '#2D1B10', marginBottom: 16,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  bloco: {
    width: '47%', borderRadius: 16, padding: 18,
    borderWidth: 1.5, minHeight: 140,
  },
  blocoIcone: { fontSize: 32, marginBottom: 10 },
  blocoTitulo: { fontSize: 16, fontWeight: '800', marginBottom: 6 },
  blocoDesc: { fontSize: 12, color: '#5A3E30', lineHeight: 17 },
});
