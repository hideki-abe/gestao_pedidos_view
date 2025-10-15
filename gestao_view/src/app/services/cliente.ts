import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Cliente } from '../interfaces/cliente';

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface CreateClienteRequest {
  nome: string;
  documento: string;
  contato?: string;
}

@Injectable({
  providedIn: 'root' 
})
export class ClienteService {

    private apiUrl = '/api/clientes';

    constructor(private http: HttpClient) { }

    getClienteById(id: number): Observable<Cliente> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.get<Cliente>(url).pipe(
            catchError(this.handleError)
        );
    }

    getClientes(): Observable<Cliente[]> {
        // 1. Defina o tipo de retorno esperado como a resposta paginada
        return this.http.get<PaginatedResponse<Cliente>>(this.apiUrl).pipe(
            // 2. Use o operador 'map' para extrair e retornar apenas o array 'results'
            map(response => response.results),
            catchError(this.handleError)
        );
    }

    addCliente(cliente: CreateClienteRequest): Observable<Cliente> {
        // IMPORTANTE: O retorno deve ser Observable<Cliente>, não Partial<Cliente>
        return this.http.post<Cliente>(this.apiUrl + '/', cliente).pipe(
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