import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Fase } from '../interfaces/fase';

@Injectable({
  providedIn: 'root' 
})
export class FaseService {

    private apiUrl = '/api/fases';

    constructor(private http: HttpClient) { }

    getFaseById(id: number): Observable<Fase> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.get<Fase>(url).pipe(
            catchError(this.handleError)
        );
    }

    getFases(): Observable<Fase[]> {
        return this.http.get<Fase[]>(this.apiUrl).pipe(
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