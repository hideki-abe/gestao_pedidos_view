import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Fluxo } from '../../interfaces/fluxo';
import { FluxoService } from '../../services/fluxo';

interface NovaFase {
  nome: string;
  ordem: number;
}

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

  fases: NovaFase[] = [];

  fluxos: Fluxo[] = [];
  error: string = '';
  success: string = '';

  fluxoEditando: Fluxo | null = null;

  constructor(private fluxoService: FluxoService) {}

  ngOnInit() {
    this.carregarFluxos();
  }

  adicionarFase() {
    this.fases.push({ nome: '', ordem: this.fases.length + 1 });
  }

  removerFase(index: number) {
    this.fases.splice(index, 1);
    this.fases.forEach((fase, idx) => fase.ordem = idx + 1);
  }

  formularioValido(): boolean {
    return !!(
      this.nome &&
      this.descricao &&
      this.fases.length > 0 &&
      this.fases.every(f => f.nome.trim())
    );
  }

  salvarFluxo(): void {
    if (!this.formularioValido()) {
      this.error = 'Preencha todos os campos obrigatórios e adicione pelo menos uma fase.';
      return;
    }
    
    const novoFluxo: any = {
      nome: this.nome.trim(),
      descricao: this.descricao.trim(),
      fases: this.fases.map(f => ({ nome: f.nome.trim(), ordem: f.ordem})),
    };

    console.log("Criando novo Fluxo: ", novoFluxo);

    this.fluxoService.criarFluxoComFases(novoFluxo).subscribe({
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
    this.fases = [];
  }

  editarFluxo(fluxo: Fluxo) {
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