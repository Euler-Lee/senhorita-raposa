import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import FoxBackground from '../components/FoxBackground';
import AnimatedPressable from '../components/AnimatedPressable';

type Bloco = {
  emoji: string;
  titulo: string;
  descricao: string;
  cor: string;
  corFundo: string;
  onPress: () => void;
};

export default function HomeScreen({ navigation }: any) {
  const blocos: Bloco[] = [
    {
      emoji: '🦊\n🥕🌿',
      titulo: 'Ingredientes',
      descricao: 'Cadastre ingredientes e materiais com custo por unidade',
      cor: '#C0572A',
      corFundo: '#FEF0E8',
      onPress: () => navigation.navigate('IngredientesTab'),
    },
    {
      emoji: '🦊\n📦🏷️',
      titulo: 'Embalagens',
      descricao: 'Cadastre caixas, sacos, rótulos e calcule o custo por unidade',
      cor: '#7A3A9A',
      corFundo: '#F3EBF9',
      onPress: () => navigation.navigate('EmbalagensTb'),
    },
    {
      emoji: '🦊\n👩‍🍳🍳',
      titulo: 'Produtos',
      descricao: 'Monte receitas com ingredientes e embalagens, calcule custos e precifique',
      cor: '#9C4A1A',
      corFundo: '#FDE8D8',
      onPress: () => navigation.navigate('ProdutosTab'),
    },
    {
      emoji: '🦊🦊🦊',
      titulo: 'Clientes & Pedidos',
      descricao: 'Cadastre clientes, registre vendas e controle pagamentos',
      cor: '#1A6B5A',
      corFundo: '#E8F5F1',
      onPress: () => navigation.navigate('ClientesTab'),
    },
    {
      emoji: '🦊\n💰📊',
      titulo: 'Financeiro',
      descricao: 'Total vendido, recebido e pendente por cliente',
      cor: '#1A5A7A',
      corFundo: '#E8F2F8',
      onPress: () => navigation.navigate('FinanceiroTab'),
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8F4" />
      <FoxBackground opacity={0.05} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Senhorita Raposa</Text>
            <Text style={styles.sub}>🦊 Precificação inteligente</Text>
          </View>
          <TouchableOpacity onPress={() => supabase.auth.signOut()} style={styles.sairBtn}>
            <Text style={styles.sairTxt}>Sair</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>O que deseja fazer?</Text>

        <View style={styles.grid}>
          {blocos.map((b) => (
            <AnimatedPressable
              key={b.titulo}
              style={[styles.bloco, { backgroundColor: b.corFundo }]}
              onPress={b.onPress}
            >
              <Text style={styles.blocoEmoji}>{b.emoji}</Text>
              <Text style={[styles.blocoTitulo, { color: b.cor }]}>{b.titulo}</Text>
              <Text style={styles.blocoDesc}>{b.descricao}</Text>
            </AnimatedPressable>
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
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#2D1B10', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  bloco: {
    width: '47%', borderRadius: 16, padding: 18, minHeight: 150,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  blocoEmoji: { fontSize: 26, marginBottom: 8, lineHeight: 32 },
  blocoTitulo: { fontSize: 15, fontWeight: '800', marginBottom: 6 },
  blocoDesc: { fontSize: 11.5, color: '#5A3E30', lineHeight: 16 },
});
