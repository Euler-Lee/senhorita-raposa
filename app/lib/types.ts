export type Insumo = {
  id: string;
  user_id: string;
  nome: string;
  unidade_medida: string;
  preco_custo: number;
  quantidade_embalagem: number;
  criado_em: string;
};

export type Produto = {
  id: string;
  user_id: string;
  nome: string;
  preco_venda: number | null;
  margem_lucro: number | null;
  criado_em: string;
};

export type ComposicaoProduto = {
  id: string;
  produto_id: string;
  insumo_id: string;
  quantidade_utilizada: number;
  insumos?: Insumo;
};

export type ProdutoComCusto = Produto & {
  custo_total: number;
  lucro: number | null;
  margem_calculada: number | null;
};
