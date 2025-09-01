import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Vendedor } from '../interfaces/vendedor';

@Injectable({
  providedIn: 'root' 
})
export class VendedorService {

  private apiUrl = '/accounts/users';

  constructor(private http: HttpClient) { }

   getVendedorById(id: number): Observable<Vendedor> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.get<Vendedor>(url).pipe(
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