import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { UsuarioPayload, UsuarioService } from '../../services/usuario';
import { AuthService } from '../../services/auth-service';
import { Usuario } from '../../interfaces/usuario';

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

  usuarios: Usuario[] = [];
  editando: Usuario | null = null;

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
  public isAdmin: boolean = false;

  constructor(private usuarioService: UsuarioService, private authService: AuthService) {}

  ngOnInit() {
    const user = this.authService.getUser();
    this.podeCadastrar = !!user && ['admin', 'gerente', 'vendedor'].includes(user.funcao);
    this.isAdmin = !!user && user.funcao === 'admin';
    if (this.podeCadastrar) {
      this.carregarUsuarios();
    }
  }

  carregarUsuarios() {
    this.usuarioService.getUsuarios().subscribe({
      next: (usuarios) => this.usuarios = usuarios,
      error: () => this.error = 'Erro ao carregar usuários.'
    });
    console.log("Usuarios cadastrados: ", this.usuarios);
  }

  onSubmit() {
    this.error = '';
    this.success = '';
    if (!this.usuario.nome || !this.usuario.email || (!this.editando && !this.usuario.password)) {
      this.error = 'Nome, e-mail e senha são obrigatórios.';
      return;
    }
    if (!this.editando && this.usuario.password.length < 8) {
      this.error = 'A senha deve ter pelo menos 8 caracteres.';
      return;
    }
    if (this.editando) {
      const payload: Partial<UsuarioPayload> = {
        nome: this.usuario.nome,
        email: this.usuario.email,
        funcao: this.usuario.funcao,
        nivel_acesso: this.usuario.nivel_acesso,
        is_active: this.usuario.is_active,
        is_staff: this.usuario.is_staff,
      };

      if (this.usuario.password) {
        payload.password = this.usuario.password;
      }
      this.usuarioService.editarUsuario(this.editando.id, payload).subscribe({
        next: () => {
          this.success = 'Usuário atualizado com sucesso!';
          this.editando = null;
          this.usuario = {
            nome: '',
            email: '',
            password: '',
            funcao: 'producao',
            nivel_acesso: 1,
            is_active: true,
            is_staff: false
          };
          this.carregarUsuarios();
        },
        error: () => this.error = 'Erro ao atualizar usuário.'
      });
    } else {
      this.usuarioService.cadastrarUsuario(this.usuario as UsuarioPayload).subscribe({
        next: () => {
          this.success = 'Usuário cadastrado com sucesso!';
          this.usuario.password = '';
          this.carregarUsuarios();
        },
        error: (err) => {
          this.error = err.error?.detail || 'Erro ao cadastrar usuário.';
        }
      });
    }
  }

  editar(usuario:Usuario) {
    this.editando = usuario;
    this.usuario = {
      nome: usuario.nome,
      email: usuario.email,
      password: '',
      funcao: usuario.funcao,
      nivel_acesso: usuario.nivel_acesso,
      is_active: usuario.is_active,
      is_staff: usuario.is_staff
    };
  }

  
  editarUsuario(usuario: Usuario) {
    this.editando = usuario;
    const payload: Partial<UsuarioPayload> = {
      nome: usuario.nome,
      email: usuario.email,
      password: '',
      funcao: usuario.funcao,
      nivel_acesso: usuario.nivel_acesso,
      is_active: usuario.is_active,
      is_staff: usuario.is_staff
    };

    this.usuarioService.editarUsuario(usuario.id, payload).subscribe({
      next: () => {
        this.success = 'Usuário atualizado com sucesso!';
        this.carregarUsuarios();
      },
      error: () => this.error = 'Erro ao atualizar usuário.'
    });
      
  }

  cancelarEdicao() {
    this.editando = null;
    this.usuario = {
      nome: '',
      email: '',
      password: '',
      funcao: 'producao',
      nivel_acesso: 1,
      is_active: true,
      is_staff: false
    };
  }

  remover(usuario: Usuario) {
    if (!confirm(`Remover usuário ${usuario.nome}?`)) return;
    this.usuarioService.deletarUsuario(usuario.id).subscribe({
      next: () => {
        this.success = 'Usuário removido!';
        this.carregarUsuarios();
      },
      error: () => this.error = 'Erro ao remover usuário.'
    });
  }

}