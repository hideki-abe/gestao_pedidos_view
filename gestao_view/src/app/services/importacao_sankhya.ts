// src/app/services/importacao.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImportacaoService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  triggerImportacao(): Observable<any> {
    return this.http.post(`${this.apiUrl}/trigger-importacao/`, {});
  }

  importarUnicoPedido(nunota: String): Observable<any> {
    return this.http.post(`${this.apiUrl}/importar-pedido-sankhya/`, { 
      nunota: nunota 
    });
  }

}