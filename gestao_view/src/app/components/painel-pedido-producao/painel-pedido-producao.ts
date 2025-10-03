import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pedido } from '../../interfaces/pedido';
import { ArquivoService } from '../../services/arquivo';
import { Arquivo } from '../../interfaces/arquivo';

@Component({
  selector: 'app-painel-pedido-producao',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './painel-pedido-producao.html',
  styleUrl: './painel-pedido-producao.scss'
})
export class PainelPedidoProducao implements OnInit {
  // Recebe o objeto Pedido completo do componente pai.
  @Input() pedido!: Pedido;
  arquivos: Arquivo[] = [];

  constructor(private arquivoService: ArquivoService) {}

  ngOnInit(): void {
    this.getArquivosDoPedido();
  }

  abrirArquivo(fileUrl: string): void {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  }

  getArquivosDoPedido(): void {
    if (this.pedido && this.pedido.id) {
      this.arquivoService.getArquivosDoPedido(this.pedido.id).subscribe({
        next: (arquivos) => {
          console.log('Arquivos do pedido:', arquivos);
          this.arquivos = arquivos;
        },
        error: (err) => {
          console.error('Erro ao carregar arquivos do pedido:', err);
        }
      });
    }
  }


}