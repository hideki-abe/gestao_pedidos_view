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
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['pedido'] && changes['pedido'].currentValue) {
      this.carregarDadosIniciais();
    }
  }

  private carregarDadosIniciais(): void {
    this.erroAoCarregar = false;

    forkJoin({
      itens: this.itemService.getItensDoPedido(this.pedido.id),
      fluxos: this.fluxoService.getFluxos(),
      fases: this.faseService.getFases() 
    }).subscribe({
      next: (resultados) => {
        this.itens = resultados.itens || [];
        this.fluxos = resultados.fluxos || [];
        this.fases = resultados.fases || [];
        
     
        //console.log("DADOS BRUTOS RECEBIDOS DA API:");
        //console.log("Fluxos:", JSON.stringify(this.fluxos, null, 2));
        //console.log("Fases:", JSON.stringify(this.fases, null, 2));
        //console.log("---------------------------------");
        //console.log("Itens do pedido: ", this.itens);

        this.relacionaFluxoComTipo();
        //this.atribuiFluxo();
      },
      error: (err) => {
        console.error('Falha ao carregar dados iniciais:', err);
        this.erroAoCarregar = true;
      }
    });
  }

  private relacionaFluxoComTipo() {

    const tipoParaRegexMap = new Map<string, RegExp>([
      ['BR', /^BR.*/],
      ['CH', /^CH.*/],
      ['CT', /^CT.*/],
      ['CR', /^CR.*/],
      ['DI', /^DI.*/],
      ['CP', /^CP.*/],
      ['AN', /^AN.*/],
      ['MD', /^MD.*/],
      ['DS', /^DS.*/],
      ['CL', /^CL.*/],
      ['EN', /^EN.*/],
      ['DN', /^DN.*/],
      ['DE', /^DE.*/],
      ['CN', /^CN.*/],
      ['PA', /^PA.*/], 
      ['LR', /^LR.*/],
      ['LD', /^LD.*/],
      ['LM', /^LM.*/],
      ['DL', /^DL.*/],
      ['LC', /^LC.*/],
      ['LE', /^LE.*/],
      ['LN', /^LN.*/],
      ['LA', /^LA.*/],
      ['LDE', /^LDE.*/],
      ['LCO', /^LCO.*/]
    ]);

    for (const item of this.itens) {

      //console.log(`Verificando tipo do item: |${item.tipo}|`);
      const regex = tipoParaRegexMap.get(item.tipo);

      if (regex) {
        const fluxosEncontrados = this.fluxos.filter(fluxo => regex.test(fluxo.nome));
        item.fluxos_disponiveis = fluxosEncontrados;
        
        /*
        if (fluxosEncontrados.length > 0) {
          console.log(`Para o item '${item.nome}' (tipo ${item.tipo}), foram encontrados ${fluxosEncontrados.length} fluxos.`);
        } else {
          console.warn(`Nenhum fluxo com o padrão para '${item.tipo}' foi encontrado na lista de fluxos.`);
        }
        */
      } else {
        item.fluxos_disponiveis = [];
        console.warn(`Nenhuma regra de regex definida para o tipo de item: '${item.tipo}'.`);
      }
    }
  }

  onFluxoChange(item: any, novoFluxoNome: string): void { 
     //console.log(`O item '${item.nome}' mudou para o fluxo:`, novoFluxoNome);

    if (novoFluxoNome) {
      // 1. Encontra o objeto do fluxo selecionado.
      //console.log("Fluxos disponíveis: ", item.fluxos_disponiveis);
      const novoFluxo = item.fluxos_disponiveis?.find((f: Fluxo) => f.nome === novoFluxoNome);
      // 2. VERIFICAÇÃO DE SEGURANÇA: Prossiga apenas se o fluxo foi encontrado.
      //console.log(item)
      if (novoFluxo) {
        this.itemService.atualizarFluxoDoItem(item.id, novoFluxo.id).subscribe({
          next: (itemAtualizadoDoServidor) => {
            // 3. Formatação corrigida e lógica de sucesso.
            //console.log('Fluxo atualizado com sucesso no backend!', itemAtualizadoDoServidor);
            //Object.assign(item, itemAtualizadoDoServidor);
          },
          error: (err) => {
            console.error('Ocorreu um erro ao tentar atualizar o fluxo:', err);
            // TODO: Adicionar lógica para reverter a mudança na UI em caso de erro.
          }
        });
      } else {
        console.error(`Fluxo com nome '${novoFluxoNome}' não foi encontrado na lista de fluxos disponíveis do item.`);
      }
    } // 4. CHAVE DE FECHAMENTO ADICIONADA.
  }
}