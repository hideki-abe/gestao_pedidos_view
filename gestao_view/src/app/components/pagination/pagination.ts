import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true, // Componente standalone
  imports: [CommonModule], // Importa o CommonModule para usar *ngFor, *ngIf, etc.
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss'
})
export class Pagination implements OnChanges {

  @Input() paginaAtual: number = 1;
  @Input() totalDeItens: number = 0;
  @Input() itensPorPagina: number = 10;
  @Input() paginasVizinhas: number = 2;

  @Output() pageChange = new EventEmitter<number>();

  public listaDePaginas: (number | string)[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    // Recalcula a paginação sempre que um dos @Inputs mudar
    if (changes['totalDeItens'] || changes['paginaAtual'] || changes['itensPorPagina']) {
      this.atualizarListaDePaginas();
    }
  }

  private atualizarListaDePaginas(): void {
    const totalPages = this.getTotalPages();
    this.listaDePaginas = this.gerarListaDePaginas(this.paginaAtual, totalPages);
  }  

  getTotalPages(): number {
    return Math.ceil(this.totalDeItens / this.itensPorPagina);
  }

private gerarListaDePaginas(currentPage: number, totalPages: number): (number | string)[] {
    if (totalPages <= (this.paginasVizinhas * 2) + 3) {
      // Se o total de páginas for pequeno, mostra todos os números
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    const rangeStart = Math.max(2, currentPage - this.paginasVizinhas);
    const rangeEnd = Math.min(totalPages - 1, currentPage + this.paginasVizinhas);

    // Adiciona a primeira página
    pages.push(1);

    // Adiciona '...' se necessário no início
    if (rangeStart > 2) {
      pages.push('...');
    }

    // Adiciona as páginas do meio
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }

    // Adiciona '...' se necessário no final
    if (rangeEnd < totalPages - 1) {
      pages.push('...');
    }

    // Adiciona a última página
    pages.push(totalPages);

    return pages;
  }

  mudarPagina(page: number): void {
    if (page >= 1 && page <= this.getTotalPages() && page !== this.paginaAtual) {
      this.pageChange.emit(page);
    }
  }

  paginaAnterior(): void {
    this.mudarPagina(this.paginaAtual - 1);
  }

  proximaPagina(): void {
    this.mudarPagina(this.paginaAtual + 1);
  }

}
