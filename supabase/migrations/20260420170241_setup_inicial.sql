CREATE TABLE insumos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    unidade_medida TEXT NOT NULL,
    preco_custo DECIMAL(10,2) NOT NULL,
    quantidade_embalagem DECIMAL(10,2) NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE produtos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    preco_venda DECIMAL(10,2),
    margem_lucro DECIMAL(5,2),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE composicao_produto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    produto_id UUID REFERENCES produtos(id) ON DELETE CASCADE,
    insumo_id UUID REFERENCES insumos(id),
    quantidade_utilizada DECIMAL(10,2) NOT NULL
);