export interface CreateItemRequest {
  pedido_id?: number;  
  pedido?: number;      // ✅ ID do pedido
  tipo: string;
  nome: string;
  quantidade: number;
  medida_1?: string;
  medida_2?: string;
  furo?: string;
}