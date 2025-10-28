import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Pedido } from '../../interfaces/pedido';
import { PedidoService } from '../../services/pedido';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';

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

  usuario = {
    nome: '',
    funcao: ''
  };

  constructor(
    private pedidoService: PedidoService, 
    private router: Router, 
    private auth: AuthService) 
  {
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
    if (changes['prazoHoraInicial'] && changes['prazoHoraInicial'].currentValue !== this.prazoHora) {
      this.prazoHora = this.prazoHoraInicial || '';
    }
    if (changes['prazoDataInicial'] && changes['prazoDataInicial'].currentValue !== this.prazoData) {
      this.prazoData = this.prazoDataInicial || '';
    }
  }

  onPrioridadeMudou(): void {
    this.emitFormChanges();
  }

  onTextoMudou(novoTexto: string): void {
    this.texto = novoTexto;
    this.emitFormChanges();
  }

  private criarDataPrazo(): Date | null {
    if (!this.prazoData || !this.prazoHora) {
      return null;
    }

    const partesData = this.prazoData.split('/');
    if (partesData.length !== 3) {
      return null; 
    }

    const dia = parseInt(partesData[0], 10);
    const mes = parseInt(partesData[1], 10) - 1;
    const ano = parseInt(partesData[2], 10);

    const partesHora = this.prazoHora.split(':');
    if (partesHora.length !== 2) {
      return null;
    }

    const hora = parseInt(partesHora[0], 10);
    const minuto = parseInt(partesHora[1], 10);

    if (isNaN(dia) || isNaN(mes) || isNaN(ano) || isNaN(hora) || isNaN(minuto)) {
      return null;
    }

    if (dia < 1 || dia > 31 || mes < 0 || mes > 11 || hora < 0 || hora > 23 || minuto < 0 || minuto > 59) {
      return null;
    }

    const dataCompleta = new Date(ano, mes, dia, hora, minuto, 0, 0);
    
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
    
    let numerosSo = valor.replace(/[^0-9]/g, '');
    
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
    
    input.value = valorFormatado;
    this.prazoData = valorFormatado;
    console.log(this.prazoData);
  }

  formatarHora(event: any): void {
    const input = event.target;
    let valor = input.value;
    let numerosSo = valor.replace(/[^0-9]/g, '');
    let valorFormatado = '';
    
    if (numerosSo.length > 0) {
      valorFormatado = numerosSo.substring(0, 2);
    }
    if (numerosSo.length > 2) {
      valorFormatado += ':' + numerosSo.substring(2, 4);
    }
    
    input.value = valorFormatado;
    this.prazoHora = valorFormatado;
    console.log(this.prazoHora);
  }

  onPrazoMudou(): void {
    this.emitFormChanges();
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
