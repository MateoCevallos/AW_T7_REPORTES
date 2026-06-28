import { Clientes } from './pages/clientes/clientes';
import { Productos } from './pages/productos/productos';
import { Facturas } from './pages/facturas/facturas';
import { CrearFactura } from './pages/crear-factura/crear-factura';
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'clientes', pathMatch: 'full' },

  { path: 'clientes', component: Clientes },
  { path: 'productos', component: Productos },
  { path: 'facturas', component: Facturas },
  { path: 'crear-factura', component: CrearFactura }
];