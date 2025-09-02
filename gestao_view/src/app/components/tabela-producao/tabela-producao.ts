import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necessário para *ngFor, pipes, etc.
import { PedidoService } from '../../services/pedido';
import { Pedido } from '../../interfaces/pedido';
import { ClienteService } from '../../services/cliente';
import { VendedorService } from '../../services/vendedor';
@Component({
  selector: 'app-tabela-producao',
  standalone: true,
  imports: [CommonModule], // Adicionado CommonModule
  templateUrl: './tabela-producao.html',
  styleUrl: './tabela-producao.scss'
})
export class TabelaProducao implements OnInit {

  public pedidos: Pedido[] = [];
  public erroAoCarregar: boolean = false;

  constructor(
    private pedidoService: PedidoService, 
    private clienteService: ClienteService, 
    private vendedorService: VendedorService
  ) {}

  ngOnInit(): void {
    console.log('Componente TabelaProdução inicializado');
    this.carregarPedidos();
  }

  private carregarPedidos(): void {
    this.pedidoService.getPedidos().subscribe({
      next: (data) => {
        this.pedidos = data;
        this.erroAoCarregar = false;
         this.relacionaCliente();
         this.relacionaVendedor();
         this.formataStatusEPrioridade();
         console.log("Carregando clientes: ", this.pedidos);
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
          console.log(`Status do pedido: ${pedido.statusDisplay}`);
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
          console.log(`Vendedor ${vendedor.nome} relacionado ao pedido ${pedido.id}`);
        },
        error: (err) => {
          console.error(`Falha ao carregar vendedor para o pedido ${pedido.id}:`, err);
        }
      });
    });
  }

  private formataStatusEPrioridade(): void {
    this.pedidos.forEach(pedido => {
      // Usamos um switch para mais clareza e facilidade de expansão
      switch (pedido.status) {
        case 'encaminhar':
          pedido.statusDisplay = 'Pronto para Envio';
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
          // Caso padrão, apenas exibe o status original capitalizado
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

}