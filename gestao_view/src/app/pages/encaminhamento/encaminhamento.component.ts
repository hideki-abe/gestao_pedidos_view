import { Component } from '@angular/core';
import { TabelaEncaminhamento } from '../../components/tabela-encaminhamento/tabela-encaminhamento';
import { Navbar } from "../../components/navbar/navbar";
import { TopbarComponent } from "../../components/topbar/topbar.component";

@Component({
  selector: 'app-encaminhamento',
  imports: [TabelaEncaminhamento, Navbar],
  templateUrl: './encaminhamento.component.html',
  styleUrl: './encaminhamento.component.scss'
})
export class EncaminhamentoComponent {

}
