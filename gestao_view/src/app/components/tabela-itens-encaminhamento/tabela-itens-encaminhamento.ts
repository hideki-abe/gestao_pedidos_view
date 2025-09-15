import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges, twoWayBinding } from '@angular/core';
import { ItemService } from '../../services/item';
import { Item } from '../../interfaces/item';
import { FormsModule } from '@angular/forms';
import { Pedido } from '../../interfaces/pedido';
import { FluxoService } from '../../services/fluxo';
import { Fluxo } from '../../interfaces/fluxo';
import { Fase } from '../../interfaces/fase';
import { FaseService } from '../../services/fase';

@Component({
  selector: 'app-tabela-itens-encaminhamento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tabela-itens-encaminhamento.html',
  styleUrl: './tabela-itens-encaminhamento.scss'
})
export class TabelaItensEncaminhamento implements OnChanges{

  @Input() public pedido!: Pedido;

  public itens: Item[] = [];
  public fluxos: Fluxo[] = [];
  public fases: Fase[] = [];
  public erroAoCarregar: boolean = false;

  constructor(
    private itemService: ItemService, 
    private fluxoService: FluxoService, 
    private faseService: FaseService) 
  {
    console.log("Componente TabelaItensEncaminhamento carregado:");
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['pedido'] && changes['pedido'].currentValue) {
      this.carregarItensDoPedido(this.pedido.id); 
      this.carregarFluxos();
      this.carregarFases();
    }
  }

  private carregarItensDoPedido(id: number): void {
    this.itemService.getItensDoPedido(id).subscribe({
      next: (data) => {
        this.itens = data;
        this.erroAoCarregar = false;
        console.log(this.fases);
      },
      error: (err) => {
        console.error('Falha ao carregar itens da API:', err);
        this.erroAoCarregar = true;
      }
    });
  }

  private carregarFluxos(): void {
    this.fluxoService.getFluxos().subscribe({
      next: (data) => {
        this.fluxos = data;
        this.erroAoCarregar = false;
      },
      error: (err) => {
        console.error('Falha ao carregar itens da API:', err);
        this.erroAoCarregar = true;
      }
    });
  }

  private carregarFases(): void {
    this.faseService.getFases().subscribe({
      next: (data) => {
        this.fases = data;
        this.erroAoCarregar = false;
        console.log(this.faseService.getFases());
      },
      error: (err) => {
        console.error('Falha ao carregar itens da API:', err);
        this.erroAoCarregar = true;
      }
    });
  }

  private atribuiFluxo() {
    for (const item of this.itens) {
      console.log(item.fase_atual_nome); 
      const tipo: string = item.tipo;

    }
  }

    // 3. ADICIONE ESTE MÉTODO para lidar com a mudança no dropdown
  onFaseChange(item: any, novoFluxoId: number): void { 
    const novaFase = item.fluxo_de_trabalho.fases.find((f: any) => f.id === novoFluxoId);
    if (novaFase) {
      item.fase_atual_id = novaFase.id;
      item.fase_atual_nome = novaFase.nome;
    }
  }

}
