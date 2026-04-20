CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  nome TEXT NOT NULL,
  telefone TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id) ON DELETE SET NULL,
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data_vencimento DATE,
  pago BOOLEAN DEFAULT FALSE,
  data_pagamento TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clientes_select" ON clientes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "clientes_insert" ON clientes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "clientes_update" ON clientes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "clientes_delete" ON clientes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "pedidos_select" ON pedidos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "pedidos_insert" ON pedidos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pedidos_update" ON pedidos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "pedidos_delete" ON pedidos FOR DELETE USING (auth.uid() = user_id);
