export interface Item {
  id: number;
  nome: string;
  tipo: string; // Ex: 'vidro', 'perfil', 'acessorio'
  descricao: string;
  fase: string; // Ex: 'inicial', 'corte', 'montagem'
  quantidade: number;
  medida_1: string;
  medida_2: string;
  furo: string;
  finalizado: boolean;
  created_at: string | Date;
  updated_at: string | Date;
}