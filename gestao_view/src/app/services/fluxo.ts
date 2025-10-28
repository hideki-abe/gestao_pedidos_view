import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Fluxo } from '../interfaces/fluxo';

@Injectable({
  providedIn: 'root' 
})
export class FluxoService {

    private apiUrl = '/api/fluxos';

    constructor(private http: HttpClient) { }

    getFluxoById(id: number): Observable<Fluxo> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.get<Fluxo>(url).pipe(
            catchError(this.handleError)
        );
    }

    getFluxoByNome(nome: string): Observable<Fluxo> {
        const url = `${this.apiUrl + '/buscar-por-nome'}/?nome=${nome}`;
        return this.http.get<Fluxo>(url).pipe(
            catchError(this.handleError)
        );
    }

    getFluxos(): Observable<Fluxo[]> {
        return this.http.get<Fluxo[]>(this.apiUrl).pipe(
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