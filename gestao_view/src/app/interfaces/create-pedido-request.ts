export interface CreatePedidoRequest {
  cliente: number; // ID do cliente
  vendedor: number; // ID do vendedor
  numero_do_pedido: string;
  contato: string;
  prioridade: string;
  observacoes?: string;
  prazo?: string; // ISO string da data
  itens: Array<{
    tipo: string;
    nome: string;
    quantidade: number;
    medida_1?: string;
    medida_2?: string;
    furo?: string;
  }>;
}