import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { UsuarioPayload, UsuarioService } from '../../services/usuario';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-cadastro-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar],
  templateUrl: './cadastro-usuario.html',
  styleUrl: './cadastro-usuario.scss'
})
export class CadastroUsuario {
  usuario = {
    nome: '',
    email: '',
    password: '',
    funcao: 'producao',
    nivel_acesso: 1,
    is_active: true,
    is_staff: false
  };

  FUNCAO_CHOICES = [
    { value: 'admin', label: 'Administrador' },
    { value: 'gerente', label: 'Gerente' },
    { value: 'vendedor', label: 'Vendedor' },
    { value: 'producao', label: 'Produção' },
    { value: 'qualidade', label: 'Qualidade' },
    { value: 'financeiro', label: 'Financeiro' },
  ];

  NIVEL_ACESSO_CHOICES = [
    { value: 1, label: 'Básico' },
    { value: 2, label: 'Intermediário' },
    { value: 3, label: 'Avançado' },
    { value: 4, label: 'Administrador' },
  ];

  error: string = '';
  success: string = '';

  public podeCadastrar: boolean = false;

  constructor(private usuarioService: UsuarioService, private authService: AuthService) {}

  ngOnInit() {
    const user = this.authService.getUser();
    console.log(user);
    this.podeCadastrar = !!user && ['admin', 'gerente', 'vendedor'].includes(user.funcao);
  }

  onSubmit() {
    this.error = '';
    this.success = '';
    if (!this.usuario.nome || !this.usuario.email || !this.usuario.password) {
      this.error = 'Nome, e-mail e senha são obrigatórios.';
      return;
    }
    if (this.usuario.password.length < 8) {
      this.error = 'A senha deve ter pelo menos 8 caracteres.';
      return;
    }
    this.usuarioService.cadastrarUsuario(this.usuario as UsuarioPayload).subscribe({
      next: () => {
        this.success = 'Usuário cadastrado com sucesso!';
        this.usuario.password = '';
      },
      error: (err) => {
        this.error = err.error?.detail || 'Erro ao cadastrar usuário.';
      }
    });
  }
}