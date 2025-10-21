import { Component } from '@angular/core';
import { FormCadastroPedido } from '../../components/form-cadastro-pedido/form-cadastro-pedido';
import { Navbar } from "../../components/navbar/navbar";
import { TopbarComponent } from "../../components/topbar/topbar.component";
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-cadastro',
  imports: [FormCadastroPedido, Navbar],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.scss'
})
export class CadastroComponent {

  public podeCadastrar: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const user = this.authService.getUser();
    this.podeCadastrar = !!user && ['admin', 'gerente', 'vendedor'].includes(user.funcao);
  }


}
