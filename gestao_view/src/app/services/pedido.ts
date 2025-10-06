import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Pedido } from '../interfaces/pedido';
import { PrioridadePedido } from '../components/form-pedido/form-pedido';
import { PaginatedResponse } from '../interfaces/api';

@Injectable({
  providedIn: 'root' 
})
export class PedidoService {

  private apiUrl = '/api/pedidos/';

  constructor(private http: HttpClient) { }

  getPedidos(): Observable<Pedido[]> {
    // 1. Pedimos a resposta como texto para poder inspecioná-la
    return this.http.get(this.apiUrl, { responseType: 'text' }).pipe(
      map(responseText => {
        // 2. Exibimos a resposta bruta no console do navegador
        try {
          // 3. Tentamos converter o texto em JSON
          const responseObject = JSON.parse(responseText);
          return responseObject.results;
        } catch (e) {
          // 4. Se a conversão falhar, lançamos um erro claro
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

  getPedidosPaginated(page: number, pageSize: number, status?: string | string[]): Observable<PaginatedResponse<Pedido>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    // Lógica para adicionar o(s) status ao query params
    if (status) {
      if (Array.isArray(status)) {
        // Se for um array, usa .append() para cada status.
        // Isso cria a URL: ?status=encaminhar&status=aguardando
        status.forEach(s => {
          params = params.append('status', s);
        });
      } else {
        // Se for uma única string, usa .set()
        params = params.set('status', status);
      }
    }

    // Deixa o HttpClient fazer o parse do JSON automaticamente
    return this.http.get<PaginatedResponse<Pedido>>(this.apiUrl, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getPedidoById(id: number): Observable<Pedido> {
    const url = `${this.apiUrl}/${id}`;
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

  // Altera a prioridade, observações do pedido
  updatePedido(pedidoId: number, dados: Partial<{ observacoes: string; prioridade: PrioridadePedido }>): Observable<Pedido> {
    const url = `${this.apiUrl}${pedidoId}/`;
    return this.http.patch<Pedido>(url, dados).pipe(
      catchError(this.handleError)
    );
  }

  // Altera o status do pedido
  updateStatus(pedidoId: number, status: string): Observable<Pedido> {
    const url = `${this.apiUrl}${pedidoId}/`;
    const body = { status: status };

    return this.http.patch<Pedido>(url, body).pipe(
      catchError(this.handleError)
    );
  }

  /*
  createPedido(pedido: Omit<Pedido, 'id' | 'dataCriacao'>): Observable<Pedido> {
    return this.http.post<Pedido>(this.apiUrl, pedido).pipe(
      catchError(this.handleError)
    );
  }

  updatePedido(id: number, pedido: Partial<Pedido>): Observable<Pedido> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<Pedido>(url, pedido).pipe(
      catchError(this.handleError)
    );
  }

  deletePedido(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url).pipe(
      catchError(this.handleError)
    );
  } */

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
