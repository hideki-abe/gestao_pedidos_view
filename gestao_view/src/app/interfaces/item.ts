import { Fase } from "./fase";
import { Fluxo } from  "./fluxo";
import { Operador } from "./operador";
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
  operador: Operador;
  operador_nome: string;
  operador_id: number | null;
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

