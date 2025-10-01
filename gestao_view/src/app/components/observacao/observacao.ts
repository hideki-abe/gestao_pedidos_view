import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-observacao',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './observacao.html',
  styleUrl: './observacao.scss'
})
export class Observacao implements OnChanges {
  @Input() textoInicial: string = '';
  
  // Este evento será emitido a cada caractere digitado
  @Output() textoChange = new EventEmitter<string>();

  // O evento 'salvar' ainda pode ser útil para uma ação explícita de salvar
  @Output() salvar = new EventEmitter<void>();

  texto: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['textoInicial'] && changes['textoInicial'].currentValue !== this.texto) {
      this.texto = this.textoInicial || '';
    }
  }

  // Este método será chamado a cada mudança no textarea
  onTextoMudou(novoTexto: string): void {
    this.texto = novoTexto;
    this.textoChange.emit(this.texto);
  }

  // Este método é para o botão, se você ainda quiser usá-lo
  salvarObservacao(): void {
    this.salvar.emit();
  }
}