/**
 * Senhorita Raposa — Design System
 * Paleta profissional com laranja-raposa como acento controlado
 */

// ─── Cores ────────────────────────────────────────────────────────────────────
export const colors = {
  // Marca (laranja-raposa — usado apenas como acento)
  primary:     '#D05820',
  primaryHover:'#B84416',
  primaryBg:   '#FEF0E0',
  primaryBgDeep:'#FCDCC3',

  // Backgrounds
  bg:          '#FDF8F2',   // creme quente — fundo principal
  surface:     '#FFFCF9',   // cards e superfícies

  // Texto
  text1:       '#1A0F06',   // título / destaque
  text2:       '#6B5848',   // corpo / secundário
  text3:       '#A89180',   // placeholder / muted

  // Bordas
  border:      '#E8DDD0',
  borderLight: '#F2EBE2',

  // Módulos — acento + fundo suave
  fox:        '#D05820',  foxBg:    '#FEF0E0',  foxBorder: '#F5C898',
  purple:     '#7230A8',  purpleBg: '#F4EEFF',  purpleBorder: '#D0AAEE',
  green:      '#1A6B4A',  greenBg:  '#EDFAF3',  greenBorder:  '#9ADCBC',
  blue:       '#1A527A',  blueBg:   '#EAF3FB',  blueBorder:   '#96C8EF',

  // Semântico
  success:    '#1A6B4A',
  successBg:  '#EDFAF3',
  danger:     '#B83020',
  dangerBg:   '#FEF0EE',
  warning:    '#B07010',
  warningBg:  '#FEF5E0',
};

// ─── Tipografia ───────────────────────────────────────────────────────────────
export const fontSize = {
  xs:   11,
  sm:   13,
  base: 15,
  md:   17,
  lg:   20,
  xl:   24,
  xxl:  30,
};

export const fontWeight = {
  regular:   '400' as const,
  medium:    '500' as const,
  semibold:  '600' as const,
  bold:      '700' as const,
  heavy:     '800' as const,
  black:     '900' as const,
};

// ─── Espaçamento (escala de 4pt) ──────────────────────────────────────────────
export const space = {
  1: 4,   2: 8,   3: 12,
  4: 16,  5: 20,  6: 24,
  7: 28,  8: 32,  10: 40,
};

// ─── Raio de borda ────────────────────────────────────────────────────────────
export const radius = {
  sm:   8,
  md:   14,
  lg:   18,
  xl:   24,
  full: 9999,
};

// ─── Sombras (iOS + Android + Web) ───────────────────────────────────────────
export const shadow = {
  xs: {
    shadowColor: '#18110A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  sm: {
    shadowColor: '#18110A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  md: {
    shadowColor: '#18110A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 5,
  },
};

// ─── Estilos de header para os navegadores ────────────────────────────────────
export const headerStyle = {
  default: {
    headerStyle: { backgroundColor: colors.surface },
    headerTintColor: colors.primary,
    headerTitleStyle: { fontWeight: fontWeight.heavy, color: colors.text1, fontSize: fontSize.base },
    headerShadowVisible: false,
    headerBackTitleVisible: false,
  },
  green: {
    headerStyle: { backgroundColor: colors.surface },
    headerTintColor: colors.green,
    headerTitleStyle: { fontWeight: fontWeight.heavy, color: colors.text1, fontSize: fontSize.base },
    headerShadowVisible: false,
    headerBackTitleVisible: false,
  },
  blue: {
    headerStyle: { backgroundColor: colors.surface },
    headerTintColor: colors.blue,
    headerTitleStyle: { fontWeight: fontWeight.heavy, color: colors.text1, fontSize: fontSize.base },
    headerShadowVisible: false,
    headerBackTitleVisible: false,
  },
  purple: {
    headerStyle: { backgroundColor: colors.surface },
    headerTintColor: colors.purple,
    headerTitleStyle: { fontWeight: fontWeight.heavy, color: colors.text1, fontSize: fontSize.base },
    headerShadowVisible: false,
    headerBackTitleVisible: false,
  },
};
