export interface CreateItemRequest {
  pedido_id?: number; 
  tipo: string;
  nome: string;
  descricao?: string;
  quantidade: number;
  medida_1?: string;
  medida_2?: string;
  furo?: string;
}