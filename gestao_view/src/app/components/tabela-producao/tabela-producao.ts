import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidoService } from '../../services/pedido';
import { Pedido } from '../../interfaces/pedido';
import { ClienteService } from '../../services/cliente';
import { VendedorService } from '../../services/vendedor';
import { TabelaItens } from "../tabela-itens/tabela-itens";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-tabela-producao',
  standalone: true,
  imports: [CommonModule, TabelaItens], 
  templateUrl: './tabela-producao.html',
  styleUrl: './tabela-producao.scss'
})
export class TabelaProducao implements OnInit {

  public pedidos: Pedido[] = [];
  public erroAoCarregar: boolean = false;
  public pedidoSelecionadoId: number | null = null;

  constructor(
    private pedidoService: PedidoService, 
    private clienteService: ClienteService, 
    private vendedorService: VendedorService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    console.log('Componente TabelaProdução inicializado');
    this.carregarPedidos();
  }

  private carregarPedidos(): void {
    this.pedidoService.getPedidosEmProducao().subscribe({
      next: (data) => {
        this.pedidos = data;
        this.erroAoCarregar = false;
         this.relacionaCliente();
         this.relacionaVendedor();
         this.formataStatusEPrioridade();
         //console.log("Carregando clientes: ", this.pedidos);
      },
      error: (err) => {
        console.error('Falha ao carregar pedidos da API:', err);
        this.erroAoCarregar = true;
      }
    });
  }

  private relacionaCliente(): void {
    this.pedidos.forEach(pedido => {
      // Usamos o ID original para buscar o cliente
      this.clienteService.getClienteById(pedido.cliente).subscribe({
        next: (cliente) => {
          // Atribuímos o objeto retornado à nova propriedade
          pedido.clienteObj = cliente;
          //console.log(`Status do pedido: ${pedido.statusDisplay}`);
        },
        error: (err) => {
          console.error(`Falha ao carregar cliente para o pedido ${pedido.id}:`, err);
        }
      });
    });
  }

  private relacionaVendedor(): void {
    this.pedidos.forEach(pedido => {
      // Usamos o ID original para buscar o vendedor
      this.vendedorService.getVendedorById(pedido.usuario_responsavel).subscribe({
        next: (vendedor) => {
          // Atribuímos o objeto retornado à nova propriedade
          pedido.usuario_responsavelObj = vendedor;
          //console.log(`Vendedor ${vendedor.nome} relacionado ao pedido ${pedido.id}`);
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

    public toggleItens(pedidoId: number): void {
    // Se o mesmo pedido for clicado novamente, esconde a tabela de itens.
    if (this.pedidoSelecionadoId === pedidoId) {
      this.pedidoSelecionadoId = null;
    } else {
      // Se for um novo pedido, mostra a tabela de itens para ele.
      this.pedidoSelecionadoId = pedidoId;
    }
  }

  public changeStatus(pedido: Pedido, novoStatus: 'encaminhar'): void {
    // Fecha a linha de detalhes, se estiver aberta
    this.pedidoSelecionadoId = null;

    this.pedidoService.updateStatus(pedido.id, novoStatus).subscribe({
      next: () => {
        const mensagem = novoStatus === 'encaminhar' ? 'Pedido encaminhado com sucesso!' : 'Pedido cancelado.';
        this.toastr.success(mensagem, 'Status Atualizado!');
        
        // Remove o pedido da lista da UI para uma atualização otimista
        this.pedidos = this.pedidos.filter(p => p.id !== pedido.id);
      },
      error: (err) => {
        console.error(`Falha ao mudar status para ${novoStatus}:`, err);
        this.toastr.error('Não foi possível atualizar o status do pedido.', 'Erro!');
      }
    });
  }

}