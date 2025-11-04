import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Fluxo } from '../interfaces/fluxo';
import { environment } from '../enviroments/enviroment';

@Injectable({
  providedIn: 'root' 
})
export class FluxoService {

    private apiUrl = environment.apiUrl + '/fluxos/';

    constructor(private http: HttpClient) { }

    criarFluxo(fluxo: Omit<Fluxo, 'id'>): Observable<Fluxo> {
        return this.http.post<Fluxo>(this.apiUrl, fluxo).pipe(
            catchError(this.handleError)
        );
    }

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

    atualizarFluxo(id: number, fluxo: Partial<Fluxo>) {
        return this.http.patch<Fluxo>(`${this.apiUrl}${id}/`, fluxo);
    }

    removerFluxo(id: number) {
        return this.http.delete(`${this.apiUrl}${id}/`);
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