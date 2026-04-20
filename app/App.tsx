import 'react-native-url-polyfill/auto';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import LoginScreen from './screens/auth/LoginScreen';
import SignupScreen from './screens/auth/SignupScreen';
import InsumosListScreen from './screens/insumos/InsumosListScreen';
import InsumoFormScreen from './screens/insumos/InsumoFormScreen';
import ProdutosListScreen from './screens/produtos/ProdutosListScreen';
import ProdutoFormScreen from './screens/produtos/ProdutoFormScreen';
import PrecificacaoScreen from './screens/PrecificacaoScreen';

const AuthStack = createNativeStackNavigator();
const InsumosStack = createNativeStackNavigator();
const ProdutosStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const HEADER = {
  headerStyle: { backgroundColor: '#FFF8F4' },
  headerTintColor: '#D45C2A',
  headerTitleStyle: { fontWeight: '700' as const },
};

function LogoutButton() {
  return (
    <TouchableOpacity onPress={() => supabase.auth.signOut()} style={{ marginRight: 8 }}>
      <Text style={{ color: '#D45C2A', fontSize: 14, fontWeight: '600' }}>Sair</Text>
    </TouchableOpacity>
  );
}

function InsumosNavigator() {
  return (
    <InsumosStack.Navigator screenOptions={HEADER}>
      <InsumosStack.Screen
        name="InsumosList"
        component={InsumosListScreen}
        options={{ title: 'Insumos', headerRight: () => <LogoutButton /> }}
      />
      <InsumosStack.Screen name="InsumoForm" component={InsumoFormScreen} options={{ title: 'Novo Insumo' }} />
    </InsumosStack.Navigator>
  );
}

function ProdutosNavigator() {
  return (
    <ProdutosStack.Navigator screenOptions={HEADER}>
      <ProdutosStack.Screen
        name="ProdutosList"
        component={ProdutosListScreen}
        options={{ title: 'Produtos', headerRight: () => <LogoutButton /> }}
      />
      <ProdutosStack.Screen name="ProdutoForm" component={ProdutoFormScreen} options={{ title: 'Novo Produto' }} />
      <ProdutosStack.Screen name="Precificacao" component={PrecificacaoScreen} options={{ title: 'Precificacao' }} />
    </ProdutosStack.Navigator>
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
        tabBarLabelStyle: { fontWeight: '600', fontSize: 12 },
      }}
    >
      <Tab.Screen name="InsumosTab" component={InsumosNavigator} options={{ title: 'Insumos' }} />
      <Tab.Screen name="ProdutosTab" component={ProdutosNavigator} options={{ title: 'Produtos' }} />
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
