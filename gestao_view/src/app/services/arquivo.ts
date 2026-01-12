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
  private apiUrlItem = '/api/arquivos-item/';
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
    return this.http.get<any>(url).pipe(
      map(response => response.results),
      catchError(this.handleError)
    );
  }

  downloadArquivo(arquivoUrl: string, nomeArquivo: string): void {
    // Converte URL absoluta em relativa
    let urlRelativa = arquivoUrl;
    try {
      const url = new URL(arquivoUrl);
      urlRelativa = url.pathname; // Pega apenas /media/itens_arquivos/arquivo.dwg
    } catch {
      // Se já for relativa, mantém como está
    }

    console.log('=== DEBUG DOWNLOAD ===');
    console.log('URL original:', arquivoUrl);
    console.log('URL relativa:', urlRelativa);

    this.http.get(urlRelativa, {
      responseType: 'blob',
      observe: 'response'
    }).subscribe({
      next: (response) => {
        console.log('Status:', response.status);
        console.log('Headers:', response.headers);
        console.log('Content-Type:', response.headers.get('Content-Type'));
        
        const blob = response.body;
        if (!blob) {
          console.error('Blob vazio!');
          alert('Arquivo não encontrado no servidor.');
          return;
        }
        
        console.log('Tamanho do blob:', blob.size, 'bytes');
        console.log('Tipo do blob:', blob.type);
        
        // Se o blob for muito pequeno e for HTML/JSON, é um erro
        if (blob.size < 1000 && (blob.type.includes('text') || blob.type.includes('json') || blob.type.includes('html'))) {
          console.error('Blob parece ser uma mensagem de erro!');
          // Lê o conteúdo do blob para ver o erro
          blob.text().then(text => {
            console.error('Conteúdo do blob:', text);
            alert('Erro do servidor: ' + text.substring(0, 200));
          });
          return;
        }
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = nomeArquivo || 'arquivo';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Erro ao baixar arquivo:', err);
        console.error('Status do erro:', err.status);
        console.error('Mensagem:', err.message);
        alert('Não foi possível baixar o arquivo. Verifique o console para mais detalhes.');
      }
    });
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

  removerArquivoPedido(arquivoId: number): Observable<void> {
    const url = `${this.apiUrlPedido}${arquivoId}/`;
    return this.http.delete<void>(url).pipe(
      catchError(this.handleError)
    );
  }

  removerArquivoItem(arquivoId: number): Observable<void> {
    const url = `${this.apiUrlItem}${arquivoId}/`;
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
      errorMessage = `Erro: ${error.error.message}`;
    } else {
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