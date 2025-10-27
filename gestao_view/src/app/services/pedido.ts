import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Pedido } from '../interfaces/pedido';
import { PrioridadePedido } from '../components/form-pedido/form-pedido';
import { PaginatedResponse } from '../interfaces/api';
import { FiltrosPedido } from '../components/pedido-filter/pedido-filter';
import { CreatePedidoRequest } from '../interfaces/create-pedido-request';

@Injectable({
  providedIn: 'root' 
})
export class PedidoService {

  private apiUrl = '/api/pedidos/';

  constructor(private http: HttpClient) { }

  getPedidos(): Observable<Pedido[]> {
    return this.http.get(this.apiUrl, { responseType: 'text' }).pipe(
      map(responseText => {
        try {
          const responseObject = JSON.parse(responseText);
          return responseObject.results;
        } catch (e) {
          console.error('Falha ao converter a resposta para JSON.', e);
          throw new Error('A resposta da API não é um JSON válido.');
        }
      }),
      catchError(this.handleError)
    );
  }

  getPedidosEmProducao(): Observable<Pedido[]> {
    return this.http.get(this.apiUrl + '?status=producao', { responseType: 'text' }).pipe(
      map(responseText => {
        try {
          const responseObject = JSON.parse(responseText);
          return responseObject.results;
        } catch (e) {
          console.error('Falha ao converter a resposta para JSON.', e);
          throw new Error('A resposta da API não é um JSON válido.');
        }
      }),
      catchError(this.handleError)
    );
  }

  getPedidosPendentes(): Observable<Pedido[]> {
    return this.http.get(this.apiUrl + '?status=encaminhar&status=aguardando', { responseType: 'text' }).pipe(
      map(responseText => {
        try {
          const responseObject = JSON.parse(responseText);
          return responseObject.results;
        } catch (e) {
          console.error('Falha ao converter a resposta para JSON.', e);
          throw new Error('A resposta da API não é um JSON válido.');
        }
      }),
      catchError(this.handleError)
    );
  }

  getPedidoByNumero(numero: string): Observable<Pedido[]> {
    return this.http.get(this.apiUrl + '?numero_pedido=' + numero, { responseType: 'text' }).pipe(
      map(responseText => {
        try {
          const responseObject = JSON.parse(responseText);
          return responseObject.results;
        } catch (e) {
          console.error('Falha ao converter a resposta para JSON.', e);
          throw new Error('A resposta da API não é um JSON válido.');
        }
      }),
      catchError(this.handleError)
    );
  }

  getPedidosPaginated(
    page: number, 
    pageSize: number, 
    status?: string | string[],
    filtros: FiltrosPedido = {}
  ): Observable<PaginatedResponse<Pedido>> {
    
    let params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    // Adiciona status, se houver
    if (status) {
      if (Array.isArray(status)) {
        status.forEach(s => { params = params.append('status', s); });
      } else {
        params = params.set('status', status);
      }
    }

    if (filtros.numero_pedido) {
      console.log('🔧 Adicionando filtro numero_pedido:', filtros.numero_pedido);
      params = params.append('numero_pedido', filtros.numero_pedido);
    }

    if (filtros.fase) {
      console.log('🔧 Adicionando filtro fase:', filtros.fase);
      params = params.append('fase', filtros.fase);
    }
    
    if (filtros.cliente_nome) {
      console.log('🔧 Adicionando filtro cliente_nome:', filtros.cliente_nome);
      params = params.append('cliente_nome', filtros.cliente_nome);
    }
    
    if (filtros.vendedor_nome) {
      console.log('🔧 Adicionando filtro vendedor_nome:', filtros.vendedor_nome);
      params = params.append('vendedor_nome', filtros.vendedor_nome);
    }
    
    if (filtros.data_inicio) {
      console.log('🔧 Adicionando filtro data_inicio:', filtros.data_inicio);
      params = params.append('data_inicio', filtros.data_inicio);
    }
    
    if (filtros.data_fim) {
      console.log('🔧 Adicionando filtro data_fim:', filtros.data_fim);
      params = params.append('data_fim', filtros.data_fim);
    }
    
    if (filtros.prioridade) {
      console.log('🔧 Adicionando filtro prioridade:', filtros.prioridade);
      params = params.append('prioridade', filtros.prioridade);
    }

    // A chamada GET agora é limpa e padronizada
    return this.http.get<PaginatedResponse<Pedido>>(this.apiUrl, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getPedidoById(id: number): Observable<Pedido> {
    const url = `${this.apiUrl}${id}`;
    return this.http.get<Pedido>(url).pipe(
      catchError(this.handleError)
    );
  }

  updateObservacao(pedidoId: number, observacao: string): Observable<Pedido> {
    const url = `${this.apiUrl}${pedidoId}/`;
    const body = { observacao: observacao };
    return this.http.patch<Pedido>(url, body).pipe(
      catchError(this.handleError)
    );
  } 

  updatePedido(pedidoId: number, dados: Partial<{ observacoes: string; prioridade: PrioridadePedido }>): Observable<Pedido> {
    const url = `${this.apiUrl}${pedidoId}/`;
    return this.http.patch<Pedido>(url, dados).pipe(
      catchError(this.handleError)
    );
  }

  updateStatus(pedidoId: number, status: string): Observable<Pedido> {
    const url = `${this.apiUrl}${pedidoId}/`;
    const body = { status: status };

    return this.http.patch<Pedido>(url, body).pipe(
      catchError(this.handleError)
    );
  }

  createPedido(pedido: CreatePedidoRequest): Observable<Pedido> {
    return this.http.post<Pedido>(this.apiUrl, pedido).pipe(
      catchError(this.handleError)
    );
  }


 /*
  updatePedido(id: number, pedido: Partial<Pedido>): Observable<Pedido> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<Pedido>(url, pedido).pipe(
      catchError(this.handleError)
    );
  }

  */
  deletePedido(id: number): Observable<void> {
    const url = `${this.apiUrl}${id}/`;
    return this.http.delete<void>(url).pipe(
      catchError(this.handleError)
    );
  } 

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocorreu um erro desconhecido!';
    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // O backend retornou um código de erro
      errorMessage = `Código do erro: ${error.status}, ` + `mensagem: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
