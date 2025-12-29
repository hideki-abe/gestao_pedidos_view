import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Item } from '../interfaces/item';
import { Arquivo } from '../interfaces/arquivo';

@Injectable({
  providedIn: 'root' 
})
export class ArquivoService {

  private apiUrlPedido = '/api/arquivos-pedido/';
  private apiUrlItens = '/api/itens/';

  constructor(private http: HttpClient) { }

  getArquivos(): Observable<ArquivoService[]> {
    return this.http.get(this.apiUrlPedido, { responseType: 'text' }).pipe(
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

  getArquivosDoPedido(pedidoId: number): Observable<Arquivo[]> {
    const url = `${this.apiUrlPedido}?pedido_id=${pedidoId}`;
    //console.log('URL chamada:', url);
    return this.http.get<any>(url).pipe(
      map(response => response.results), // Corrige para pegar só os arquivos
      catchError(this.handleError)
    );
  }

  uploadArquivoDoPedido(pedidoId: number, file: File): Observable<any> {
  const formData = new FormData();
  formData.append('file', file, file.name);
  formData.append('pedido', pedidoId.toString());

    return this.http.post(this.apiUrlPedido, formData, {
    reportProgress: true,
    observe: 'events'
  }).pipe(
    catchError(this.handleError)
  );
  }

  removerArquivo(arquivoId: number): Observable<void> {
    const url = `${this.apiUrlPedido}${arquivoId}/`;
    return this.http.delete<void>(url).pipe(
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

  getArquivosDoItem(itemId: number): Observable<Arquivo[]> {
  const url = `/api/arquivos-item/?item_id=${itemId}`;
  return this.http.get<any>(url).pipe(
    map(response => response.results || response),
    catchError(this.handleError)
  );
}

uploadArquivoDoItem(itemId: number, file: File): Observable<any> {
  const formData = new FormData();
  formData.append('file', file, file.name);
  formData.append('item', itemId.toString());

  return this.http.post('/api/arquivos-item/', formData, {
    reportProgress: true,
    observe: 'events'
  }).pipe(
    catchError(this.handleError)
  );
}


}