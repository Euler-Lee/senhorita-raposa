import 'react-native-url-polyfill/auto';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';

// Auth
import LoginScreen from './screens/auth/LoginScreen';
import SignupScreen from './screens/auth/SignupScreen';

// Home
import HomeScreen from './screens/HomeScreen';

// Insumos
import InsumosListScreen from './screens/insumos/InsumosListScreen';
import InsumoFormScreen from './screens/insumos/InsumoFormScreen';

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
const InsumosStack = createNativeStackNavigator();
const ProdutosStack = createNativeStackNavigator();
const ClientesStack = createNativeStackNavigator();
const FinanceiroStack = createNativeStackNavigator();

const HEADER = {
  headerStyle: { backgroundColor: '#FFF8F4' },
  headerTintColor: '#D45C2A',
  headerTitleStyle: { fontWeight: '700' as const },
};

const HEADER_VERDE = {
  headerStyle: { backgroundColor: '#F4FBF9' },
  headerTintColor: '#1A6B5A',
  headerTitleStyle: { fontWeight: '700' as const },
};

const HEADER_AZUL = {
  headerStyle: { backgroundColor: '#EFF5FA' },
  headerTintColor: '#1A5A7A',
  headerTitleStyle: { fontWeight: '700' as const },
};

function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
    </HomeStack.Navigator>
  );
}

function InsumosNavigator() {
  return (
    <InsumosStack.Navigator screenOptions={HEADER}>
      <InsumosStack.Screen name="InsumosList" component={InsumosListScreen} options={{ title: 'Insumos' }} />
      <InsumosStack.Screen name="InsumoForm" component={InsumoFormScreen} options={{ title: 'Novo Insumo' }} />
    </InsumosStack.Navigator>
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
        tabBarActiveTintColor: '#D45C2A',
        tabBarInactiveTintColor: '#8A6A5A',
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#EDD9C8' },
        tabBarLabelStyle: { fontWeight: '600', fontSize: 11 },
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeNavigator} options={{ title: 'Início' }} />
      <Tab.Screen name="InsumosTab" component={InsumosNavigator} options={{ title: 'Insumos' }} />
      <Tab.Screen name="ProdutosTab" component={ProdutosNavigator} options={{ title: 'Produtos' }} />
      <Tab.Screen name="ClientesTab" component={ClientesNavigator} options={{ title: 'Clientes' }} />
      <Tab.Screen name="FinanceiroTab" component={FinanceiroNavigator} options={{ title: 'Financeiro' }} />
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
