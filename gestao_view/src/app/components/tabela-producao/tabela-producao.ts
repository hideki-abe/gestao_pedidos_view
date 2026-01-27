import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidoService } from '../../services/pedido';
import { Pedido } from '../../interfaces/pedido';
import { ClienteService } from '../../services/cliente';
import { VendedorService } from '../../services/vendedor';
import { TabelaItens } from "../tabela-itens-producao/tabela-itens";
import { ToastrService } from 'ngx-toastr';
import { Pagination } from '../pagination/pagination';
import { PainelPedidoProducao } from "../painel-pedido-producao/painel-pedido-producao";
import { FiltrosPedido, PedidoFilter } from '../pedido-filter/pedido-filter';
import { Vendedor } from '../../interfaces/vendedor';

@Component({
  selector: 'app-tabela-producao',
  standalone: true,
  imports: [CommonModule, TabelaItens, Pagination, PainelPedidoProducao, PedidoFilter], 
  templateUrl: './tabela-producao.html',
  styleUrl: './tabela-producao.scss'
})
export class TabelaProducao implements OnInit {

  public pedidos: Pedido[] = [];
  public erroAoCarregar: boolean = false;
  public pedidoSelecionadoId: number | null = null;

  public paginaAtual: number = 1;
  public itensPorPagina: number = 20;
  public totalDePedidos: number = 0;

  private filtrosAtuais: FiltrosPedido = {};
  public listaDeVendedores: Vendedor[] = [];

  constructor(
    private pedidoService: PedidoService, 
    private clienteService: ClienteService, 
    private vendedorService: VendedorService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.carregarVendedores();
    this.uploadPedidos();
  }

  onFiltroChange(filtros: FiltrosPedido): void {
    this.filtrosAtuais = filtros;
    this.paginaAtual = 1;
    this.uploadPedidos(); 
  }

  private uploadPedidos(): void {
    this.erroAoCarregar = false;
    this.pedidoService.getPedidosPaginated(
      this.paginaAtual, 
      this.itensPorPagina, 
      ['producao'],
      this.filtrosAtuais
    )
    .subscribe({
      next: (response) => {
        this.pedidos = response.results;
        this.totalDePedidos = response.count;
        this.erroAoCarregar = false;

        //this.relacionaCliente();
        //this.relacionaVendedor();
        this.formataStatusEPrioridade();
      },
      error: (err) => {
        this.erroAoCarregar = true;
      }
    });
  }

  onPageChange(novaPagina: number): void {
    this.paginaAtual = novaPagina;
    this.uploadPedidos(); 
  }

  private relacionaCliente(): void {
    this.pedidos.forEach(pedido => {
      this.clienteService.getClienteById(pedido.cliente).subscribe({
        next: (cliente) => {
          pedido.clienteObj = cliente;
        },
        error: (err) => {
        }
      });
    });
  }

  private carregarVendedores(): void {
    this.vendedorService.getVendedores().subscribe({
      next: (vendedores) => {
        this.listaDeVendedores = vendedores;
      },
      error: (err) => {
        this.listaDeVendedores = [];
      }
    });
  }

  private relacionaVendedor(): void {
    this.pedidos.forEach(pedido => {
      this.vendedorService.getVendedorById(pedido.usuario_responsavel).subscribe({
        next: (vendedor) => {
          pedido.usuario_responsavelObj = vendedor;
        },
        error: (err) => {
        }
      });
    });
  }

  private formataStatusEPrioridade(): void {
    this.pedidos.forEach(pedido => {
      switch (pedido.status) {
        case 'encaminhar':
          pedido.statusDisplay = 'Pronto para Encaminhar';
          break;
        case 'producao':
          pedido.statusDisplay = 'Em Produção';
          break;
        case 'finalizado':
          pedido.statusDisplay = 'Concluído';
          break;
        case 'aguardando':
          pedido.statusDisplay = 'Aguardando Arquivos';
          break;
        case 'cancelado':
          pedido.statusDisplay = 'Cancelado';
          break;
        default:
          pedido.statusDisplay = pedido.status;
          break;
      }

      switch (pedido.prioridade) {
        case 'baixa':
          pedido.prioridadeDisplay = 'Baixa';
          break;
        case 'normal':
          pedido.prioridadeDisplay = 'Normal';
          break;
        case 'alta':
          pedido.prioridadeDisplay = 'Alta';
          break;
        case 'urgente':
          pedido.prioridadeDisplay = 'Urgente';
          break;
        default:
          pedido.prioridadeDisplay = pedido.prioridade;
          break;
      }
    });
  }

    public toggleItens(pedidoId: number): void {
    if (this.pedidoSelecionadoId === pedidoId) {
      this.pedidoSelecionadoId = null;
    } else {
      this.pedidoSelecionadoId = pedidoId;
    }
  }

  public changeStatus(pedido: Pedido, novoStatus: 'encaminhar'): void {

    const mensagem = novoStatus === 'encaminhar'
    ? 'Tem certeza que deseja encaminhar este pedido?'
    : 'Tem certeza que deseja cancelar este pedido?';

    if (!window.confirm(mensagem)) {
      return; 
    }

    this.pedidoSelecionadoId = null;

    this.pedidoService.updateStatus(pedido.id, novoStatus).subscribe({
      next: () => {
        const mensagem = novoStatus === 'encaminhar' ? 'Pedido retornado com sucesso!' : 'Pedido cancelado.';
        this.toastr.success(mensagem, 'Status Atualizado!');
        this.pedidos = this.pedidos.filter(p => p.id !== pedido.id);
      },
      error: (err) => {
        this.toastr.error('Não foi possível atualizar o status do pedido.', 'Erro!');
      }
    });
  }

  public onPedidoStatusAlterado(pedidoAtualizado: Pedido) {
    const idx = this.pedidos.findIndex(p => p.id === pedidoAtualizado.id);
    if (idx > -1) {
      this.pedidos[idx] = { ...this.pedidos[idx], ...pedidoAtualizado };
      this.formataStatusEPrioridade(); 
      alert('Pedido concluído! Mudando status do pedido!');
    }
    this.uploadPedidos();
  }

}