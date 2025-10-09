import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Cliente } from '../../interfaces/cliente';
import { Vendedor } from '../../interfaces/vendedor';
import { ItemCadastro } from '../../interfaces/item';
import { ClienteService } from '../../services/cliente';
import { VendedorService } from '../../services/vendedor';

export type PrioridadePedido = 'baixa' | 'normal' | 'alta' | 'urgente';

@Component({
  selector: 'app-form-cadastro-pedido',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-cadastro-pedido.html',
  styleUrl: './form-cadastro-pedido.scss'
})
export class FormCadastroPedido implements OnInit {

  @Output() pedidoCriado = new EventEmitter<{
    cliente: Cliente;
    vendedor: Vendedor;
    numero_do_pedido: string;
    contato: string;
    prioridade: PrioridadePedido;
    observacoes: string;
    prazo: Date | null;
    itens: ItemCadastro[];
  }>();

  // Dados do pedido
  clienteNome: string = '';
  clienteSelecionado: Cliente | null = null;
  vendedorSelecionado: Vendedor | null = null;
  numeroPedido: string = '';
  contato: string = '';
  documento: string = '';
  prioridade: PrioridadePedido = 'normal';
  observacoes: string = '';
  
  // Prazo
  prazoData: string = '';
  prazoHora: string = '';

  // Listas para os selects
  clientes: Cliente[] = [];
  vendedores: Vendedor[] = [];
  
  // Itens do pedido
  itens: ItemCadastro[] = [];
  
  // Item sendo editado
  itemAtual: ItemCadastro = this.criarItemVazio();

  isDocumentoLocked = false;

  constructor(
    private clienteService: ClienteService,
    private vendedorService: VendedorService
  ) {}

  ngOnInit(): void {
    this.carregarClientes();
    this.carregarVendedores();
  }

  private carregarClientes(): void {
    this.clienteService.getClientes().subscribe({
      next: (clientes) => {this.clientes = clientes
        this.clientes = clientes;
        console.log('Clientes carregados:', this.clientes);
      },
      error: (err) => console.error('Erro ao carregar clientes:', err)
    });
    
  }

  private carregarVendedores(): void {
    this.vendedorService.getVendedores().subscribe({
      next: (vendedores) => {
        this.vendedores = vendedores;
        console.log('Vendedores carregados:', this.vendedores);
      },
      error: (err) => console.error('Erro ao carregar vendedores:', err)
      
    });
  }

  buscarClientePorDocumento(): void {
    const documentoLimpo = this.documento.replace(/\D/g, '');
    console.log('Buscando cliente com documento:', documentoLimpo);

    if (!documentoLimpo) {
      this.clienteSelecionado = null;
      this.isDocumentoLocked = false;
      return;
    }

    const clienteEncontrado = this.clientes.find(
      cliente => (cliente.documento || '').replace(/\D/g, '') === documentoLimpo
    );

    if (clienteEncontrado) {
      this.clienteSelecionado = clienteEncontrado;
      this.clienteNome = clienteEncontrado.nome;
      this.isDocumentoLocked = true;
      console.log('Cliente encontrado:', clienteEncontrado);
    } else {
      this.clienteSelecionado = null;
      this.isDocumentoLocked = false;
    }

  }
  
  onClienteChange(cliente: Cliente | null): void {
    this.clienteSelecionado = cliente;
    if (cliente) {
      this.documento = cliente.documento;
      this.isDocumentoLocked = true; // Bloqueia o campo ao selecionar
    } else {
      this.documento = '';
      this.isDocumentoLocked = false; // Desbloqueia se a seleção for limpa
    }
  }

  private criarItemVazio(): ItemCadastro {
    return {
      nome: '',
      tipo: '',
      descricao: '',
      fluxo_nome: '',
      quantidade: 1,
      medida_1: '',
      medida_2: '',
      furo: ''
    };
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
  }

  private criarDataPrazo(): Date | null {
    if (!this.prazoData || !this.prazoHora) {
      return null;
    }

    const partesData = this.prazoData.split('/');
    if (partesData.length !== 3) return null;

    const dia = parseInt(partesData[0], 10);
    const mes = parseInt(partesData[1], 10) - 1;
    const ano = parseInt(partesData[2], 10);

    const partesHora = this.prazoHora.split(':');
    if (partesHora.length !== 2) return null;

    const hora = parseInt(partesHora[0], 10);
    const minuto = parseInt(partesHora[1], 10);

    if (isNaN(dia) || isNaN(mes) || isNaN(ano) || isNaN(hora) || isNaN(minuto)) {
      return null;
    }

    const dataCompleta = new Date(ano, mes, dia, hora, minuto, 0, 0);
    return isNaN(dataCompleta.getTime()) ? null : dataCompleta;
  }

  // Gerenciamento de itens
  adicionarItem(): void {
    if (this.itemAtual.nome && this.itemAtual.tipo && this.itemAtual.quantidade > 0) {
      this.itens.push({ ...this.itemAtual });
      this.itemAtual = this.criarItemVazio();
    }
  }

  removerItem(index: number): void {
    this.itens.splice(index, 1);
  }

  editarItem(index: number): void {
    this.itemAtual = { ...this.itens[index] };
    this.removerItem(index);
  }

  // Validação e submissão
  formularioValido(): boolean {
    return !!(
      this.clienteSelecionado &&
      this.vendedorSelecionado &&
      this.numeroPedido &&
      this.contato &&
      this.itens.length > 0
    );
  }

  salvarPedido(): void {
    if (!this.formularioValido()) {
      return;
    }

    const prazoFormatado = this.criarDataPrazo();

    this.pedidoCriado.emit({
      cliente: this.clienteSelecionado!,
      vendedor: this.vendedorSelecionado!,
      numero_do_pedido: this.numeroPedido,
      contato: this.contato,
      prioridade: this.prioridade,
      observacoes: this.observacoes,
      prazo: prazoFormatado,
      itens: this.itens
    });
  }
}