import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ItemService } from '../../services/item';
import { Item } from '../../interfaces/item';
import { Pedido } from '../../interfaces/pedido';
import { FaseService } from '../../services/fase';

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

  constructor(private itemService: ItemService, private faseService: FaseService) {
    console.log("Componente TabelaItens carregado, fase atual: ");
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

  public concluirFase(item: Item): void {
    this.itemService.updateItem(item.id, {}).subscribe({
      next: (itemAtualizado) => {
        const idx = this.itens.findIndex(i => i.id === item.id);
        if (idx > -1) this.itens[idx] = itemAtualizado;
        console.log('Fase do item atualizada com sucesso:', itemAtualizado);
      },
      error: (err) => {
        console.error('Erro ao concluir fase:', err);
        alert('Não foi possível concluir a fase do item.');
      }
    });
  }

  public getProximaFase(item: Item): void {
    console.log("Fase atual: ", item.fase_atual, ": ", item.fase_atual_nome);

    console.log("Obtendo próxima fase para o item:", item.fluxo_descricao);

    const fases_do_fluxo = item.fluxo_descricao.split('>').map(f => f.trim());

    console.log("Fases do fluxo:", fases_do_fluxo);

    const fase_atual_index = fases_do_fluxo.findIndex(fase => fase === item.fase_atual_nome);

    console.log("Índice da fase atual:", fase_atual_index);

    const proxima_fase_nome = fases_do_fluxo[fase_atual_index + 1];

    if(proxima_fase_nome) {
      console.log("Próxima fase identificada:", proxima_fase_nome);
    } else {
      console.log("O item já está na última fase do fluxo.");
      return;
    }

    this.faseService.getFaseByNome(proxima_fase_nome).subscribe({
      next: (fase) => {
        console.log("Fase obtida da API:", fase);

      },
      error: (err) => {
        console.error('Erro ao obter a próxima fase:', err);
      }
    });

  }
  
}
