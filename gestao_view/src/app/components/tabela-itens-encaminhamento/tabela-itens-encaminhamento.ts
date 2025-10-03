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
import { forkJoin, switchMap, of } from 'rxjs';

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

  onFluxoChange(item: Item, novoFluxoNome: string): void { 
    if (!novoFluxoNome) return;

    const novoFluxo = item.fluxos_disponiveis?.find((f: Fluxo) => f.nome === novoFluxoNome);

    if (novoFluxo) {
      // Guarda o estado antigo para reverter em caso de erro
      const estadoAntigo = { fluxo: item.fluxo_nome, fase_atual: item.fase_atual };

      // 1. Primeira chamada: Atualiza o fluxo do item
      this.itemService.atualizarFluxoDoItem(item.id, novoFluxo.id).pipe(
        // 2. Encadeia a próxima operação usando switchMap
        switchMap(itemComFluxoAtualizado => {
          // Lógica para encontrar a fase inicial
          const faseInicial = this.fases.find(fase => fase.fluxo_nome === novoFluxo.nome && fase.ordem === 1);

          if (faseInicial) {
            // Se encontrou uma fase inicial, faz a SEGUNDA chamada para atualizar a fase
            console.log(`Fase inicial encontrada (ID: ${faseInicial.id}). Atualizando no banco de dados...`);
            return this.itemService.updateItem(item.id, { fase_atual: faseInicial.id });
          } else {
            // Se não encontrou, apenas continua o fluxo com o item já atualizado (sem fase)
            console.warn(`Nenhuma fase inicial (ordem 1) encontrada para o fluxo ID: ${novoFluxo.id}`);
            return of(itemComFluxoAtualizado); // 'of' cria um Observable a partir de um valor
          }
        })
      ).subscribe({
        next: (itemFinalAtualizado) => {
          // 3. Sucesso! Ambas as requisições (ou apenas a primeira) foram concluídas.
          console.log('Processo de atualização concluído. Item final:', itemFinalAtualizado);
          // Atualiza a UI com o estado final e correto do servidor.
          Object.assign(item, itemFinalAtualizado);
        },
        error: (err) => {
          console.error('Ocorreu um erro durante a atualização:', err);
          // Reverte a UI para o estado anterior em caso de falha em qualquer uma das etapas.
          Object.assign(item, estadoAntigo);
          // TODO: Adicionar um toast de erro para o usuário.
        }
      });
    } else {
      console.error(`Fluxo com nome '${novoFluxoNome}' não foi encontrado.`);
    }
  }
}