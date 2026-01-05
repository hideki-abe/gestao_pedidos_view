import { Fase } from "./fase";
import { Fluxo } from  "./fluxo";
export interface Item {
  id: number;
  nome: string;
  tipo: string; 
  descricao: string;
  fluxo: number;
  fluxo_nome: string;
  fluxo_sequencia?: Fase[];
  fluxos_disponiveis?: Fluxo[];
  fluxo_descricao: string;
  fase_atual: number | null; 
  fase_atual_nome: string;
  quantidade: number;
  medida_1: string;
  medida_2: string;
  furo: string;
  finalizado: boolean;
  created_at: string | Date;
  updated_at: string | Date;
  cliente_nome: string;
  pedido_status: string;
  arquivo_url: string;
  arquivo_nome: string;
  arquivo_tipo: string;
  arquivo_tamanho: number;
}

export interface ItemCadastro {
  nome: string
  tipo: string;
  quantidade: number;
  medida_1: string;
  medida_2: string;
  furo: string;
}

