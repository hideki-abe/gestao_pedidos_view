import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, expand, reduce } from 'rxjs/operators';
import { PaginatedResponse } from '../interfaces/api';
import { Item } from '../interfaces/item';
import { Tipo } from '../interfaces/tipo';
import { CreateItemRequest } from '../interfaces/create-item-request';


@Injectable({
  providedIn: 'root' 
})
export class ItemService {

  private apiUrl = '/api/pedidos/';
  private apiUrlItens = '/api/itens/';

  constructor(private http: HttpClient) { }

  getItens(): Observable<Item[]> {
    const params = new HttpParams().set('status', 'producao').set('page_size', '100');
    return this.http.get<PaginatedResponse<Item>>(this.apiUrlItens, { params }).pipe(
      expand(response => response.next 
        ? this.http.get<PaginatedResponse<Item>>(response.next) 
        : of()
      ),
      reduce((acc: Item[], response) => acc.concat(response.results), []),
      catchError(this.handleError)
    );
  }

  getItensPorStatus(status: string): Observable<Item[]> {
    const params = new HttpParams().set('status', 'producao').set('page_size', '50');
    return this.http.get(this.apiUrlItens + '?status=' + status, {params, responseType: 'text' }).pipe(
      map(responseText => {
        try {
          const responseObject = JSON.parse(responseText);
          console.log('Resposta da API de itens:', responseObject);
          return responseObject.results;
        } catch (e) {
          console.error('Falha ao converter a resposta para JSON.', e);
          throw new Error('A resposta da API não é um JSON válido.');
        }
      }),
      catchError(this.handleError)
    );
  }

  getItensDoPedido(pedidoId: number): Observable<Item[]> {
    const url = `${this.apiUrl}${pedidoId}/itens/`;

    return this.http.get<Item[]>(url).pipe(
      catchError(this.handleError)
    );  
  }

  getTipos(): Observable<Tipo[]> {
    const url = `${this.apiUrlItens}tipos_choices/`;

    return this.http.get<Tipo[]>(url).pipe(
      catchError(this.handleError)
    );  
  }

  atualizarFluxoDoItem(itemId: number, fluxoId: number): Observable<Item> {
    console.log("Chamando função para atualizar o fluxo", itemId, fluxoId);
    // 1. Define a URL específica para o item que será atualizado.
    const url = `${this.apiUrlItens}${itemId}/`;

    // 2. Cria o corpo da requisição (payload) apenas com o dado que será alterado.
    const payload = { fluxo: fluxoId };

    // 3. Executa a requisição PATCH.
    //    - O <Item> indica que esperamos receber o objeto Item completo e atualizado como resposta.
    return this.http.patch<Item>(url, payload).pipe(
      catchError(this.handleError)
    );
  }

  updateItem(itemId: number, dados: Partial<Item>): Observable<Item> {
    const url = `${this.apiUrlItens}${itemId}/`;
    return this.http.patch<Item>(url, dados);
  }

  
  createItem(item: CreateItemRequest): Observable<any> {
    console.log('=== CREATEITEM ===');
    console.log('Item recebido:', item);
    console.log('pedido_id presente?', !!item.pedido_id);
    
    // ✅ VALIDAÇÃO: Se não tem pedido_id, é erro
    if (!item.pedido_id) {
      console.error('❌ ERRO: pedido_id não fornecido no item:', item);
      return throwError(() => new Error('pedido_id é obrigatório para criar item'));
    }
    
    // ✅ SEMPRE use o novo endpoint
    console.log('✅ Usando novo endpoint do pedido');
    const itemSemPedidoId = { ...item };
    delete itemSemPedidoId.pedido_id;
    
    return this.createItemParaPedido(item.pedido_id, itemSemPedidoId);
  }
  
  createItens(itens: CreateItemRequest[]): Observable<any> {
    const url = `${this.apiUrlItens}bulk/`;
    return this.http.post<any>(url, { itens }).pipe(
      catchError(this.handleError)
    );
  }
  
  createItemParaPedido(pedidoId: number, item: Omit<CreateItemRequest, 'pedido_id'>): Observable<any> {
    const url = `${this.apiUrl}${pedidoId}/criar_item/`;
    
    console.log('=== CRIANDO ITEM VIA ENDPOINT DO PEDIDO ===');
    console.log('URL:', url);
    console.log('Pedido ID:', pedidoId);
    console.log('Dados do item:', item);
    
    return this.http.post<any>(url, item).pipe(
      catchError(this.handleError)
    );
  }
  
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocorreu um erro desconhecido!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      errorMessage = `Código do erro: ${error.status}, mensagem: ${error.message}`;
      
      // ✅ Log mais detalhado para debug
      console.error('Detalhes do erro:', {
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        error: error.error
      });
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}