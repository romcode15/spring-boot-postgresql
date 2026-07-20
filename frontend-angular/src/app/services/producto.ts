import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Producto, PaginaResponse } from '../models/producto';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private apiUrl = 'http://localhost:8081/api/productos';

  constructor(private http: HttpClient) {}

  private crearHeaders(usuario: string, clave: string): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Basic ${btoa(`${usuario}:${clave}`)}`
    });
  }

  listar(usuario: string, clave: string, nombre: string, page: number, size: number): Observable<PaginaResponse<Producto>> {
    const headers = this.crearHeaders(usuario, clave);
    let params = new HttpParams().set('page', page).set('size', size);
    if (nombre.trim()) params = params.set('nombre', nombre.trim());
    return this.http.get<PaginaResponse<Producto>>(this.apiUrl, { headers, params });
  }

  crear(producto: Producto, usuario: string, clave: string): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, producto, { headers: this.crearHeaders(usuario, clave) });
  }

  actualizar(id: number, producto: Producto, usuario: string, clave: string): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, producto, { headers: this.crearHeaders(usuario, clave) });
  }

  eliminar(id: number, usuario: string, clave: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.crearHeaders(usuario, clave) });
  }
}