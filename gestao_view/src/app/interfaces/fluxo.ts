import { Fase } from "./fase";

export interface Fluxo {
  id: number;
  nome: string;
  descricao: string;
  fases: Fase[];
  total_fases: number;
}