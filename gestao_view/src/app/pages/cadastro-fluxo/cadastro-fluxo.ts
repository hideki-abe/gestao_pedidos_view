import { Component } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { FormCadastroFluxo } from "../../components/form-cadastro-fluxo/form-cadastro-fluxo";
import { Navbar } from "../../components/navbar/navbar";

@Component({
  selector: 'app-cadastro-fluxo',
  imports: [FormCadastroFluxo, Navbar],
  templateUrl: './cadastro-fluxo.html',
  styleUrl: './cadastro-fluxo.scss'
})
export class CadastroFluxo {

  public podeCadastrar: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const user = this.authService.getUser();
    this.podeCadastrar = !!user && ['admin', 'gerente', 'vendedor'].includes(user.funcao);
  }

}
