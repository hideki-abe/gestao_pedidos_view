import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Pedido } from '../../interfaces/pedido';
import { PedidoService } from '../../services/pedido';
import { Router } from '@angular/router';

export type PrioridadePedido = 'baixa' | 'normal' | 'alta' | 'urgente';

@Component({
  selector: 'app-form-pedido',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-pedido.html',
  styleUrl: './form-pedido.scss'
})
export class FormPedido implements OnChanges {

  @Input() textoInicial: string = '';
  @Input() prioridadeInicial: PrioridadePedido = 'normal';
  @Input() prazoHoraInicial: string = '';
  @Input() prazoDataInicial: string = '';
  @Input() pedidoId?: number;

  @Output() formChange = new EventEmitter<{ 
    texto: string; 
    prioridade: PrioridadePedido; 
    prazo: Date | null; 
  }>();

  @Output() formSubmit = new EventEmitter<{ 
    texto: string; 
    prioridade: PrioridadePedido; 
    prazo: Date | null; 
  }>();

  @Output() pedidoDeletado = new EventEmitter<number>();

  texto: string = '';
  prioridade: PrioridadePedido = 'normal';
  prazoData: string = '';
  prazoHora: string = '';

  constructor(private pedidoService: PedidoService, private router: Router) {
    console.log("Id do pedido para ser excluido: ", this.pedidoId);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['textoInicial'] && changes['textoInicial'].currentValue !== this.texto) {
      this.texto = this.textoInicial || '';
    }
    if (changes['prioridadeInicial'] && changes['prioridadeInicial'].currentValue !== this.prioridade) {
      this.prioridade = this.prioridadeInicial || 'normal';
    }
    if (changes['prazoHoraInicial'] && changes['prazoHoraInicial'].currentValue !== this.prazoHora) {
      this.prazoHora = this.prazoHoraInicial || '';
    }
    if (changes['prazoDataInicial'] && changes['prazoDataInicial'].currentValue !== this.prazoData) {
      this.prazoData = this.prazoDataInicial || '';
    }
  }

  // Chamado quando a prioridade muda no select
  onPrioridadeMudou(): void {
    this.emitFormChanges();
  }

  // Chamado quando o texto muda
  onTextoMudou(novoTexto: string): void {
    this.texto = novoTexto;
    this.emitFormChanges();
  }

  private criarDataPrazo(): Date | null {
    if (!this.prazoData || !this.prazoHora) {
      return null; // Retorna null se data ou hora estiverem vazios
    }

    // Parse da data (formato: dd/mm/aaaa)
    const partesData = this.prazoData.split('/');
    if (partesData.length !== 3) {
      return null; // Data inválida
    }

    const dia = parseInt(partesData[0], 10);
    const mes = parseInt(partesData[1], 10) - 1; // Mês é 0-indexed no JavaScript
    const ano = parseInt(partesData[2], 10);

    // Parse da hora (formato: hh:mm)
    const partesHora = this.prazoHora.split(':');
    if (partesHora.length !== 2) {
      return null; // Hora inválida
    }

    const hora = parseInt(partesHora[0], 10);
    const minuto = parseInt(partesHora[1], 10);

    // Validação básica
    if (isNaN(dia) || isNaN(mes) || isNaN(ano) || isNaN(hora) || isNaN(minuto)) {
      return null;
    }

    if (dia < 1 || dia > 31 || mes < 0 || mes > 11 || hora < 0 || hora > 23 || minuto < 0 || minuto > 59) {
      return null;
    }

    // Criar o objeto Date
    const dataCompleta = new Date(ano, mes, dia, hora, minuto, 0, 0);
    
    // Verifica se a data criada é válida
    if (isNaN(dataCompleta.getTime())) {
      return null;
    }

    console.log("Data completa criada:", dataCompleta);
    return dataCompleta;
  }

  private emitFormChanges(): void {
    const prazoFormatado = this.criarDataPrazo();

    this.formChange.emit({ 
      texto: this.texto, 
      prioridade: this.prioridade,
      prazo: prazoFormatado
      });
  }

  salvarForm(): void {
    const prazoFormatado = this.criarDataPrazo();
    
    this.formSubmit.emit({ 
      texto: this.texto, 
      prioridade: this.prioridade,
      prazo: prazoFormatado
    });
  }

  formatarData(event: any): void {
    const input = event.target;
    let valor = input.value;
    
    // Remove apenas as barras para trabalhar só com números
    let numerosSo = valor.replace(/[^0-9]/g, '');
    
    // Aplica a formatação baseada no comprimento
    let valorFormatado = '';
    
    if (numerosSo.length > 0) {
      valorFormatado = numerosSo.substring(0, 2);
    }
    if (numerosSo.length > 2) {
      valorFormatado += '/' + numerosSo.substring(2, 4);
    }
    if (numerosSo.length > 4) {
      valorFormatado += '/' + numerosSo.substring(4, 8);
    }
    
    // Atualiza o valor do input e a propriedade
    input.value = valorFormatado;
    this.prazoData = valorFormatado;
    console.log(this.prazoData);
  }

  // FUNÇÃO CORRIGIDA: formatarHora que permite backspace
  formatarHora(event: any): void {
    const input = event.target;
    let valor = input.value;
    
    // Remove apenas os dois pontos para trabalhar só com números
    let numerosSo = valor.replace(/[^0-9]/g, '');
    
    // Aplica a formatação baseada no comprimento
    let valorFormatado = '';
    
    if (numerosSo.length > 0) {
      valorFormatado = numerosSo.substring(0, 2);
    }
    if (numerosSo.length > 2) {
      valorFormatado += ':' + numerosSo.substring(2, 4);
    }
    
    // Atualiza o valor do input e a propriedade
    input.value = valorFormatado;
    this.prazoHora = valorFormatado;
    console.log(this.prazoHora);
  }

  onPrazoMudou(): void {
    this.emitFormChanges();
  }

