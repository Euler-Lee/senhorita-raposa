import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import FoxBackground from '../components/FoxBackground';
import AnimatedPressable from '../components/AnimatedPressable';
import { colors, fontSize, fontWeight, space, radius, shadow } from '../lib/theme';

// ─── Módulos ──────────────────────────────────────────────────────────────────
const MODULES = [
  {
    key: 'ingredientes',
    icon: '🥕',
    label: 'Ingredientes',
    desc: 'Matérias-primas e custo unitário',
    accent: colors.fox,
    bg: colors.foxBg,
    border: colors.foxBorder,
    tab: 'IngredientesTab',
  },
  {
    key: 'embalagens',
    icon: '📦',
    label: 'Embalagens',
    desc: 'Caixas, sacos e rótulos',
    accent: colors.purple,
    bg: colors.purpleBg,
    border: colors.purpleBorder,
    tab: 'EmbalagensTb',
  },
  {
    key: 'produtos',
    icon: '🍳',
    label: 'Produtos',
    desc: 'Fichas técnicas e precificação',
    accent: colors.fox,
    bg: '#FDE8D8',
    border: '#F0BCA0',
    tab: 'ProdutosTab',
  },
  {
    key: 'clientes',
    icon: '👥',
    label: 'Clientes',
    desc: 'Carteira e controle de pedidos',
    accent: colors.green,
    bg: colors.greenBg,
    border: colors.greenBorder,
    tab: 'ClientesTab',
  },
  {
    key: 'financeiro',
    icon: '📊',
    label: 'Financeiro',
    desc: 'Receita, recebimentos e pendências',
    accent: colors.blue,
    bg: colors.blueBg,
    border: colors.blueBorder,
    tab: 'FinanceiroTab',
  },
] as const;

// ─── Componente ───────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }: any) {
  const { width } = useWindowDimensions();

  // Breakpoints responsivos
  const isDesktop = width >= 960;
  const isTablet  = width >= 600;

  const HPAD       = isDesktop ? 48 : 20;
  const CARD_GAP   = isDesktop ? 16 : 12;
  const NUM_COLS   = isDesktop ? 3 : 2;
  const MAX_W      = 1140;

  const innerWidth = Math.min(width, MAX_W) - HPAD * 2;
  const cardW      = (innerWidth - CARD_GAP * (NUM_COLS - 1)) / NUM_COLS;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <FoxBackground opacity={0.028} />

      <ScrollView
        contentContainerStyle={[
          s.scroll,
          { paddingHorizontal: HPAD },
          isDesktop && s.scrollDesktop,
        ]}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Header ─────────────────────────────────────────── */}
        <View style={[s.header, isTablet && s.headerTablet]}>
          <View style={s.brand}>
            <Text style={s.brandName}>Senhorita Raposa</Text>
            <Text style={s.brandTag}>Precificação inteligente para o seu negócio</Text>
          </View>
          <TouchableOpacity
            style={s.logoutBtn}
            onPress={() => supabase.auth.signOut()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={s.logoutTxt}>Sair</Text>
          </TouchableOpacity>
        </View>

        {/* ── Linha divisória ─────────────────────────────────── */}
        <View style={s.divider} />

        {/* ── Subtítulo ───────────────────────────────────────── */}
        <Text style={[s.sectionLabel, isTablet && s.sectionLabelTablet]}>
          Módulos do sistema
        </Text>

        {/* ── Grid de módulos ─────────────────────────────────── */}
        <View style={[s.grid, { gap: CARD_GAP }]}>
          {MODULES.map((m) => (
            <AnimatedPressable
              key={m.key}
              style={[s.card, { width: cardW, backgroundColor: m.bg, borderColor: m.border }]}
              onPress={() => navigation.navigate(m.tab)}
            >
              {/* Ícone */}
              <View style={[s.iconWrap, { backgroundColor: m.accent + '18' }]}>
                <Text style={s.iconEmoji}>{m.icon}</Text>
              </View>

              {/* Texto */}
              <Text style={[s.cardTitle, { color: m.accent }]}>{m.label}</Text>
              <Text style={s.cardDesc} numberOfLines={2}>{m.desc}</Text>

              {/* Seta */}
              <Text style={[s.cardArrow, { color: m.accent + 'AA' }]}>→</Text>
            </AnimatedPressable>
          ))}
        </View>

        {/* ── Rodapé sutil ────────────────────────────────────── */}
        <Text style={s.footer}>🦊 Senhorita Raposa v1.0</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  scroll: { paddingTop: space[5], paddingBottom: space[10] },
  scrollDesktop: { alignSelf: 'center', width: '100%', maxWidth: 1140 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: space[5],
  },
  headerTablet: { alignItems: 'center' },

  brand: { flex: 1, marginRight: space[4] },
  brandName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.primary,
    letterSpacing: -0.5,
  },
  brandTag: {
    fontSize: fontSize.sm,
    color: colors.text2,
    marginTop: 3,
  },

  logoutBtn: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    backgroundColor: colors.dangerBg,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: '#F5C8C0',
  },
  logoutTxt: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.danger,
  },

  // Divisória
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: space[5],
  },

  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text3,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: space[4],
  },
  sectionLabelTablet: { marginBottom: space[5] },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  // Card
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: space[4],
    minHeight: 148,
    ...shadow.sm,
  },

  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: space[3],
  },
  iconEmoji: { fontSize: 22 },

  cardTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.heavy,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: fontSize.xs,
    color: colors.text2,
    lineHeight: 16,
    flex: 1,
  },
  cardArrow: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    marginTop: space[2],
    textAlign: 'right',
  },

  // Rodapé
  footer: {
    textAlign: 'center',
    fontSize: fontSize.xs,
    color: colors.text3,
    marginTop: space[8],
  },
});


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
