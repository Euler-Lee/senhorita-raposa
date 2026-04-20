import { supabase } from './supabase';
import type { ComposicaoProduto, ProdutoComCusto } from './types';

/**
 * Calcula o custo unitário de um insumo com base no preço da embalagem.
 * custo_unitario = preco_custo / quantidade_embalagem
 */
function calcularCustoUnitario(precoCusto: number, quantidadeEmbalagem: number): number {
  if (quantidadeEmbalagem === 0) return 0;
  return precoCusto / quantidadeEmbalagem;
}

/**
 * Calcula o custo total de um produto somando o custo de cada insumo
 * proporcional à quantidade utilizada na receita.
 */
function calcularCustoProduto(composicao: ComposicaoProduto[]): number {
  return composicao.reduce((total, item) => {
    if (!item.insumos) return total;
    const custoUnitario = calcularCustoUnitario(
      item.insumos.preco_custo,
      item.insumos.quantidade_embalagem
    );
    return total + custoUnitario * item.quantidade_utilizada;
  }, 0);
}

/**
 * Busca um produto pelo ID junto com sua composição e calcula
 * custo total, lucro e margem real com base no preço de venda.
 */
export async function calcularCustoPorProdutoId(produtoId: string): Promise<ProdutoComCusto | null> {
  const { data: produto, error: errProduto } = await supabase
    .from('produtos')
    .select('*')
    .eq('id', produtoId)
    .single();

  if (errProduto || !produto) return null;

  const { data: composicao, error: errComposicao } = await supabase
    .from('composicao_produto')
    .select('*, insumos(*)')
    .eq('produto_id', produtoId);

  if (errComposicao || !composicao) return null;

  const custo_total = calcularCustoProduto(composicao as ComposicaoProduto[]);

  const preco_venda = produto.preco_venda ?? null;
  const lucro = preco_venda !== null ? preco_venda - custo_total : null;
  const margem_calculada =
    preco_venda !== null && preco_venda > 0
      ? ((preco_venda - custo_total) / preco_venda) * 100
      : null;

  return {
    ...produto,
    custo_total,
    lucro,
    margem_calculada,
  };
}

/**
 * Busca todos os produtos e calcula o custo de cada um.
 */
export async function listarProdutosComCusto(): Promise<ProdutoComCusto[]> {
  const { data: produtos, error } = await supabase.from('produtos').select('id');

  if (error || !produtos) return [];

  const resultados = await Promise.all(
    produtos.map((p) => calcularCustoPorProdutoId(p.id))
  );

  return resultados.filter((r): r is ProdutoComCusto => r !== null);
}

/**
 * Calcula o preço de venda sugerido para uma margem de lucro desejada.
 * preco_sugerido = custo_total / (1 - margem_desejada / 100)
 */
export function calcularPrecoSugerido(custoTotal: number, margemDesejada: number): number {
  if (margemDesejada >= 100 || margemDesejada < 0) return 0;
  return custoTotal / (1 - margemDesejada / 100);
}
