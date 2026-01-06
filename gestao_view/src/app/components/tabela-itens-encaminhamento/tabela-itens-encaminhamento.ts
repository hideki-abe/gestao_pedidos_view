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
import { Arquivo } from '../../interfaces/arquivo';
import { ArquivoService } from '../../services/arquivo';
import { HttpEventType, HttpResponse } from '@angular/common/http';


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

  public itemFile: Arquivo | null = null;
  public itemFiles: Arquivo[] = [];
  public isUploading: { [itemId: number]: boolean } = {};
  public showFilesList: { [itemId: number]: boolean } = {};

  constructor(
    private itemService: ItemService, 
    private fluxoService: FluxoService, 
    private faseService: FaseService,
    private arquivoService: ArquivoService
  ) 
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

        console.log(this.itens);
        this.relacionaFluxoComTipo();
        this.atribuirFluxoAutomatico();
        this.carregarArquivosDosItens();
      },
      error: (err) => {
        console.error('Falha ao carregar dados iniciais:', err);
        this.erroAoCarregar = true;
      }
    });
  }

  private carregarArquivosDosItens(): void {
    this.itens.forEach(item => {
      this.arquivoService.getArquivosDoItem(item.id).subscribe({
        next: (arquivos) => {
          // Adiciona o arquivo diretamente no item
          (item as any).arquivo = arquivos.length > 0 ? arquivos[0] : null;
          (item as any).isUploading = false;
        },
        error: (err) => {
          console.error(`Erro ao carregar arquivos do item ${item.id}:`, err);
          (item as any).arquivo = null;
          (item as any).isUploading = false;
        }
      });
    });
  }

  
  triggerFileInput(itemId: number): void {
    const fileInput = document.getElementById(`file-${itemId}`) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onFileSelected(event: Event, item: any): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.uploadArquivo(item, file);
    }
  }

  private uploadArquivo(item: any, file: File): void {
    item.isUploading = true;

    this.arquivoService.uploadArquivoDoItem(item.id, file).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          const percentDone = Math.round(100 * (event.loaded / (event.total || 1)));
          console.log(`Upload ${percentDone}% completo`);
        } else if (event instanceof HttpResponse) {
          console.log('Upload concluído!', event.body);
          
          // ✅ Atualiza TODAS as propriedades necessárias
          const arquivoUpload = event.body;
          if (arquivoUpload) {
            item.arquivo_url = arquivoUpload.file;
            item.arquivo_nome = arquivoUpload.file_name;
            item.arquivo_tipo = arquivoUpload.file_type;
            item.arquivo_tamanho = arquivoUpload.tamanho;
            item.arquivo = arquivoUpload; // Mantém consistência
            console.log('Arquivo atualizado no item:', item.arquivo_nome);
          }
        }
      },
      error: (err) => {
        console.error('Erro ao fazer upload:', err);
        alert('Erro ao enviar arquivo. Tente novamente.');
        item.isUploading = false;
      },
      complete: () => {
        item.isUploading = false;
        const input = document.getElementById(`file-${item.id}`) as HTMLInputElement;
        if (input) {
          input.value = '';
        }
      }
    });
  }

  toggleFilesList(itemId: number): void {
    this.showFilesList[itemId] = !this.showFilesList[itemId];
  }


  removerArquivo(item: any): void {
    const nomeArquivo = item.arquivo_nome || item.arquivo?.file_name || 'este arquivo';
    
    if (!confirm(`Deseja remover o arquivo "${nomeArquivo}"?`)) {
      return;
    }

    // Pega o ID do arquivo corretamente
    const arquivoId = item.arquivo?.id;
    
    if (!arquivoId) {
      console.error('ID do arquivo não encontrado');
      return;
    }

    this.arquivoService.removerArquivoItem(arquivoId).subscribe({
      next: () => {
        // ✅ Limpa TODAS as propriedades relacionadas
        item.arquivo_url = '';
        item.arquivo_nome = '';
        item.arquivo_tipo = '';
        item.arquivo_tamanho = 0;
        item.arquivo = null;
        console.log('Arquivo removido com sucesso');
      },
      error: (err) => {
        console.error('Erro ao remover arquivo:', err);
        alert('Erro ao remover arquivo.');
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
      ['LCO', /^LCO.*/],
      ['LS', /^LS.*/],
    ]);

    for (const item of this.itens) {

      //console.log(`Verificando tipo do item: |${item.tipo}|`);
      const regex = tipoParaRegexMap.get(item.tipo);

      if (regex) {
        const fluxosEncontrados = this.fluxos.filter(fluxo => regex.test(fluxo.nome));
        item.fluxos_disponiveis = fluxosEncontrados;
        
        
        if (fluxosEncontrados.length > 0) {
          console.log(`Para o item '${item.nome}' (tipo ${item.tipo}), foram encontrados ${fluxosEncontrados.length} fluxos.`);
        } else {
          console.warn(`Nenhum fluxo com o padrão para '${item.tipo}' foi encontrado na lista de fluxos.`);
        }
        
      } else {
        item.fluxos_disponiveis = [];
        console.warn(`Nenhuma regra de regex definida para o tipo de item: '${item.tipo}'.`);
      }
    }
  }

  private atribuirFluxoAutomatico(): void {
    for (const item of this.itens) {
      if (!item.fluxo_nome && item.fluxos_disponiveis?.length === 1) {
        const fluxoUnico = item.fluxos_disponiveis[0];
        console.log(`Atribuindo automaticamente o fluxo "${fluxoUnico.descricao}" ao item "${item.nome}"`);
        

        this.onFluxoChange(item, fluxoUnico.nome);
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
          let faseInicial = this.fases.find(fase => fase.fluxo_nome === novoFluxo.nome && fase.ordem === 1);

          if(faseInicial?.nome == 'Projeto') {
            console.log('Fase inicial é projeto, buscando fase 2...');
            faseInicial = this.fases.find(fase => fase.fluxo_nome === novoFluxo.nome && fase.ordem === 2);
          }

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