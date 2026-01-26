import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ItemService } from '../../services/item';
import { Item } from '../../interfaces/item';
import { Pedido } from '../../interfaces/pedido';
import { FaseService } from '../../services/fase';
import { Fase } from '../../interfaces/fase';
import { forkJoin } from 'rxjs';
import { ArquivoService } from '../../services/arquivo';
import { HttpParams } from '@angular/common/http';

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
    private faseService: FaseService,
    private arquivoService: ArquivoService
  ) {}

  ngOnInit(): void {
    this.carregarDadosIniciais();
  }

  private carregarDadosIniciais(): void {
    this.erroAoCarregar = false;
    this.itens = [];

    forkJoin({
      itens: this.itemService.getItensFiltrados('Laser', 'producao'),
      fases: this.faseService.getFases()
    }).subscribe({
      next: (resultados) => {
        this.itens = resultados.itens || [];
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
      return;
    }


    this.itemService.updateItem(item.id, { fase_atual: proximaFase.id }).subscribe({
      next: (itemAtualizado) => {
        console.log('Fase avançada com sucesso:', itemAtualizado);
        this.carregarDadosIniciais();
      },
      error: (err) => {
        console.error('Erro ao avançar fase:', err);
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