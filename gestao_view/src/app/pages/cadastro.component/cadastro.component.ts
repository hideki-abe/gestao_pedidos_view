import { Component } from '@angular/core';
import { FormCadastroPedido } from '../../components/form-cadastro-pedido/form-cadastro-pedido';

@Component({
  selector: 'app-cadastro.component',
  imports: [FormCadastroPedido],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.scss'
})
export class CadastroComponent {

}
