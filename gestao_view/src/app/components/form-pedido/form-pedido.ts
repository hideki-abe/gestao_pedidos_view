import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Pedido } from '../../interfaces/pedido';

export type PrioridadePedido = 'baixa' | 'normal' | 'alta' | 'urgente';

@Component({
  selector: 'app-form-pedido',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-pedido.html',
  styleUrl: './form-pedido.scss'
})
export class FormPedido implements OnChanges {
onPrazoMudou() {
throw new Error('Method not implemented.');
}

  @Input() textoInicial: string = '';
  @Input() prioridadeInicial: PrioridadePedido = 'normal';
  @Input() prazoHora: string = '';
  @Input() prazoData: string = '';

  @Output() formChange = new EventEmitter<{ texto: string; prioridade: PrioridadePedido; }>();
  @Output() formSubmit = new EventEmitter<{ texto: string; prioridade: PrioridadePedido; }>();

  texto: string = '';
  prioridade: PrioridadePedido = 'normal';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['textoInicial'] && changes['textoInicial'].currentValue !== this.texto) {
      this.texto = this.textoInicial || '';
    }
    if (changes['prioridadeInicial'] && changes['prioridadeInicial'].currentValue !== this.prioridade) {
      this.prioridade = this.prioridadeInicial || 'normal';
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

  private emitFormChanges(): void {
    this.formChange.emit({ texto: this.texto, prioridade: this.prioridade });
  }

  salvarForm(): void {
    this.formSubmit.emit({ texto: this.texto, prioridade: this.prioridade });
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
  }
}
