import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private API = 'http://localhost:5192/api';
  constructor(private http: HttpClient) {}

  getProductos() {
    return this.http.get(`${this.API}/productos`); 
  }
  getProducto(id: number) { 
    return this.http.get(`${this.API}/productos/${id}`); 
  }
  crearProducto(p: any) { 
    return this.http.post(`${this.API}/productos`, p); 
  }
  actualizarProducto(id: number, p: any) { 
    return this.http.put(`${this.API}/productos/${id}`, p); 
  }
  eliminarProducto(id: number) { 
    return this.http.delete(`${this.API}/productos/${id}`); 
  }
}