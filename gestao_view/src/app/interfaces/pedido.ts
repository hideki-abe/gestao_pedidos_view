import { Cliente } from './cliente';
import { Vendedor } from './vendedor';

export interface Pedido {
  id: number;
  cliente: number; // Mantém o ID original
  clienteObj?: Cliente; // Nova propriedade para o objeto completo do cliente
  usuario_responsavel: number;
  usuario_responsavelObj?: Vendedor;
  numero_do_pedido: string;
  status: 'encaminhar' | 'producao' | 'finalizado' | 'cancelado' | 'aguardando';
  statusDisplay?: string;
  fase: 'inicial' | 'producao' | 'finalizacao';
  prioridade: 'baixa' | 'normal' | 'alta' | 'urgente';
  prioridadeDisplay?: string;
  observacoes: string;
  prazo: string | Date;
  data_inicial: string | Date;
  created_at: string | Date;
  updated_at: string | Date;
}