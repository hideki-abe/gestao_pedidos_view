import { Component, EventEmitter, Output, Input, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Vendedor } from '../../interfaces/vendedor';

export interface FiltrosPedido {
  cliente_nome?: string;  
  numero_pedido?: string;     
  data_inicio?: string;    
  data_fim?: string;      
  prioridade?: string;      
  vendedor_id?: number | string;  
  vendedor_nome?: string;   
  fase?: string;            
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
    vendedor_nome: '',
    fase: ''
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
    this.filtros = {
      cliente_nome: '',
      numero_pedido: '',
      data_inicio: '',
      data_fim: '',
      prioridade: '',
      vendedor_id: '',
      vendedor_nome: '',
      fase: ''
    };
    this.onFiltroChange();
  }
}