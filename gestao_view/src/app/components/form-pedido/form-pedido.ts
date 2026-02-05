import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Pedido } from '../../interfaces/pedido';
import { PedidoService } from '../../services/pedido';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';

export type PrioridadePedido = 'baixa' | 'normal' | 'alta' | 'urgente';

@Component({
  selector: 'app-form-pedido',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePickerModule, ButtonModule],
  templateUrl: './form-pedido.html',
  styleUrl: './form-pedido.scss'
})
export class FormPedido implements OnChanges {

  @Input() textoInicial: string = '';
  @Input() prioridadeInicial: PrioridadePedido = 'normal';
  @Input() prazoHoraInicial: string = '';
  @Input() prazoDataInicial: string = '';
  @Input() pedidoId?: number;
  @Input() prazoInicial: Date | string | null = null;  

  @Output() formSubmit = new EventEmitter<{ 
    texto: string; 
    prioridade: PrioridadePedido; 
    prazo: string | Date | null; 
  }>();

  @Output() pedidoDeletado = new EventEmitter<number>();

  texto: string = '';
  prioridade: PrioridadePedido = 'normal';
  prazoData: string = '';
  prazoHora: string = '';
  prazo: Date | null = null;
  dataDefault: Date;

  usuario = {
    nome: '',
    funcao: ''
  };


  constructor(
    private pedidoService: PedidoService, 
    private router: Router, 
    private auth: AuthService) 
  {
    this.dataDefault = new Date();
    this.dataDefault.setHours(12, 0, 0, 0);
  }

  ngOnInit() {
    const user = this.auth.getUser();
    this.usuario.nome = user?.nome || '';
    this.usuario.funcao = user?.funcao || '';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['textoInicial'] && changes['textoInicial'].currentValue !== this.texto) {
      this.texto = this.textoInicial || '';
    }
    if (changes['prioridadeInicial'] && changes['prioridadeInicial'].currentValue !== this.prioridade) {
      this.prioridade = this.prioridadeInicial || 'normal';
    }
    if (changes['prazoInicial'] && changes['prazoInicial'].currentValue !== this.prazo) {
      const valor = changes['prazoInicial'].currentValue;
      this.prazo = valor ? (typeof valor === 'string' ? new Date(valor) : valor) : null;
      console.log('prazoInicial:', valor, 'prazo convertido:', this.prazo);
    }

  }

  onDateChange(event: Date): void {
    this.prazo = new Date(event);
  }

  onDatePickerShow(): void {
    if (!this.prazo) {
      this.prazo = this.dataDefault;
    }
  }

  onPrioridadeMudou(event: PrioridadePedido): void {
    this.pedidoService.updatePrioridade(this.pedidoId!, event).subscribe({
      next: (response) => {
        //alert('Prioridade atualizada com sucesso!');
      },
      error: (error) => {
        alert('Erro ao atualizar prioridade: ' + (error.message || 'Erro desconhecido'));
      }
    });
  }

  onTextoMudou(novoTexto: string): void {
    this.texto = novoTexto;
  }

  salvarForm(): void {
    
    this.formSubmit.emit({ 
      texto: this.texto, 
      prioridade: this.prioridade,
      prazo: this.prazo
    });
  }

  salvarObservacao(): void {
    if (!this.pedidoId) {
      alert('Erro: ID do pedido não encontrado');
      return;
    }
    //console.log("Salvando observação:", this.texto, "para o pedido ID:", this.pedidoId);
    this.pedidoService.updateObservacao(this.pedidoId, this.texto).subscribe({
      next: (response) => {
        //alert('Observação salva com sucesso!');
      },
      error: (error) => {
        alert('Erro ao salvar observação: ' + (error.message || 'Erro desconhecido'));
      }
    });
  }

  onConfirmar(picker: any): void {
    this.salvaData(picker.value);
    picker.overlayVisible = false;
  }

  salvaData(event: Date): void {
    this.prazo = new Date(event);
      console.log('Data selecionada:', event);
    this.pedidoService.updatePrazo(this.pedidoId!, this.prazo ? this.prazo.toISOString() : null).subscribe({
      next: (response) => {
      },
      error: (error) => {
        alert('Erro ao atualizar prazo: ' + (error.message || 'Erro desconhecido'));
      }
    });
  }

  deletarPedido(): void {
    if (!this.pedidoId) {
      alert('Erro: ID do pedido não encontrado');
      return;
    }

    const confirmacao = confirm(
      `Tem certeza que deseja deletar o pedido #${this.pedidoId}?\n\nEsta ação não pode ser desfeita.`
    );

    if (!confirmacao) {
      return;
    }

    this.pedidoService.deletePedido(this.pedidoId).subscribe({
      next: (response) => {
        alert(`Pedido #${this.pedidoId} deletado com sucesso!`);
        this.pedidoDeletado.emit(this.pedidoId);
        this.limparFormulario();
      },
      error: (error) => {
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

  get isAdminOrGerente(): boolean {
    return this.usuario.funcao.toLowerCase() === 'admin' || this.usuario.funcao.toLowerCase() === 'gerente';
  }

  private limparFormulario(): void {
    this.texto = '';
    this.prioridade = 'normal';
    this.prazoData = '';
    this.prazoHora = '';
  }


}
