import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { PedidoService } from '../../services/pedido';
import { Pedido } from '../../interfaces/pedido';
import { ClienteService } from '../../services/cliente';
import { VendedorService } from '../../services/vendedor';
import { TabelaItensEncaminhamento } from "../tabela-itens-encaminhamento/tabela-itens-encaminhamento";
import { PedidoFileUpload } from '../pedido-file-upload/pedido-file-upload';
import { FormPedido } from "../form-pedido/form-pedido";
import { PrioridadePedido } from '../form-pedido/form-pedido';
import { switchMap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Pagination } from '../pagination/pagination';
import { FiltrosPedido, PedidoFilter } from '../pedido-filter/pedido-filter';
import { Vendedor } from '../../interfaces/vendedor';


@Component({
  selector: 'app-tabela-encaminhamento',
  standalone: true,
  imports: [
    CommonModule, 
    TabelaItensEncaminhamento, 
    PedidoFileUpload, 
    FormPedido, 
    Pagination, 
    PedidoFilter
  ], 
  templateUrl: './tabela-encaminhamento.html',
  styleUrl: './tabela-encaminhamento.scss'
})
export class TabelaEncaminhamento implements OnInit {

  public pedidos: Pedido[] = [];
  public erroAoCarregar: boolean = false;
  public pedidoSelecionadoId: number | null = null;
  isShown = signal(false);
  enterClass = signal('enter-animation');

  public paginaAtual: number = 1;
  public itensPorPagina: number = 20;
  public totalDePedidos: number = 0;

  public listaDeVendedores: Vendedor[] = [];
  private filtrosAtuais: FiltrosPedido = {};

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
  
  private carregarVendedores(): void {
    this.vendedorService.getVendedores().subscribe({
      next: (vendedores) => {
        this.listaDeVendedores = vendedores;
        console.log('Vendedores carregados:', this.listaDeVendedores);
      },
      error: (err) => {
        console.error('Falha ao carregar a lista de vendedores:', err);
        this.listaDeVendedores = [];
      }
    });
  }

  private uploadPedidos(): void {
    this.erroAoCarregar = false;
    this.pedidoService.getPedidosPaginated(
      this.paginaAtual, 
      this.itensPorPagina, 
      ['encaminhar', 'aguardando'],
      this.filtrosAtuais
    )
    .subscribe({
      next: (response) => {
        this.pedidos = response.results;
        this.totalDePedidos = response.count;
        this.erroAoCarregar = false;

        this.relacionaCliente();
        this.relacionaVendedor();
        this.formataStatusEPrioridade();
      },
      error: (err) => {
        console.error('Falha ao carregar pedidos da API:', err);
        this.erroAoCarregar = true;
      }
    });
  }

  onPageChange(novaPagina: number): void {
    this.paginaAtual = novaPagina;
    this.uploadPedidos(); 
  }

  onFiltroChange(filtros: FiltrosPedido): void {
    this.filtrosAtuais = filtros;
    this.paginaAtual = 1;
    console.log("Filtros atualizados:", this.filtrosAtuais);
    this.uploadPedidos(); 
  }

  private relacionaCliente(): void {
    this.pedidos.forEach(pedido => {
      this.clienteService.getClienteById(pedido.cliente).subscribe({
        next: (cliente) => {
          pedido.clienteObj = cliente;
        },
        error: (err) => {
          console.error(`Falha ao carregar cliente para o pedido ${pedido.id}:`, err);
        }
      });
    });
  }

  private relacionaVendedor(): void {
    this.pedidos.forEach(pedido => {
      this.vendedorService.getVendedorById(pedido.usuario_responsavel).subscribe({
        next: (vendedor) => {
          pedido.usuario_responsavelObj = vendedor;
        },
        error: (err) => {
          console.error(`Falha ao carregar vendedor para o pedido ${pedido.id}:`, err);
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

  onFormChange(dados: { texto: string; prioridade: PrioridadePedido; prazo: Date | null }, pedido: Pedido): void {
    pedido.observacoes = dados.texto;
    pedido.prioridade = dados.prioridade;
    console.log('Dados do formulário atualizados:', pedido);

    if (dados.prazo) {

    pedido.prazo = dados.prazo.toISOString(); 

    } else {
      pedido.prazo = null;
    }

  }

  salvarForm(pedido: Pedido): void {
    const dadosParaSalvar = {
      observacoes: pedido.observacoes,
      prioridade: pedido.prioridade,
      prazo: pedido.prazo,
    };

    console.log(`Iniciando processo de salvamento para o pedido ${pedido.id}:`, dadosParaSalvar);

    this.pedidoService.updatePedido(pedido.id, dadosParaSalvar).pipe(
      switchMap((pedidoAtualizadoComDados) => {
        console.log('Dados do pedido atualizados, agora atualizando o status...');
        return this.pedidoService.updateStatus(pedido.id, 'producao');
      })
    ).subscribe({
      next: (pedidoAtualizadoComStatus) => {
        console.log('Processo concluído! Pedido final:', pedidoAtualizadoComStatus);
        this.toastr.success(`Pedido ${pedido.numero_do_pedido} enviado para produção!`, 'Sucesso!');
        this.pedidoSelecionadoId = null;
        this.pedidos = this.pedidos.filter(p => p.id !== pedido.id);
        this.totalDePedidos--; 
      },
      error: (err) => {
        console.error('Ocorreu um erro durante o processo de salvamento:', err);
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

  public toggle() {
    this.isShown.update((isShown) => !isShown);
    console.log("estou funcionando")
  }

onPedidoDeletado(pedidoId: number): void {
  console.log(`Pedido ${pedidoId} foi deletado`);
  
  this.toastr.success(`Pedido #${pedidoId} deletado com sucesso!`, 'Pedido Deletado');
  
  if (this.pedidoSelecionadoId === pedidoId) {
    this.pedidoSelecionadoId = null;
  }
  this.uploadPedidos();
}

}