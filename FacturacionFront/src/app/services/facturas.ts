import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FacturasService {
  private API = 'http://localhost:5192/api';
  constructor(private http: HttpClient) {}

  getFacturas() { 
    return this.http.get(`${this.API}/facturas`); 
  }
  createFactura(data: any) { 
    return this.http.post(`${this.API}/facturas`, data); 
  }
  guardarFactura(data: any) { 
    return this.http.post(`${this.API}/facturas`, data); 
  }
  eliminarFactura(id: number) { 
    return this.http.delete(`${this.API}/facturas/${id}`); 
  }
  actualizarEstado(id: number, factura: any) { 
    return this.http.put(`${this.API}/facturas/${id}`, factura); 
  }
}