deletarPedido(): void {
    // ✅ Verificar se tem ID do pedido
    if (!this.pedidoId) {
      console.error('❌ ID do pedido não fornecido para deletar');
      alert('Erro: ID do pedido não encontrado');
      return;
    }

    // ✅ Confirmar antes de deletar
    const confirmacao = confirm(
      `Tem certeza que deseja deletar o pedido #${this.pedidoId}?\n\nEsta ação não pode ser desfeita.`
    );

    if (!confirmacao) {
      console.log('🚫 Deleção cancelada pelo usuário');
      return;
    }

    console.log(`🗑️ Iniciando deleção do pedido ID: ${this.pedidoId}`);

    // ✅ Chamar o serviço para deletar
    this.pedidoService.deletePedido(this.pedidoId).subscribe({
      next: (response) => {
        console.log('✅ Pedido deletado com sucesso:', response);
        
        // ✅ Mostrar mensagem de sucesso
        alert(`Pedido #${this.pedidoId} deletado com sucesso!`);
        
        // ✅ Emitir evento informando que foi deletado
        this.pedidoDeletado.emit(this.pedidoId);
        
        // ✅ Limpar o formulário
        this.limparFormulario();
      },
      error: (error) => {
        console.error('❌ Erro ao deletar pedido:', error);
        
        // ✅ Tratar diferentes tipos de erro
        let mensagemErro = 'Erro desconhecido ao deletar pedido';
        
        if (error.status === 404) {
          mensagemErro = 'Pedido não encontrado';
        } else if (error.status === 403) {
          mensagemErro = 'Você não tem permissão para deletar este pedido';
        } else if (error.status === 400) {
          mensagemErro = 'Não é possível deletar este pedido (pode ter itens associados)';
        } else if (error.error?.detail) {
          mensagemErro = error.error.detail;
        } else if (error.message) {
          mensagemErro = error.message;
        }
        
        alert(`Erro ao deletar pedido: ${mensagemErro}`);
      }
    });
  }

  editarPedido(): void {
    this.router.navigate(['/cadastro'], { queryParams: { pedidoId: this.pedidoId } });
  }

  private limparFormulario(): void {
    this.texto = '';
    this.prioridade = 'normal';
    this.prazoData = '';
    this.prazoHora = '';
  }
}
