import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabelaEncaminhamento } from '../../components/tabela-encaminhamento/tabela-encaminhamento';
import { Navbar } from "../../components/navbar/navbar";
import { ImportacaoService } from '../../services/importacao_sankhya';
import { ToastrService } from 'ngx-toastr';
import { Select } from "primeng/select";
import { Button } from "primeng/button";
import { FormsModule } from '@angular/forms';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputGroup } from 'primeng/inputgroup';
import { InputText } from 'primeng/inputtext';
import { Menu } from 'primeng/menu';

@Component({
  selector: 'app-encaminhamento',
  imports: [CommonModule, TabelaEncaminhamento, Navbar, InputGroup, InputGroupAddon, InputText, Button, FormsModule],
  templateUrl: './encaminhamento.component.html',
  styleUrl: './encaminhamento.component.scss'
})
export class EncaminhamentoComponent {
  @ViewChild(TabelaEncaminhamento) tabelaEncaminhamento!: TabelaEncaminhamento;
  public importando: boolean = false;
  
  nunota = '';

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

  importaPedidoUnico(nunota: String): void {
    if (!nunota || nunota.trim() === '') {
      this.toastr.warning('Por favor, informe o número único do pedido.', 'Atenção');
      return;
    }

    this.importacaoService.importarUnicoPedido(nunota).subscribe({
      next: (response) => {
        console.log('Importação do pedido concluída:', response);
        this.toastr.success('Pedido importado com sucesso!', 'Sucesso');

        if (this.tabelaEncaminhamento) {
          this.tabelaEncaminhamento.uploadPedidos();
        }
      },
      error: (err) => {
        console.error('Erro ao importar o pedido:', err);
        this.toastr.error('Erro ao importar o pedido. Tente novamente.', 'Erro');
      }
    });
  }

}