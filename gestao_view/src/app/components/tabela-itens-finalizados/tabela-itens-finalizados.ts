import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ItemService } from '../../services/item';
import { Item } from '../../interfaces/item';
import { Pedido } from '../../interfaces/pedido';
import { FaseService } from '../../services/fase';
import { FluxoService } from '../../services/fluxo';
import { Fase } from '../../interfaces/fase';
import { PedidoService } from '../../services/pedido';
import { ArquivoService } from '../../services/arquivo';

@Component({
  selector: 'app-tabela-itens-finalizados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabela-itens-finalizados.html',
  styleUrl: './tabela-itens-finalizados.scss'
})
export class TabelaItensFinalizados implements OnChanges{

  @Input() public pedido!: Pedido;
  @Output() pedidoAtualizado = new EventEmitter<Pedido>();


  public itens: Item[] = [];
  public erroAoCarregar: boolean = false;

  constructor(
    private itemService: ItemService, 
    private faseService: FaseService,
    private pedidoService: PedidoService,
    private arquivoService: ArquivoService
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['pedido'] && changes['pedido'].currentValue) {
      this.carregarItensDoPedido(this.pedido.id); 
      console.log(this.pedido);
    }
  }

  private carregarItensDoPedido(id: number): void {
    this.itemService.getItensDoPedido(id).subscribe({
      next: (data) => {
        this.itens = data;
        this.erroAoCarregar = false;
      },
      error: (err) => {
        this.erroAoCarregar = true;
      }
    });
  }

  public concluirFase(item: Item): void {
    this.itemService.updateItem(item.id, {}).subscribe({
      next: (itemAtualizado) => {
        const idx = this.itens.findIndex(i => i.id === item.id);
        if (idx > -1) this.itens[idx] = itemAtualizado;
      },
      error: (err) => {
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

    const confirmar = window.confirm(
      `Deseja realmente avançar o item para a próxima fase: "${proxima_fase_nome}"?`
    );
    if (!confirmar) return;

    this.faseService.getFaseByFluxo(item.fluxo).subscribe({
      next: (fases) => {
        const proximaFase = fases.find(
          f => f.nome.toLowerCase() === proxima_fase_nome.toLowerCase()
        );
        if (!proximaFase) return;
        if(proximaFase.nome.toLowerCase() == 'expedição') {
          item.finalizado = true;
        }
        this.itemService.updateItem(item.id, { fase_atual: proximaFase.id, finalizado: item.finalizado }).subscribe({
          next: (itemAtualizado) => {
            const idx = this.itens.findIndex(i => i.id === item.id);
            if (idx > -1) this.itens[idx] = itemAtualizado;
            if (this.verificaSePedidoConcluido()) {
              this.atualizarStatusPedidoConcluido();
            }
          },
          error: () => {
            alert('Não foi possível concluir a fase do item.');
          }
        });
      },
      error: () => {}
    });
  }

  verificaSePedidoConcluido() {
    return this.itens.every(item => item.finalizado);
  }

  private atualizarStatusPedidoConcluido(): void {
    this.pedidoService.updateStatus(this.pedido.id, 'finalizado').subscribe({
      next: (pedidoAtualizado) => {
        this.pedido.status = pedidoAtualizado.status;
        this.pedidoAtualizado.emit(pedidoAtualizado);

      },
      error: () => {
        alert('Não foi possível atualizar o status do pedido.');
      }
    });
  }

  downloadArquivo(item: Item, event: Event): void {
    event.preventDefault();
    
    if (!item.arquivo_url || !item.arquivo_nome) {
      console.error('Informações do arquivo incompletas');
      return;
    }
    
    this.arquivoService.downloadArquivo(item.arquivo_url, item.arquivo_nome);
  }

}
