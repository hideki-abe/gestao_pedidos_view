import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Cliente } from '../../interfaces/cliente';
import { Vendedor } from '../../interfaces/vendedor';
import { ItemCadastro } from '../../interfaces/item';
import { ClienteService } from '../../services/cliente';
import { VendedorService } from '../../services/vendedor';
import { PedidoService } from '../../services/pedido';
import { Pedido } from '../../interfaces/pedido';
import { Fluxo } from '../../interfaces/fluxo';
import { ItemService } from '../../services/item';
import { Tipo } from '../../interfaces/tipo';

export type PrioridadePedido = 'baixa' | 'normal' | 'alta' | 'urgente';

export type Descricao = '1.5mm' | '14' | '12' | '13' | '3/16' | '1/4' |'12.7mm' | '25.4mm' | '38.1mm' | '50.8mm' | 'TB' | 'TREF' | 'BR';

@Component({
  selector: 'app-form-cadastro-pedido',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-cadastro-pedido.html',
  styleUrl: './form-cadastro-pedido.scss'
})
export class FormCadastroPedido implements OnInit {

  @Output() pedidoCriado = new EventEmitter<{
    nome: string;
    cliente: Cliente;
    vendedor: Vendedor;
    numero_do_pedido: string;
    contato: string;
    status: 'encaminhar' | 'producao' | 'finalizado' | 'cancelado' | 'aguardando';
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
  fluxos: Fluxo[] = [];
  tipos: Tipo[] = [];
  
  itens: ItemCadastro[] = [];
  
  itemAtual: ItemCadastro = this.criarItemVazio();

  isDocumentoLocked = false;

  constructor(
    private clienteService: ClienteService,
    private vendedorService: VendedorService,
    private pedidoService: PedidoService,
    private itemService: ItemService
  ) {}

  ngOnInit(): void {
    this.carregarClientes();
    this.carregarVendedores();
    this.carregarTipos();
  }

  private carregarClientes(): void {
    this.clienteService.getClientes().subscribe({
      next: (clientes) => {
        this.clientes = clientes;
      },
      error: (err) => console.error('Erro ao carregar clientes:', err)
    });
    
  }

  private carregarVendedores(): void {
    this.vendedorService.getVendedores().subscribe({
      next: (vendedores) => {
        this.vendedores = vendedores;
      },
      error: (err) => console.error('Erro ao carregar vendedores:', err)
      
    });
  }

  private carregarTipos(): void {
    this.itemService.getTipos().subscribe({
      next: (tipos) => {
        this.tipos = tipos;
      },
      error: (err) => console.error('Erro ao carregar tipos:', err)
    });
  }

  buscarClientePorDocumento(): void {

    const documentoLimpo = String(this.documento || '').replace(/\D/g, '');

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
    } else {
      this.clienteSelecionado = null;
      this.isDocumentoLocked = false;
    }

  }

  private buscarPedidoPorNumero(): Boolean {
    const numero = String(this.numeroPedido || '').replace(/\D/g, '');

    let pedidoEncontrado: Pedido | null = null;

    if (!numero) {
      console.warn('Número do pedido vazio.');
      return false;
    }

    this.pedidoService.getPedidoByNumero(numero).subscribe({
      next: (pedido) => {
        pedidoEncontrado = pedido.length > 0 ? pedido[0] : null;
        if (!pedidoEncontrado) {
          console.warn('Nenhum pedido encontrado com o número:', numero);
          return false;
        }
        return true;
      },
      error: (err) => {
        console.error('Erro ao buscar pedido:', err);
      }
    });
    return false;
  }

  private cadastrarNovoCliente(): void {
    if(this.isDocumentoLocked) {
      return;
    }

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
      tipo: '',
      nome: '',
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
      alert('Por favor, preencha todos os campos obrigatórios e adicione pelo menos um item ao pedido.');
      return;
    }

    if(this.buscarPedidoPorNumero()) {
      alert('Já existe um pedido com esse número. Por favor, utilize outro número.');
      return;
    }

    this.cadastrarNovoCliente();

