CREATE TABLE embalagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  nome TEXT NOT NULL,
  unidade_medida TEXT NOT NULL,
  custo DECIMAL(10,2) NOT NULL,
  quantidade_embalagem DECIMAL(10,2) NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE embalagens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "embalagens_select" ON embalagens FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "embalagens_insert" ON embalagens FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "embalagens_update" ON embalagens FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "embalagens_delete" ON embalagens FOR DELETE USING (auth.uid() = user_id);

-- Permite embalagens na composicao de produtos
ALTER TABLE composicao_produto ADD COLUMN embalagem_id UUID REFERENCES embalagens(id);
ALTER TABLE composicao_produto ALTER COLUMN insumo_id DROP NOT NULL;
