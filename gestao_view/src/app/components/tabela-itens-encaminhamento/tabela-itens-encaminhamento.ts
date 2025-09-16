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
import { forkJoin } from 'rxjs';

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
      this.carregarDadosIniciais();
    }
  }

  private carregarDadosIniciais(): void {
    this.erroAoCarregar = false;

    // forkJoin espera todas as chamadas de API terminarem
    forkJoin({
      itens: this.itemService.getItensDoPedido(this.pedido.id),
      fluxos: this.fluxoService.getFluxos(),
      fases: this.faseService.getFases() // Descomente se precisar das fases
    }).subscribe({
      next: (resultados) => {
        // Neste ponto, AMBOS os dados chegaram
        this.itens = resultados.itens;
        this.fluxos = resultados.fluxos;
        this.fases = resultados.fases;

        console.log("DADOS BRUTOS RECEBIDOS DA API:");
        console.log("Fluxos:", JSON.stringify(this.fluxos, null, 2));
        console.log("Fases:", JSON.stringify(this.fases, null, 2));
        console.log("---------------------------------");

        // Agora é o momento seguro para relacionar os dados
        this.relacionaFluxoComTipo();
      },
      error: (err) => {
        console.error('Falha ao carregar dados iniciais:', err);
        this.erroAoCarregar = true;
      }
    });
  }

  private relacionaFluxoComTipo() {
    const regexCH = /^CH.*/;
    const regexCT = /^CT.*/;
    const regexCR = /^CR.*/;
    const regexDI = /^DI.*/;

    for (const item of this.itens) {
      let fluxoEncontrado: Fluxo | undefined;

      if(item.tipo == 'CH'){
        fluxoEncontrado = this.fluxos.find(fluxo => regexCH.test(fluxo.nome));
      } 
      else if(item.tipo == 'CT'){
        fluxoEncontrado = this.fluxos.find(fluxo => regexCT.test(fluxo.nome));
      }
      else if(item.tipo == 'CR'){
        fluxoEncontrado = this.fluxos.find(fluxo => regexCR.test(fluxo.nome));
      }
      else if(item.tipo == 'DI'){
        fluxoEncontrado = this.fluxos.find(fluxo => regexDI.test(fluxo.nome));
      }

      if (fluxoEncontrado) {
        console.log(`Para o item '${item.nome}' (tipo ${item.tipo}), o fluxo encontrado foi '${fluxoEncontrado.nome}' (ID: ${fluxoEncontrado.id}).`);

        // Filtra TODAS as fases que pertencem ao fluxo encontrado
        const fasesDoFluxo = this.fases.filter(fase => fase.fluxo_id === fluxoEncontrado!.id);
        
        // Atribui o array de fases filtradas a uma nova propriedade no item
        // (Você precisará adicionar 'fluxo_sequencia: Fase[]' à sua interface Item)
        item.fluxo_sequencia = fasesDoFluxo;

        console.log(`Para o item '${item.nome}', foram encontradas ${fasesDoFluxo.length} fases. ${item.fluxo_sequencia[1]} fases atribuídas.`);
      } else {
        // Se nenhum fluxo for encontrado, atribui um array vazio para evitar erros
        item.fluxo_sequencia = [];
        console.warn(`Nenhum fluxo correspondente encontrado para o item '${item.nome}' (tipo: ${item.tipo}).`);
      }
    }
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
