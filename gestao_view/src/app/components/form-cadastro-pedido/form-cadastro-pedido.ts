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

  clientes: Cliente[] = [];
  vendedores: Vendedor[] = [];
  fluxos: Fluxo[] = [];
  tipos: Tipo[] = [];
  
  itens: ItemCadastro[] = [];
  
  itemAtual: ItemCadastro = this.criarItemVazio();

  isDocumentoLocked = false;

  readonly DESCRICOES = [
  '#18', 
  '#16', 
  '#14', 
  '#13', 
  '#12', 
  '#1/8', 
  '#3/16', 
  '#1/4',
  '1045 #1/4', 
  '#5/16', 
  '#3/8', 
  '#1/2',
  '1045 #1/2',
  '#5/8',
  '#3/4',
  '1045 #3/4',
  '#7/8',
  '#1'
];

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
      this.clienteNome &&
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

  const vendedorId = typeof this.vendedorSelecionado === 'number' 
    ? this.vendedorSelecionado 
    : this.vendedorSelecionado?.id || null;

  if (!vendedorId) {
    alert('Vendedor não selecionado corretamente. Tente novamente.');
    return;
  }

  const pedidoData: any = {
    cliente: this.clienteSelecionado.id,
    usuario_responsavel: vendedorId,
    numero_do_pedido: this.numeroPedido,
    contato: this.contato,
    prioridade: this.prioridade,
    status: 'aguardando',
    observacoes: this.observacoes || ''
  };

  console.log('Enviando pedido:', pedidoData);

  this.pedidoService.createPedido(pedidoData).subscribe({
    next: (pedidoCriado) => {
      console.log('✅ Pedido criado com sucesso:', pedidoCriado);
      
      if (this.itens.length > 0) {
        this.salvarItensDoPedido(pedidoCriado.id);
      } else {
        this.finalizarCriacaoPedido(pedidoCriado.id);
      }
    },
    error: (err) => {
      console.error('❌ Erro ao criar pedido:', err);
      alert('Erro ao criar pedido. Verifique os dados e tente novamente.');
    }
  });
}

private salvarItensDoPedido(pedidoId: number): void {
  console.log('=== SALVANDO ITENS COM NOVO ENDPOINT ===');
  console.log('Pedido ID:', pedidoId);
  console.log('Itens para salvar:', this.itens);

  const itensParaSalvar = this.itens.map((item, index) => {
    const itemFormatado = {
      tipo: item.tipo,
      nome: item.nome || `Item ${index + 1}`,
      descricao: item.nome || '',
      quantidade: Number(item.quantidade),
      medida_1: String(item.medida_1 || ''),
      medida_2: String(item.medida_2 || ''),
      furo: String(item.furo || '')
    };

    console.log(`Item ${index + 1} formatado:`, itemFormatado);
    return itemFormatado;
  });

  this.salvarItensEmLote(itensParaSalvar, pedidoId);
}

  private salvarItensEmLote(itens: any[], pedidoId: number): void {
    let itensSalvos = 0;
    const totalItens = itens.length;
    let erros: string[] = [];

    if (totalItens === 0) {
      console.log('Nenhum item para salvar');
      this.finalizarCriacaoPedido(pedidoId);
      return;
    }

    console.log(`Salvando ${totalItens} itens usando o endpoint /api/pedidos/${pedidoId}/criar_item/`);

    itens.forEach((item, index) => {
      console.log(`\n=== SALVANDO ITEM ${index + 1}/${totalItens} ===`);
      console.log('Dados do item:', item);

      const itemComPedido = {
        ...item,
        pedido_id: pedidoId
      };

      this.itemService.createItem(itemComPedido).subscribe({
        next: (itemCriado) => {
          console.log(`✅ Item ${index + 1} criado com sucesso:`, itemCriado);
          itensSalvos++;
          
          if (itensSalvos === totalItens) {
            console.log('🎉 Todos os itens foram salvos com sucesso!');
            this.finalizarCriacaoPedido(pedidoId);
          }
        },
        error: (err) => {
          console.error(`❌ Erro ao criar item ${index + 1}:`, err);
          console.error('Dados que causaram erro:', item);
          
          erros.push(`Item ${index + 1}: ${err.message}`);
          itensSalvos++;
          
          if (itensSalvos === totalItens) {
            if (erros.length > 0) {
              console.warn('Alguns itens falharam:', erros);
              alert(`Pedido criado! ${totalItens - erros.length} itens salvos, ${erros.length} falharam.`);
            }
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
    this.itens = [];
    this.itemAtual = this.criarItemVazio();
    this.isDocumentoLocked = false;
  }
}