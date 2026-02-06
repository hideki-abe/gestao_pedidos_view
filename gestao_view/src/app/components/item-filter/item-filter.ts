import { Component, EventEmitter, Output, Input, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Vendedor } from '../../interfaces/vendedor';
import { Operador } from '../../interfaces/operador';
import { Cliente } from '../../interfaces/cliente';

export interface FiltrosPedido {
  cliente_nome?: string;        
  operador_nome?: string;   
  material?: string;     
}

@Component({
  selector: 'app-item-filter',
  standalone: true,
  imports: [FormsModule, CommonModule], // Módulos para ngModel e ngFor
  templateUrl: './item-filter.html',
  styleUrl: './item-filter.scss'
})
export class ItemFilter implements OnInit, OnDestroy {

  @Input() operadores: Operador[] = [];

  @Input() clientes: Cliente[] = [];
  
  @Output() filtroChange = new EventEmitter<FiltrosPedido>();

  materiais: string[] = [
    '1,20mm',
    '1,50mm',
    '2,00mm',
    '2,25mm',
    '2,65mm',
    '3,00mm',
    '4,75mm',
    '6,30mm',
    '8,00mm',
    '9,50mm',
    '12,50mm',
    '16,00mm',
    '19,00mm',
    '22,22mm',
    '25,00mm',

  ]

  filtros: FiltrosPedido = {
    material: '',
  };

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
      operador_nome: '',
      material: ''
    };
    this.onFiltroChange();
  }
}