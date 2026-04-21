import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabActions } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import FoxBackground from '../components/FoxBackground';
import AnimatedPressable from '../components/AnimatedPressable';
import { colors } from '../lib/theme';

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
    accent: '#9C4A1A',
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

export default function HomeScreen({ navigation }: any) {
  const { width } = useWindowDimensions();
  const HPAD = 20;
  const GAP = 12;
  const cardW = Math.floor((width - HPAD * 2 - GAP) / 2);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <FoxBackground opacity={0.028} />
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.header}>
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

        <View style={s.divider} />

        <Text style={s.sectionLabel}>Módulos do sistema</Text>

        <View style={s.grid}>
          {MODULES.map((m, i) => (
            <AnimatedPressable
              key={m.key}
              style={[
                s.card,
                { width: cardW, backgroundColor: m.bg, borderColor: m.border },
                i % 2 === 1 && { marginLeft: GAP },
                i >= 2 && { marginTop: GAP },
              ]}
              onPress={() => navigation.dispatch(TabActions.jumpTo(m.tab))}
            >
              <View style={[s.iconWrap, { backgroundColor: m.accent + '20' }]}>
                <Text style={s.iconEmoji}>{m.icon}</Text>
              </View>
              <Text style={[s.cardTitle, { color: m.accent }]}>{m.label}</Text>
              <Text style={s.cardDesc} numberOfLines={2}>{m.desc}</Text>
              <Text style={[s.cardArrow, { color: m.accent + 'AA' }]}>→</Text>
            </AnimatedPressable>
          ))}
        </View>

        <Text style={s.footer}>🦊 Senhorita Raposa v1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingTop: 20, paddingBottom: 40, paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  brand: { flex: 1, marginRight: 16 },
  brandName: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  brandTag: { fontSize: 13, color: colors.text2, marginTop: 3 },
  logoutBtn: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    backgroundColor: colors.dangerBg,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#F5C8C0',
  },
  logoutTxt: { fontSize: 13, fontWeight: '700', color: colors.danger },
  divider: { height: 1, backgroundColor: colors.border, marginBottom: 20 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text3,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    minHeight: 152,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconEmoji: { fontSize: 22 },
  cardTitle: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  cardDesc: { fontSize: 11, color: colors.text2, lineHeight: 16, flex: 1 },
  cardArrow: { fontSize: 17, fontWeight: '700', marginTop: 8, textAlign: 'right' },
  footer: { textAlign: 'center', fontSize: 11, color: colors.text3, marginTop: 32 },
});
