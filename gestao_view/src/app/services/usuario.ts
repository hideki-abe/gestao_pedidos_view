import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../app/enviroments/enviroment';

export interface UsuarioPayload {
  nome: string;
  email: string;
  password?: string;
  funcao: string;
  nivel_acesso: number;
  is_active: boolean;
  is_staff: boolean;
}

export interface UsuarioResponse {
  id: number;
  nome: string;
  email: string;
  funcao: string;
  nivel_acesso: number;
  is_active: boolean;
  is_staff: boolean;
  created_at: string;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private apiUrl = environment.apiUrl + '/auth/register/'; 
  private apiUrlGet = environment.apiUrl + '/auth/users/';


  constructor(private http: HttpClient) {}

  cadastrarUsuario(payload: UsuarioPayload): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(this.apiUrl, payload);
  }

  getUsuarios(): Observable<UsuarioResponse[]> {
    return this.http.get<{ results: UsuarioResponse[] }>(this.apiUrlGet)
      .pipe(map(res => res.results));
  }

  editarUsuario(id: number, payload: Partial<UsuarioPayload>): Observable<UsuarioResponse> {
    return this.http.patch<UsuarioResponse>(this.apiUrlGet + id + '/edit', payload);
  }

  deletarUsuario(id: number): Observable<void> {
    const url = `${this.apiUrlGet}${id}/delete`;
    return this.http.delete<void>(url);
  }

  
}