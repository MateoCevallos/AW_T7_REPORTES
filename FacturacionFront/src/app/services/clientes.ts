import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {

  private API = 'http://localhost:5192/api';

  constructor(private http: HttpClient) {}

  getClientes() {
    return this.http.get(`${this.API}/clientes`);
  }

  getCliente(id: number) {
    return this.http.get(`${this.API}/clientes/${id}`);
  }

  crearCliente(cliente: any) {
    return this.http.post(`${this.API}/clientes`, cliente);
  }

  actualizarCliente(id: number, cliente: any) {
    return this.http.put(`${this.API}/clientes/${id}`, cliente);
  }

  eliminarCliente(id: number) {
    return this.http.delete(`${this.API}/clientes/${id}`);
  }
}