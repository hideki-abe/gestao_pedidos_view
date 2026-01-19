import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabelaEncaminhamento } from '../../components/tabela-encaminhamento/tabela-encaminhamento';
import { Navbar } from "../../components/navbar/navbar";
import { TopbarComponent } from "../../components/topbar/topbar.component";
import { ImportacaoService } from '../../services/importacao_sankhya';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-encaminhamento',
  imports: [CommonModule, TabelaEncaminhamento, Navbar],
  templateUrl: './encaminhamento.component.html',
  styleUrl: './encaminhamento.component.scss'
})
export class EncaminhamentoComponent {
  @ViewChild(TabelaEncaminhamento) tabelaEncaminhamento!: TabelaEncaminhamento;
  public importando: boolean = false;

  constructor(
    private importacaoService: ImportacaoService,
    private toastr: ToastrService
  ) {}

  importarEAtualizarPedidos(): void {
    this.importando = true;
    this.toastr.info('Iniciando importação dos pedidos...', 'Importação');

    this.importacaoService.triggerImportacao().subscribe({
      next: (response) => {
        console.log('Importação concluída:', response);
        this.toastr.success('Pedidos importados com sucesso!', 'Sucesso');
        
        // Atualiza a tabela após a importação
        if (this.tabelaEncaminhamento) {
          this.tabelaEncaminhamento.uploadPedidos();
        }
        this.importando = false;
      },
      error: (err) => {
        console.error('Erro ao importar pedidos:', err);
        this.toastr.error('Erro ao importar pedidos. Tente novamente.', 'Erro');
        this.importando = false;
      }
    });
  }
}