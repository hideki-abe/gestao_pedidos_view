import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necessário para *ngFor, pipes, etc.
import { PedidoService } from '../../services/pedido';
import { Pedido } from '../../interfaces/pedido';

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

  constructor(private pedidoService: PedidoService) {}

  ngOnInit(): void {
    console.log('Componente TabelaProdução inicializado');
    this.carregarPedidos();
  }

  private carregarPedidos(): void {
    this.pedidoService.getPedidos().subscribe({
      next: (data) => {
        this.pedidos = data;
        this.erroAoCarregar = false;
      },
      error: (err) => {
        console.error('Falha ao carregar pedidos da API:', err);
        this.erroAoCarregar = true;
      }
    });
  }
}