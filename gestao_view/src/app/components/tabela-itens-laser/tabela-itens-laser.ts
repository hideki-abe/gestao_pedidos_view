import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ItemService } from '../../services/item';
import { Item } from '../../interfaces/item';
import { Pedido } from '../../interfaces/pedido';
import { FaseService } from '../../services/fase';
import { Fase } from '../../interfaces/fase';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-tabela-itens-laser',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabela-itens-laser.html',
  styleUrl: './tabela-itens-laser.scss'
})
export class TabelaItensLaser{

  public itens: Item[] = [];
  public fases: Fase[] = [];
  public erroAoCarregar: boolean = false;

  constructor(
    private itemService: ItemService,
    private faseService: FaseService
  ) {}

  ngOnInit(): void {
    this.carregarDadosIniciais();
  }

  private carregarDadosIniciais(): void {
    this.erroAoCarregar = false;

    forkJoin({
      itens: this.itemService.getItens(),
      fases: this.faseService.getFases()
    }).subscribe({
      next: (resultados) => {
        for(let item of resultados.itens) {
          if (item.fase_atual_nome == 'Laser') {
            this.itens.push(item);
          } 
        }
        this.fases = resultados.fases || [];
        console.log('Itens carregados:', this.itens);
      },
      error: (err) => {
        console.error('Falha ao carregar dados iniciais:', err);
        this.erroAoCarregar = true;
      }
    });
  }

  avancarFase(item: Item): void {
    if (!item.fase_atual) {
      console.warn('Item não possui fase atual definida');
      return;
    }

    // Encontra a próxima fase na ordem
    const faseAtual = this.fases.find(f => f.id === item.fase_atual);
    if (!faseAtual) {
      console.error('Fase atual não encontrada');
      return;
    }

    const proximaFase = this.fases.find(
      f => f.fluxo_nome === faseAtual.fluxo_nome && f.ordem === faseAtual.ordem + 1
    );

    if (!proximaFase) {
      console.warn('Não há próxima fase disponível para este item');
      // TODO: Adicionar toast informando que o item já está na última fase
      return;
    }

    // Atualiza a fase do item
    this.itemService.updateItem(item.id, { fase_atual: proximaFase.id }).subscribe({
      next: (itemAtualizado) => {
        console.log('Fase avançada com sucesso:', itemAtualizado);
        Object.assign(item, itemAtualizado);
        // TODO: Adicionar toast de sucesso
      },
      error: (err) => {
        console.error('Erro ao avançar fase:', err);
        // TODO: Adicionar toast de erro
      }
    });
  }
}