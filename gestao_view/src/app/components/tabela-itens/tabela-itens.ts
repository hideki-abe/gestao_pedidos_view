import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ItemService } from '../../services/item';
import { Item } from '../../interfaces/item';
import { Pedido } from '../../interfaces/pedido';

@Component({
  selector: 'app-tabela-itens',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabela-itens.html',
  styleUrl: './tabela-itens.scss'
})
export class TabelaItens implements OnChanges{

  @Input() public pedido!: Pedido;

  public itens: Item[] = [];
  public erroAoCarregar: boolean = false;

  constructor(private itemService: ItemService) {
    console.log("Componente TabelaItens carregado");
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['pedido'] && changes['pedido'].currentValue) {
      this.carregarItensDoPedido(this.pedido.id); 
      console.log("Pedido recebido no TabelaItens: ", this.pedido);
    }
  }

  private carregarItensDoPedido(id: number): void {
    this.itemService.getItensDoPedido(id).subscribe({
      next: (data) => {
        this.itens = data;
        this.erroAoCarregar = false;
        console.log(this.itens[0]);
      },
      error: (err) => {
        console.error('Falha ao carregar itens da API:', err);
        this.erroAoCarregar = true;
      }
    });
  }

}
