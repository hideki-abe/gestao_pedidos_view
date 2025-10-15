import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Cliente } from '../../interfaces/cliente';
import { Vendedor } from '../../interfaces/vendedor';
import { ItemCadastro } from '../../interfaces/item';
import { ClienteService } from '../../services/cliente';
import { VendedorService } from '../../services/vendedor';
import { PedidoService } from '../../services/pedido';

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

  clienteNome: string = '';
  clienteSelecionado: Cliente | null = null;
  vendedorSelecionado: Vendedor | null = null;
  numeroPedido: string = '';
  contato: string = '';
  documento: string = '';
  prioridade: PrioridadePedido = 'normal';
  observacoes: string = '';
  
  prazoData: string = '';
  prazoHora: string = '';

  clientes: Cliente[] = [];
  vendedores: Vendedor[] = [];
  
  itens: ItemCadastro[] = [];
  
  itemAtual: ItemCadastro = this.criarItemVazio();

  isDocumentoLocked = false;

  constructor(
    private clienteService: ClienteService,
    private vendedorService: VendedorService,
    private pedidoService: PedidoService
  ) {}

  ngOnInit(): void {
    this.carregarClientes();
    this.carregarVendedores();
  }

  private carregarClientes(): void {
    this.clienteService.getClientes().subscribe({
      next: (clientes) => {
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

    const documentoLimpo = String(this.documento || '').replace(/\D/g, '');
    console.log('Buscando cliente com documento:', documentoLimpo);

    if (!documentoLimpo) {
      this.clienteSelecionado = null;
      this.clienteNome = '';
      this.contato = ''; 
      this.isDocumentoLocked = false;
      return;
    }

    const clienteEncontrado = this.clientes.find(
      cliente => (cliente.documento || '').replace(/\D/g, '').replace(/[^\w\s]/g, '') === documentoLimpo
    );

    if (clienteEncontrado) {
      this.clienteSelecionado = clienteEncontrado;
      this.clienteNome = clienteEncontrado.nome;
      this.contato = clienteEncontrado.contato || '';

      this.isDocumentoLocked = true;
      console.log('Cliente encontrado:', clienteEncontrado);
    } else {
      this.clienteSelecionado = null;
      this.isDocumentoLocked = false;
    }

  }

  cadastrarNovoCliente(): void {
  // Validações
  if (!this.clienteNome.trim()) {
    alert('Por favor, preencha o nome do cliente.');
    return;
  }

  const documentoLimpo = String(this.documento || '').replace(/\D/g, '');
  if (!documentoLimpo) {
    alert('Por favor, preencha o documento do cliente.');
    return;
  }

  // Cria o objeto do novo cliente
  const novoCliente = {
    nome: this.clienteNome.trim(),
    documento: documentoLimpo,
    contato: this.contato.trim() || ''
  };

  console.log(novoCliente);

  this.clienteService.addCliente(novoCliente).subscribe({
    next: (clienteCriado) => {
      console.log('Cliente cadastrado com sucesso:', clienteCriado);
      
      // Adiciona à lista local
      this.clientes.push(clienteCriado);
      
      // Seleciona automaticamente o cliente recém-criado
      this.clienteSelecionado = clienteCriado;
      this.clienteNome = clienteCriado.nome;
      this.contato = clienteCriado.contato || '';
      this.isDocumentoLocked = true;
      
      alert(`Cliente "${clienteCriado.nome}" cadastrado com sucesso!`);
    },
    error: (err) => {
      console.error('Erro ao cadastrar novo cliente:', err);
      alert('Erro ao cadastrar cliente. Verifique os dados e tente novamente.');
    }
  });
}
  
  onClienteChange(cliente: Cliente | null): void {
    this.clienteSelecionado = cliente;
    if (cliente) {
      this.documento = cliente.documento || '';
      this.contato = cliente.contato || ''; 
      this.isDocumentoLocked = true; 
    } else {
      this.documento = '';
      this.contato = '';
      this.isDocumentoLocked = false; 
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

  formularioValido(): boolean {
    return !!(
      this.clienteSelecionado &&
      this.vendedorSelecionado &&
      this.numeroPedido &&
      this.contato &&
      this.itens.length > 0
    );
  }

  imprimePedido(): void {
    console.log('Pedido a ser salvo:', {
      cliente: this.clienteNome,
      vendedor: this.vendedorSelecionado,
      numero_do_pedido: this.numeroPedido,
      contato: this.contato,
      prioridade: this.prioridade,
      observacoes: this.observacoes,
      prazo: this.criarDataPrazo(),
      itens: this.itens
    });
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