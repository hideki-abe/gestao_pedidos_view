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
    if (changes['prazoHoraInicial']) {
      this.prazoHora = this.prazoHoraInicial || '';
    }
    if (changes['prazoDataInicial']) {
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

    const validacao = this.validarPrazo();
    if (!validacao.valido) {
      alert(validacao.mensagem);
      return;
    }

    const prazoFormatado = this.criarDataPrazo();
    
    this.formSubmit.emit({ 
      texto: this.texto, 
      prioridade: this.prioridade,
      prazo: prazoFormatado
    });
  }

  salvarObservacao(): void {
    if (!this.pedidoId) {
      alert('Erro: ID do pedido não encontrado');
      return;
    }
    console.log("Salvando observação:", this.texto, "para o pedido ID:", this.pedidoId);
    this.pedidoService.updateObservacao(this.pedidoId, this.texto).subscribe({
      next: (response) => {
        alert('Observação salva com sucesso!');
      },
      error: (error) => {
        alert('Erro ao salvar observação: ' + (error.message || 'Erro desconhecido'));
      }
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

  private validarDataCalendario(): { valido: boolean; mensagem: string } {
    const partesData = this.prazoData.split('/');
    const dia = parseInt(partesData[0], 10);
    const mes = parseInt(partesData[1], 10);
    const ano = parseInt(partesData[2], 10);

    if (mes < 1 || mes > 12) {
      return { valido: false, mensagem: 'Mês inválido. Use um valor entre 01 e 12.' };
    }

    const diasPorMes = [31, this.isAnoBissexto(ano) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const diasNoMes = diasPorMes[mes - 1];

    if (dia < 1 || dia > diasNoMes) {
      return { valido: false, mensagem: `Dia inválido para ${mes}/${ano}. Use um valor entre 01 e ${diasNoMes}.` };
    }

    if (ano < 2000 || ano > 2100) {
      return { valido: false, mensagem: 'Ano inválido. Use um ano entre 2000 e 2100.' };
    }

    return { valido: true, mensagem: '' };
  }

  
  private isAnoBissexto(ano: number): boolean {
    return (ano % 4 === 0 && ano % 100 !== 0) || (ano % 400 === 0);
  }

  public validarPrazo(): { valido: boolean; mensagem: string } {
    const validacaoFormato = this.validarFormatoDataHora();
    if (!validacaoFormato.valido) {
      return validacaoFormato;
    }

    const validacaoCalendario = this.validarDataCalendario();
    if (!validacaoCalendario.valido) {
      return validacaoCalendario;
    }

    const dataCompleta = this.criarDataPrazo();
    if (!dataCompleta) {
      return { valido: false, mensagem: 'Erro ao processar a data informada.' };
    }

    const validacaoPassado = this.validarDataNaoPassado(dataCompleta);
    if (!validacaoPassado.valido) {
      return validacaoPassado;
    }

    return { valido: true, mensagem: 'Prazo válido!' };
  }

  private validarDataNaoPassado(data: Date): { valido: boolean; mensagem: string } {
    const agora = new Date();
    
    if (data < agora) {
      return { valido: false, mensagem: 'A data do prazo não pode estar no passado.' };
    }

    return { valido: true, mensagem: '' };
  }

    private validarFormatoDataHora(): { valido: boolean; mensagem: string } {
    if (!this.prazoData || this.prazoData.trim() === '') {
      return { valido: false, mensagem: 'Por favor, informe a data do prazo.' };
    }

    const regexData = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regexData.test(this.prazoData)) {
      return { valido: false, mensagem: 'Data inválida. Use o formato dd/mm/yyyy.' };
    }

    if (!this.prazoHora || this.prazoHora.trim() === '') {
      return { valido: false, mensagem: 'Por favor, informe a hora do prazo.' };
    }

    const regexHora = /^\d{2}:\d{2}$/;
    if (!regexHora.test(this.prazoHora)) {
      return { valido: false, mensagem: 'Hora inválida. Use o formato hh:mm.' };
    }

    return { valido: true, mensagem: '' };
  }

}
