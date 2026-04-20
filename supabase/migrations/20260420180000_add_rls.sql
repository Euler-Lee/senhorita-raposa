-- Adiciona coluna user_id em todas as tabelas para isolar dados por usuário
ALTER TABLE insumos ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
ALTER TABLE produtos ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
ALTER TABLE composicao_produto ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();

-- Habilita Row Level Security
ALTER TABLE insumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE composicao_produto ENABLE ROW LEVEL SECURITY;

-- Políticas para insumos
CREATE POLICY "insumos_select" ON insumos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insumos_insert" ON insumos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "insumos_update" ON insumos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "insumos_delete" ON insumos FOR DELETE USING (auth.uid() = user_id);

-- Políticas para produtos
CREATE POLICY "produtos_select" ON produtos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "produtos_insert" ON produtos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "produtos_update" ON produtos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "produtos_delete" ON produtos FOR DELETE USING (auth.uid() = user_id);

-- Políticas para composicao_produto
CREATE POLICY "composicao_select" ON composicao_produto FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "composicao_insert" ON composicao_produto FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "composicao_update" ON composicao_produto FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "composicao_delete" ON composicao_produto FOR DELETE USING (auth.uid() = user_id);
