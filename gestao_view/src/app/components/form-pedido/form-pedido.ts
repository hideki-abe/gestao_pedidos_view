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
  @Input() textoInicial: string = '';
  @Input() prioridadeInicial: PrioridadePedido = 'normal';

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
}
