import { Component, EventEmitter, Output, Input, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Vendedor } from '../../interfaces/vendedor';

// Define uma interface para a estrutura dos filtros
export interface FiltrosPedido {
  cliente_nome?: string;    // ✅ Alinhado com backend
  numero_pedido?: string;   // ✅ Alinhado com backend  
  data_inicio?: string;     // ✅ Alinhado com backend
  data_fim?: string;        // ✅ Alinhado com backend
  prioridade?: string;      // ✅ Para futuro uso
  vendedor_id?: number | string;  // ✅ Para identificação interna
  vendedor_nome?: string;   // ✅ Alinhado com backend
}

@Component({
  selector: 'app-pedido-filter',
  standalone: true,
  imports: [FormsModule, CommonModule], // Módulos para ngModel e ngFor
  templateUrl: './pedido-filter.html',
  styleUrl: './pedido-filter.scss'
})
export class PedidoFilter implements OnInit, OnDestroy {

  @Input() vendedores: Vendedor[] = [];
  
  @Output() filtroChange = new EventEmitter<FiltrosPedido>();

  secoes: string[] = 
  [
    'Guilhotina', 
    'Dobra',
    'Laser',
    'Fogo',
    'Calandra',
    'Serra'
  ];

  filtros: FiltrosPedido = {
    cliente_nome: '',
    numero_pedido: '',
    data_inicio: '',
    data_fim: '',
    prioridade: '',
    vendedor_id: '',
    vendedor_nome: ''
  };

  // Subject para controlar o debounce e evitar emissões excessivas
  private filtroSubject = new Subject<void>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
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

  onFiltroChange(): void {
    this.filtroSubject.next();
  }
  limparFiltros(): void {
    console.log('🧹 Limpando todos os filtros');
    this.filtros = {
      cliente_nome: '',
      numero_pedido: '',
      data_inicio: '',
      data_fim: '',
      prioridade: '',
      vendedor_id: '',
      vendedor_nome: ''
    };
    this.onFiltroChange();
  }
}