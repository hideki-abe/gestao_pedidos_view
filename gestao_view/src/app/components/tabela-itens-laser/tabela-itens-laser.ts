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
    { option: 'Avançar Fase' },
    { option: 'Cancelar' },
    { option: 'Baixar Arquivos' }
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

    let proximaFase: Fase | undefined;
    if(confirm('Deseja avançar para a próxima fase?')) {
      proximaFase = this.fases.find(
        f => f.fluxo_nome === faseAtual.fluxo_nome && f.ordem === faseAtual.ordem + 1
      );
      this.carregarDadosIniciais();
    }

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

  isItemSelected(item: Item): boolean {
    // Implementar lógica para verificar se o item está selecionado
    return false;
  }

  onItemSelect(item: Item, $event: boolean): void {
    this.selectedItens.set(item, $event);
    console.log('Item selecionado:', this.selectedItens);
  }

  showCheckbox(event?: any): void {
    console.log('Opção selecionada:', event);
    if(event) {
      this.selectedOption = event.option;
      if(event.option === 'Cancelar' || event.option === 'Avançar Fase') {
        this.show = false;
      } else {
        this.show = true;
      }
    } else {
      this.show = false;
    } 
    
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
        this.selectedOperador = null;
        this.show = false;
        this.selectedOption = '';
      }
    });
  }

}