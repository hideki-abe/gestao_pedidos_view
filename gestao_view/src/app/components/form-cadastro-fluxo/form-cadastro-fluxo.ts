import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Fluxo } from '../../interfaces/fluxo';
import { FluxoService } from '../../services/fluxo';

@Component({
  selector: 'app-form-cadastro-fluxo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-cadastro-fluxo.html',
  styleUrl: './form-cadastro-fluxo.scss'
})
export class FormCadastroFluxo {
  nome: string = '';
  descricao: string = '';
  total_fases: number | null = null;

  fluxos: Fluxo[] = [];
  error: string = '';
  success: string = '';

  constructor(private fluxoService: FluxoService) {}

  ngOnInit() {
    this.carregarFluxos();
  }

  formularioValido(): boolean {
    return !!(this.nome && this.descricao && this.total_fases && this.total_fases > 0);
  }

  salvarFluxo(): void {
    if (!this.formularioValido()) {
      this.error = 'Preencha todos os campos obrigatórios.';
      return;
    }

    const novoFluxo: Omit<Fluxo, 'id'> = {
      nome: this.nome.trim(),
      descricao: this.descricao.trim(),
      total_fases: this.total_fases!
    };

    this.fluxoService.criarFluxo(novoFluxo).subscribe({
      next: (fluxoCriado) => {
        this.success = `Fluxo "${fluxoCriado.nome}" cadastrado com sucesso!`;
        this.error = '';
        this.limparFormulario();
        this.carregarFluxos();
      },
      error: (err) => {
        this.error = 'Erro ao cadastrar fluxo.';
        this.success = '';
        console.error(err);
      }
    });
  }

  carregarFluxos(): void {
    this.fluxoService.getFluxos().subscribe({
      next: (fluxos) => this.fluxos = fluxos,
      error: () => this.error = 'Erro ao carregar fluxos.'
    });
  }

  limparFormulario(): void {
    this.nome = '';
    this.descricao = '';
    this.total_fases = null;
  }

  // ...existing code...
fluxoEditando: Fluxo | null = null;

editarFluxo(fluxo: Fluxo) {
  // Cria uma cópia para edição
  this.fluxoEditando = { ...fluxo };
}

salvarEdicaoFluxo() {
  if (!this.fluxoEditando) return;
  this.fluxoService.atualizarFluxo(this.fluxoEditando.id, this.fluxoEditando).subscribe({
    next: (fluxoAtualizado) => {
      const idx = this.fluxos.findIndex(f => f.id === fluxoAtualizado.id);
      if (idx > -1) this.fluxos[idx] = fluxoAtualizado;
      this.fluxoEditando = null;
      this.success = 'Fluxo atualizado com sucesso!';
      this.error = '';
    },
    error: () => {
      this.error = 'Erro ao atualizar fluxo.';
      this.success = '';
    }
  });
}

cancelarEdicaoFluxo() {
  this.fluxoEditando = null;
}

removerFluxo(fluxo: Fluxo) {
  if (!confirm(`Deseja remover o fluxo "${fluxo.nome}"?`)) return;
  this.fluxoService.removerFluxo(fluxo.id).subscribe({
    next: () => {
      this.fluxos = this.fluxos.filter(f => f.id !== fluxo.id);
      this.success = 'Fluxo removido com sucesso!';
      this.error = '';
    },
    error: () => {
      this.error = 'Erro ao remover fluxo.';
      this.success = '';
    }
  });
}
}