    setTimeout(() => {
      this.enviarPedido();
    }, 500);

  }

  private enviarPedido(): void {
    if (!this.clienteSelecionado || !this.vendedorSelecionado) {
      alert('Cliente ou vendedor não selecionado. Tente novamente.');
      return;
    }

    const prazoFormatado = this.criarDataPrazo();

    const pedidoData: any = {
      cliente: this.clienteSelecionado.id,
      usuario_responsavel: this.vendedorSelecionado, 
      numero_do_pedido: this.numeroPedido,
      contato: this.contato,
      prioridade: this.prioridade,
      status: 'aguardando',
      observacoes: this.observacoes || '',
      prazo: prazoFormatado ? prazoFormatado.toISOString() : null
    };

    console.log('Enviando pedido:', pedidoData);

    this.pedidoService.createPedido(pedidoData).subscribe({
      next: (pedidoCriado) => {
        console.log('Pedido criado com sucesso:', pedidoCriado);
        
        this.salvarItensDoPedido(pedidoCriado.id);
      },
      error: (err) => {
        console.error('Erro ao criar pedido:', err);
        alert('Erro ao criar pedido. Verifique os dados e tente novamente.');
      }
    });
  }

  private salvarItensDoPedido(pedidoId: number): void {
    const itensParaSalvar = this.itens.map(item => ({
      pedido: Number(pedidoId), 
      tipo: item.tipo,
      nome: item.nome,
      quantidade: item.quantidade,
      medida_1: item.medida_1 || '',
      medida_2: item.medida_2 || '',
      furo: item.furo || ''
    }));

    console.log('Salvando itens:', itensParaSalvar);

    // Salva cada item individualmente ou em lote
    this.salvarItensEmLote(itensParaSalvar, pedidoId);
  }

  // NOVO: Salva todos os itens em lote
  private salvarItensEmLote(itens: any[], pedidoId: number): void {
    let itensSalvos = 0;
    const totalItens = itens.length;

    if (totalItens === 0) {
      this.finalizarCriacaoPedido(pedidoId);
      return;
    }

    itens.forEach(item => {
      this.itemService.createItem(item).subscribe({
        next: (itemCriado) => {
          console.log('Item criado:', itemCriado);
          itensSalvos++;
          
          // Quando todos os itens forem salvos
          if (itensSalvos === totalItens) {
            this.finalizarCriacaoPedido(pedidoId);
          }
        },
        error: (err) => {
          console.error('Erro ao criar item:', err);
          alert(`Erro ao salvar item "${item.nome}". Alguns itens podem não ter sido salvos.`);
          itensSalvos++;
          
          // Continua mesmo com erro
          if (itensSalvos === totalItens) {
            this.finalizarCriacaoPedido(pedidoId);
          }
        }
      });
    });
  }

  private finalizarCriacaoPedido(pedidoId: number): void {
  // Busca o pedido completo com os itens
  this.pedidoService.getPedidoById(pedidoId).subscribe({
    next: (pedidoCompleto) => {
      console.log('Pedido completo:', pedidoCompleto);
      
      this.pedidoCriado.emit({
        nome: this.clienteNome,
        cliente: this.clienteSelecionado!,
        vendedor: this.vendedorSelecionado!,
        numero_do_pedido: this.numeroPedido,
        status: 'aguardando',
        contato: this.contato,
        prioridade: this.prioridade,
        observacoes: this.observacoes,
        prazo: this.criarDataPrazo(),
        itens: this.itens
      });

      alert(`Pedido #${pedidoCompleto.numero_do_pedido} criado com sucesso com ${this.itens.length} itens!`);
      this.limparFormulario();
    },
    error: (err) => {
      console.error('Erro ao buscar pedido completo:', err);
      // Mesmo com erro, mostra sucesso pois o pedido foi criado
      alert(`Pedido #${this.numeroPedido} criado com sucesso!`);
      this.limparFormulario();
    }
  });
}

  private limparFormulario(): void {
    this.clienteNome = '';
    this.clienteSelecionado = null;
    this.vendedorSelecionado = null;
    this.numeroPedido = '';
    this.contato = '';
    this.documento = '';
    this.prioridade = 'normal';
    this.observacoes = '';
    this.prazoData = '';
    this.prazoHora = '';
    this.itens = [];
    this.itemAtual = this.criarItemVazio();
    this.isDocumentoLocked = false;
  }
}