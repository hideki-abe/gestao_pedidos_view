import { Component } from '@angular/core';
import { TabelaProducao } from "../../components/tabela-producao/tabela-producao";

@Component({
  selector: 'app-producao.component',
  imports: [TabelaProducao],
  templateUrl: './producao.component.html',
  styleUrl: './producao.component.scss'
})
export class ProducaoComponent {

}
