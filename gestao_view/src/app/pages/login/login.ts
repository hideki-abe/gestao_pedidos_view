import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  username: string = '';
  password: string = '';
  error: string = '';
  loading: boolean = false;

  onSubmit() {
    this.error = '';
    if (!this.username || !this.password) {
      this.error = 'Preencha usuário e senha.';
      return;
    }
    this.loading = true;
    // Simulação de autenticação (substitua pelo AuthService real)
    setTimeout(() => {
      this.loading = false;
      if (this.username === 'admin' && this.password === 'admin') {
        // Aqui você pode redirecionar ou salvar token
        alert('Login realizado com sucesso!');
      } else {
        this.error = 'Usuário ou senha inválidos.';
      }
    }, 1000);
  }
}