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
        this.itens = resultados.itens || [];
        this.fluxos = resultados.fluxos || [];
        this.fases = resultados.fases || [];
        
     
        //console.log("DADOS BRUTOS RECEBIDOS DA API:");
        console.log("Fluxos:", JSON.stringify(this.fluxos, null, 2));
        //console.log("Fases:", JSON.stringify(this.fases, null, 2));
        //console.log("---------------------------------");


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
      ['CL', /^CL.*/], // Corresponde a CL-G, CL-L, CL-LE
      ['EN', /^EN.*/],
      ['DN', /^DN.*/], // Corresponde a DN-G, DN-F
      ['DE', /^DE.*/], // Corresponde a DE-G, DE
      ['CN', /^CN.*/],
      ['PA', /^PA.*/], // Corresponde a PA, PA-D
      ['LR', /^LR.*/],
      ['LD', /^LD.*/],
      ['LM', /^LM.*/],
      ['DL', /^DL.*/],
      ['LC', /^LC.*/], // Corresponde a LC, LC-E, LCO
      ['LE', /^LE.*/],
      ['LN', /^LN.*/],
      ['LA', /^LA.*/],
      ['LDE', /^LDE.*/],
      ['LCO', /^LCO.*/]
    ]);

    for (const item of this.itens) {

      console.log(`Verificando tipo do item: |${item.tipo}|`);
      // 2. Obtenha a regex correta diretamente do mapa.
      const regex = tipoParaRegexMap.get(item.tipo);

      if (regex) {
        // 3. Use .filter() para encontrar TODOS os fluxos que correspondem à regex.
        const fluxosEncontrados = this.fluxos.filter(fluxo => regex.test(fluxo.nome));
        item.fluxos_disponiveis = fluxosEncontrados;

        if (fluxosEncontrados.length > 0) {
          console.log(`Para o item '${item.nome}' (tipo ${item.tipo}), foram encontrados ${fluxosEncontrados.length} fluxos.`);
        } else {
          console.warn(`Nenhum fluxo com o padrão para '${item.tipo}' foi encontrado na lista de fluxos.`);
        }
      } else {
        // O tipo do item (ex: 'XY') não está no mapa.
        item.fluxos_disponiveis = [];
        console.warn(`Nenhuma regra de regex definida para o tipo de item: '${item.tipo}'.`);
      }
    }
  }


  private atribuiFluxo() {
    for (const item of this.itens) {
      if (item.fluxo_sequencia) {
        for (const fase of item.fluxo_sequencia){
          console.log(`Fase ${fase.nome} (Ordem: ${fase.ordem})`);
        }
      }
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
