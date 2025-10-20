import { Component } from '@angular/core';
import { FormCadastroPedido } from '../../components/form-cadastro-pedido/form-cadastro-pedido';
import { Navbar } from "../../components/navbar/navbar";
import { TopbarComponent } from "../../components/topbar/topbar.component";

@Component({
  selector: 'app-cadastro',
  imports: [FormCadastroPedido, Navbar, TopbarComponent],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.scss'
})
export class CadastroComponent {

}
