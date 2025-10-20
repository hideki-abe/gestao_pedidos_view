import { Component } from '@angular/core';
import { TabelaProducao } from "../../components/tabela-producao/tabela-producao";
import { TopbarComponent } from "../../components/topbar/topbar.component";
import { Navbar } from "../../components/navbar/navbar";

@Component({
  selector: 'app-producao',
  imports: [TabelaProducao, Navbar],
  templateUrl: './producao.component.html',
  styleUrl: './producao.component.scss'
})
export class ProducaoComponent {

}
