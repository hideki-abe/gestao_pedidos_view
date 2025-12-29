import { Component } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { Navbar } from "../../components/navbar/navbar";
import { TabelaItensLaser } from '../../components/tabela-itens-laser/tabela-itens-laser';

@Component({
  selector: 'app-laser',
  imports: [Navbar, TabelaItensLaser],
  templateUrl: './laser.html',
  styleUrl: './laser.scss'
})
export class Laser {
  
}
