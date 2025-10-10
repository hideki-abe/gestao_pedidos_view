import { Component, EventEmitter, Output, Input, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Vendedor } from '../../interfaces/vendedor';

// Define uma interface para a estrutura dos filtros
export interface FiltrosPedido {
  nomeCliente?: string | null;
  vendedorNome?: string | null;
  numeroPedido?: string | null;
  dataPedido?: string | null;
}

@Component({
  selector: 'app-pedido-filter',
  standalone: true,
  imports: [FormsModule, CommonModule], // Módulos para ngModel e ngFor
  templateUrl: './pedido-filter.html',
  styleUrl: './pedido-filter.scss'
})
export class PedidoFilter implements OnInit, OnDestroy {
  // Recebe a lista de vendedores do componente pai
  @Input() vendedores: Vendedor[] = [];
  // Emite um evento com os filtros sempre que houver uma mudança
  @Output() filtroChange = new EventEmitter<FiltrosPedido>();

  // Objeto para armazenar os valores atuais dos filtros
  filtros: FiltrosPedido = {
    nomeCliente: null,
    vendedorNome: null,
    numeroPedido: null,
    dataPedido: null
  };

  // Subject para controlar o debounce e evitar emissões excessivas
  private filtroSubject = new Subject<void>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Escuta as mudanças com um debounce de 300ms
    this.filtroSubject.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.filtroChange.emit(this.filtros);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Chamado sempre que um filtro é alterado no template
  onFiltroChange(): void {
    this.filtroSubject.next();
  }

  // Limpa todos os filtros e emite a mudança
  limparFiltros(): void {
    this.filtros = {
      nomeCliente: null,
      vendedorNome: null,
      numeroPedido: null,
      dataPedido: null
    };
    this.onFiltroChange();
  }
}