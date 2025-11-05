import { Component } from '@angular/core';
import { Navbar } from "../../components/navbar/navbar";
import { TabelaFinalizados } from '../../components/tabela-finalizados/tabela-finalizados';

@Component({
  selector: 'app-finalizados',
  imports: [TabelaFinalizados, Navbar],
  templateUrl: './finalizados.component.html',
  styleUrl: './finalizados.component.scss'
})
export class FinalizadosComponent {
  pagina: any;

}
