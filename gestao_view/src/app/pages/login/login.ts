import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';

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

  constructor(private router: Router, private auth: AuthService) {}


  onSubmit() {
    this.error = '';
    if (!this.username || !this.password) {
      this.error = 'Preencha e-mail e senha.';
      return;
    }
    this.loading = true;
    this.auth.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/producao']); 
      },
      error: () => {
        this.loading = false;
        this.error = 'Usuário ou senha inválidos.';
      }
    });
  }
}