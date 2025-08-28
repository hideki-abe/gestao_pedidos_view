export interface Pedido {
  id: number;
  cliente: number;
  usuario_responsavel: number;
  numero_do_pedido: string;
  status: 'pendente' | 'em_producao' | 'concluido' | 'cancelado';
  fase: 'inicial' | 'producao' | 'finalizacao';
  prioridade: 'baixa' | 'normal' | 'alta';
  observacoes: string;
  prazo: string | Date;
  data_inicial: string | Date;
  created_at: string | Date;
  updated_at: string | Date;
}