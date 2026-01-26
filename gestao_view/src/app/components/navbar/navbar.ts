import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {

  usuario = {
    nome: '',
    funcao: ''
  };

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    const user = this.auth.getUser();
    this.usuario.nome = user?.nome || '';
    this.usuario.funcao = user?.funcao || '';

  }

  get isAdmin(): boolean {
    return this.usuario.funcao.toLowerCase() === 'admin';
  }

  get isVendedor(): boolean {
    return this.usuario.funcao.toLowerCase() === 'vendedor';
  }

  get isGerente(): boolean {
    return this.usuario.funcao.toLowerCase() === 'gerente';
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
