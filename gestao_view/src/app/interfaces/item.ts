import { Fase } from "./fase";
import { Fluxo } from  "./fluxo";
export interface Item {
  id: number;
  nome: string;
  tipo: string; 
  descricao: string;
  fluxo_nome: string;
  fluxo_sequencia?: Fase[];
  fluxos_disponiveis?: Fluxo[];
  fase_atual: number | null; 
  fase_atual_nome: string;
  quantidade: number;
  medida_1: string;
  medida_2: string;
  furo: string;
  finalizado: boolean;
  created_at: string | Date;
  updated_at: string | Date;
}