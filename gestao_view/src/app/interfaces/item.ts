export interface Item {
  id: number;
  nome: string;
  tipo: string; 
  descricao: string;
  fase_atual: string; 
  fase_atual_nome: string;
  quantidade: number;
  medida_1: string;
  medida_2: string;
  furo: string;
  finalizado: boolean;
  created_at: string | Date;
  updated_at: string | Date;
}