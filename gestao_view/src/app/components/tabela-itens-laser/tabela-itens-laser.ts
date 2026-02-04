import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ItemService } from '../../services/item';
import { Item } from '../../interfaces/item';
import { Pedido } from '../../interfaces/pedido';
import { Operador } from '../../interfaces/operador';
import { FaseService } from '../../services/fase';
import { Fase } from '../../interfaces/fase';
import { forkJoin } from 'rxjs';
import { ArquivoService } from '../../services/arquivo';
import { HttpParams } from '@angular/common/http';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { OperadorService } from '../../services/operador';

@Component({
  selector: 'app-tabela-itens-laser',
  standalone: true,
  imports: [CommonModule, CheckboxModule, ButtonModule, FormsModule, SelectModule],
  templateUrl: './tabela-itens-laser.html',
  styleUrl: './tabela-itens-laser.scss'
})
export class TabelaItensLaser{

  public itens: Item[] = [];
  public fases: Fase[] = [];
  public operadores: Operador[] = [];
  public erroAoCarregar: boolean = false;

  selectedItens = new Map<Item, boolean>();

  options = [
    { option: 'Selecionar Operador' },
    { option: 'Finalizar Item' },
    { option: 'Baixar Arquivos' },
    { option: 'Cancelar' }
  ]
  selectedOption: String = '';
  selectedOperador: Operador | null = null;
  show: boolean = false;

  constructor(
    private itemService: ItemService,
    private faseService: FaseService,
    private arquivoService: ArquivoService,
    private operadorService: OperadorService
  ) {}

  ngOnInit(): void {
    this.carregarDadosIniciais();
  }

  private carregarDadosIniciais(): void {
    this.erroAoCarregar = false;
    this.itens = [];

    forkJoin({
      itens: this.itemService.getItensFiltrados('Laser', 'producao'),
      fases: this.faseService.getFases(),
      operadores: this.operadorService.getOperadores()

    }).subscribe({
      next: (resultados) => {
        this.itens = resultados.itens || [];
        this.fases = resultados.fases || [];
        this.operadores = resultados.operadores || [];
        console.log('Itens carregados:', this.itens);
      },
      error: (err) => {
        console.error('Falha ao carregar dados iniciais:', err);
        this.erroAoCarregar = true;
      }
    });
  }

  proximaFase(item: Item): any {
    if (!item.fase_atual) {
      console.warn('Item não possui fase atual definida');
      return undefined;
    }

    const faseAtual = this.fases.find(f => f.id === item.fase_atual);
    if (!faseAtual) {
      console.error('Fase atual não encontrada');
      return undefined;
    }

    let proximaFase: Fase | undefined;
    proximaFase = this.fases.find(
      f => f.fluxo_nome === faseAtual.fluxo_nome && f.ordem === faseAtual.ordem + 1
    );
    return proximaFase;

    /*
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
    */
  }

  downloadArquivo(item: Item, event: Event): void {
    event.preventDefault();
    
    if (!item.arquivo_url || !item.arquivo_nome) {
      console.error('Informações do arquivo incompletas');
      return;
    }
    
    this.arquivoService.downloadArquivo(item.arquivo_url, item.arquivo_nome);
  }

  downloadArquivosSelecionados(): void {
    const itensSelecionados = Array.from(this.selectedItens.entries())
      .filter(([item, selecionado]) => selecionado)
      .map(([item, selecionado]) => item.id);

    console.log('Itens selecionados para download:', itensSelecionados);

    this.arquivoService.getArquivosDeItens(itensSelecionados)
      .subscribe({
        next: (arquivos) => {
          console.log(arquivos);

          if(arquivos.length === 0) {
            alert('Nenhum arquivo encontrado para os itens selecionados.');
            return;
          }
          arquivos.forEach((arquivo, index) => {
            setTimeout(() => {
              this.arquivoService.downloadArquivo(arquivo.file, arquivo.file_name);
            }, index * 500); 
        });
        },
        error: (err) => {
          console.error('Erro ao buscar arquivos dos itens selecionados:', err);
          alert('Erro ao buscar arquivos dos itens selecionados. Verifique o console para mais detalhes.');
        }
      });
        
  }

  isItemSelected(item: Item): boolean {
    // Implementar lógica para verificar se o item está selecionado
    return false;
  }

  onItemSelect(item: Item, $event: boolean): void {
    this.selectedItens.set(item, $event);
  }

  showCheckbox(event?: any): void {
    console.log('Opção selecionada:', event);
    if(event) {
      this.selectedOption = event.option;
      if(event.option === 'Cancelar') {
        this.show = false;
      } else if(event.option === 'Baixar Arquivos') {
        this.show = false;
        this.downloadArquivosSelecionados();
      } else if(event.option === 'Finalizar Item') {
        this.show = false;
        this.atualizarFases();
      } else {
        this.show = true;
      }
    } else {
      this.show = false;
    } 
    
  }

  atualizarFases(): void {
    const itens = Array.from(this.selectedItens.keys()).map(item => item);

    const itensFases = new Map<number, number>();

    alert("Deseja atualizar as fases dos itens selecionados?");
    for (const item of itens) {

      const proximaFase = this.proximaFase(item);

      if (proximaFase) {
        itensFases.set(item.id, proximaFase.id);
      } else {
        alert(`O item "${item.nome}" não possui próxima fase definida.`);
      }
      //console.log('Próxima fase para o item', item.id, ':', proximaFase);
    }


    itensFases.forEach((faseId, itemId) => {
      this.itemService.updateItem(itemId, { fase_atual: faseId }).subscribe({
        next: (itemAtualizado) => {
          console.log(`Item ${itemId} atualizado para a fase ${faseId}:`, itemAtualizado);
          this.carregarDadosIniciais();
          this.selectedItens.clear();
          this.selectedOperador = null;
          this.show = false;
          this.selectedOption = '';
        },
        error: (err) => {
          console.error(`Erro ao atualizar o item ${itemId} para a fase ${faseId}:`, err);
          this.selectedItens.clear();
          this.selectedOperador = null;
          this.show = false;
          this.selectedOption = '';
        }
      });
    });

  }

  atualizarOperador(operador: Operador): void {
    console.log('Operador selecionado para atualização:', operador);
    const itemIds = Array.from(this.selectedItens.keys()).map(item => item.id);
    this.itemService.updateItensMultiplos(itemIds, { operador_id: operador.id }).subscribe({
      next: (response) => {
        alert("Operador atualizado com sucesso!");
        this.carregarDadosIniciais();
        this.selectedItens.clear();
        this.selectedOperador = null;
        this.show = false;
        this.selectedOption = '';
      },
      error: (err) => {
        console.log('Erro ao atualizar operador dos itens:', err);
        this.selectedOperador = null;
        this.show = false;
        this.selectedOption = '';
      }
    });
  }

}