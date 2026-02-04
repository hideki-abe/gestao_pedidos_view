import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Vendedor } from '../interfaces/vendedor';
import { PaginatedResponse } from '../interfaces/api';
import { Operador } from '../interfaces/operador';

@Injectable({
  providedIn: 'root' 
})
export class OperadorService {

  private apiUrl = '/api/auth/users';

  constructor(private http: HttpClient) { }

  getOperadorById(id: number): Observable<Operador> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.get<Operador>(url).pipe(
            catchError(this.handleError)
        );
    }

  getOperadores(): Observable<Operador[]> {
    return this.http.get<{ results: Operador[] }>(this.apiUrl + '/operadores').pipe(
      map(response => response.results)
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