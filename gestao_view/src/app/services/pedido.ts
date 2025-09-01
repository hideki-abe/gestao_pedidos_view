import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Pedido } from '../interfaces/pedido';

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




/* 
  getPedidoById(id: number): Observable<Pedido> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Pedido>(url).pipe(
      catchError(this.handleError)
    );
  }

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
