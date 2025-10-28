import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ItemService } from '../../services/item';
import { Item } from '../../interfaces/item';
import { Pedido } from '../../interfaces/pedido';
import { FaseService } from '../../services/fase';
import { FluxoService } from '../../services/fluxo';
import { Fase } from '../../interfaces/fase';

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

  constructor(
    private itemService: ItemService, 
    private faseService: FaseService,
    private fluxoService: FluxoService
  ) {
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
    const fases_do_fluxo = item.fluxo_descricao.split('>').map(f => f.trim());
    const fase_atual_index = fases_do_fluxo.findIndex(
      fase => fase.toLowerCase() === (item.fase_atual_nome || '').trim().toLowerCase()
    );
    const proxima_fase_nome = fases_do_fluxo[fase_atual_index + 1];

    if (!proxima_fase_nome) {
      return; 
    }

    this.faseService.getFaseByFluxo(item.fluxo).subscribe({
      next: (fases) => {
        const proximaFase = fases.find(
          f => f.nome.toLowerCase() === proxima_fase_nome.toLowerCase()
        );
        if (!proximaFase) return;
        this.itemService.updateItem(item.id, { fase_atual: proximaFase.id }).subscribe({
          next: (itemAtualizado) => {
            const idx = this.itens.findIndex(i => i.id === item.id);
            if (idx > -1) this.itens[idx] = itemAtualizado;
          },
          error: () => {
            alert('Não foi possível concluir a fase do item.');
          }
        });
      },
      error: () => {}
    });
  }
}
