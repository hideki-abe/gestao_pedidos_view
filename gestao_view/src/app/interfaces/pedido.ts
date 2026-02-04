import { Cliente } from './cliente';
import { Vendedor } from './vendedor';
import { Operador } from './operador';

export interface Pedido {
  id: number;
  cliente: number; // Mantém o ID original
  clienteObj?: Cliente; // Nova propriedade para o objeto completo do cliente
  cliente_nome?: string;
  vendedor_nome?: string;
  usuario_responsavel: number;
  usuario_responsavelObj?: Vendedor;
  operadorObj?: Operador;
  numero_do_pedido: string;
  contato: string;
  status: 'encaminhar' | 'producao' | 'finalizado' | 'cancelado' | 'aguardando';
  statusDisplay?: string;
  fase: 'inicial' | 'producao' | 'finalizacao';
  prioridade: 'baixa' | 'normal' | 'alta' | 'urgente';
  prioridadeDisplay?: string;
  observacoes: string;
  prazo: Date | null;
  data_inicial: string | Date;
  created_at: string | Date;
  updated_at: string | Date;
  
}