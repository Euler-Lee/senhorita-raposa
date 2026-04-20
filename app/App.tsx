import 'react-native-url-polyfill/auto';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { colors, headerStyle as hs } from './lib/theme';

// Auth
import LoginScreen from './screens/auth/LoginScreen';
import SignupScreen from './screens/auth/SignupScreen';

// Home
import HomeScreen from './screens/HomeScreen';

// Insumos / Ingredientes
import InsumosListScreen from './screens/insumos/InsumosListScreen';
import InsumoFormScreen from './screens/insumos/InsumoFormScreen';

// Embalagens
import EmbalagensList from './screens/embalagens/EmbalagensList';
import EmbalagemFormScreen from './screens/embalagens/EmbalagemFormScreen';

// Produtos
import ProdutosListScreen from './screens/produtos/ProdutosListScreen';
import ProdutoFormScreen from './screens/produtos/ProdutoFormScreen';
import PrecificacaoScreen from './screens/PrecificacaoScreen';

// Clientes
import ClientesListScreen from './screens/clientes/ClientesListScreen';
import ClienteFormScreen from './screens/clientes/ClienteFormScreen';
import ClienteDetalheScreen from './screens/clientes/ClienteDetalheScreen';
import PedidoFormScreen from './screens/clientes/PedidoFormScreen';

// Financeiro
import FinanceiroScreen from './screens/FinanceiroScreen';

const AuthStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const IngredientesStack = createNativeStackNavigator();
const EmbalagensSt = createNativeStackNavigator();
const ProdutosStack = createNativeStackNavigator();
const ClientesStack = createNativeStackNavigator();
const FinanceiroStack = createNativeStackNavigator();

const HEADER = hs.default;
const HEADER_VERDE = hs.green;
const HEADER_AZUL = hs.blue;
const HEADER_ROXO = hs.purple;

function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
    </HomeStack.Navigator>
  );
}

function IngredientesNavigator() {
  return (
    <IngredientesStack.Navigator screenOptions={HEADER}>
      <IngredientesStack.Screen name="InsumosList" component={InsumosListScreen} options={{ title: 'Ingredientes' }} />
      <IngredientesStack.Screen name="InsumoForm" component={InsumoFormScreen} options={{ title: 'Novo Ingrediente' }} />
    </IngredientesStack.Navigator>
  );
}

function EmbalagenNavigator() {
  return (
    <EmbalagensSt.Navigator screenOptions={HEADER_ROXO}>
      <EmbalagensSt.Screen name="EmbalagensList" component={EmbalagensList} options={{ title: 'Embalagens' }} />
      <EmbalagensSt.Screen name="EmbalagemForm" component={EmbalagemFormScreen} options={{ title: 'Nova Embalagem' }} />
    </EmbalagensSt.Navigator>
  );
}

function ProdutosNavigator() {
  return (
    <ProdutosStack.Navigator screenOptions={HEADER}>
      <ProdutosStack.Screen name="ProdutosList" component={ProdutosListScreen} options={{ title: 'Produtos' }} />
      <ProdutosStack.Screen name="ProdutoForm" component={ProdutoFormScreen} options={{ title: 'Novo Produto' }} />
      <ProdutosStack.Screen name="Precificacao" component={PrecificacaoScreen} options={{ title: 'Precificacao' }} />
    </ProdutosStack.Navigator>
  );
}

function ClientesNavigator() {
  return (
    <ClientesStack.Navigator screenOptions={HEADER_VERDE}>
      <ClientesStack.Screen name="ClientesList" component={ClientesListScreen} options={{ title: 'Clientes' }} />
      <ClientesStack.Screen name="ClienteForm" component={ClienteFormScreen} options={{ title: 'Novo Cliente' }} />
      <ClientesStack.Screen name="ClienteDetalhe" component={ClienteDetalheScreen} options={{ title: 'Cliente' }} />
      <ClientesStack.Screen name="PedidoForm" component={PedidoFormScreen} options={{ title: 'Novo Pedido' }} />
    </ClientesStack.Navigator>
  );
}

function FinanceiroNavigator() {
  return (
    <FinanceiroStack.Navigator screenOptions={HEADER_AZUL}>
      <FinanceiroStack.Screen name="Financeiro" component={FinanceiroScreen} options={{ title: 'Financeiro' }} />
    </FinanceiroStack.Navigator>
  );
}

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text3,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 56,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontWeight: '600',
          fontSize: 10,
          letterSpacing: 0.2,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeNavigator}
        options={{
          title: 'Início',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="IngredientesTab"
        component={IngredientesNavigator}
        options={{
          title: 'Ingredientes',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>🥕</Text>
          ),
        }}
      />
      <Tab.Screen
        name="EmbalagensTb"
        component={EmbalagenNavigator}
        options={{
          title: 'Embalagens',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>📦</Text>
          ),
        }}
      />
      <Tab.Screen
        name="ProdutosTab"
        component={ProdutosNavigator}
        options={{
          title: 'Produtos',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>🍳</Text>
          ),
        }}
      />
      <Tab.Screen
        name="ClientesTab"
        component={ClientesNavigator}
        options={{
          title: 'Clientes',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>👥</Text>
          ),
        }}
      />
      <Tab.Screen
        name="FinanceiroTab"
        component={FinanceiroNavigator}
        options={{
          title: 'Financeiro',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>📊</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF8F4' }}>
        <ActivityIndicator color="#D45C2A" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {session ? (
          <AppTabs />
        ) : (
          <AuthStack.Navigator screenOptions={{ headerShown: false }}>
            <AuthStack.Screen name="Login" component={LoginScreen} />
            <AuthStack.Screen name="Signup" component={SignupScreen} />
          </AuthStack.Navigator>
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
