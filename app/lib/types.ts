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

export type Embalagem = {
  id: string;
  user_id: string;
  nome: string;
  unidade_medida: string;
  custo: number;
  quantidade_embalagem: number;
  criado_em: string;
};

export type ComposicaoProduto = {
  id: string;
  produto_id: string;
  insumo_id: string | null;
  embalagem_id: string | null;
  quantidade_utilizada: number;
  insumos?: Insumo;
  embalagens?: Embalagem;
};

export type ProdutoComCusto = Produto & {
  custo_total: number;
  lucro: number | null;
  margem_calculada: number | null;
};

export type Cliente = {
  id: string;
  user_id: string;
  nome: string;
  telefone: string | null;
  criado_em: string;
};

export type Pedido = {
  id: string;
  user_id: string;
  cliente_id: string;
  produto_id: string | null;
  descricao: string;
  valor: number;
  data_vencimento: string | null;
  pago: boolean;
  data_pagamento: string | null;
  criado_em: string;
  clientes?: Cliente;
  produtos?: Produto;
};
