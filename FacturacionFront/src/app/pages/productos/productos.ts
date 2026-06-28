import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductosService } from '../../services/productos';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.html',
  styleUrl: './productos.css'
})
export class Productos implements OnInit {

  listaProductos: any[] = [];
  mostrarFormulario = false;
  modoEdicion = false;

  productoActual: any = {
    nombre: '', descripcion: '', precio_unitario: 0, stock: 0
  };

  constructor(
    private productoService: ProductosService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    this.productoService.getProductos().subscribe((data: any) => {
      this.listaProductos = data;
      this.cdr.detectChanges();
    });
  }

  nuevo() {
    this.productoActual = { nombre: '', descripcion: '', precioUnitario: 0, stock: 0 };
    this.modoEdicion = false;
    this.mostrarFormulario = true;
  }

  editar(p: any) {
    this.productoActual = { ...p };
    this.modoEdicion = true;
    this.mostrarFormulario = true;
  }

  guardar() {
    if (this.modoEdicion) {
      this.productoService.actualizarProducto(this.productoActual.idProducto, this.productoActual)
        .subscribe(() => { this.cargar(); this.mostrarFormulario = false; });
    } else {
      this.productoService.crearProducto(this.productoActual)
        .subscribe(() => { this.cargar(); this.mostrarFormulario = false; });
    }
  }

  eliminar(id: number) {
    if (confirm('¿Eliminar este producto?')) {
      this.productoService.eliminarProducto(id).subscribe(() => this.cargar());
    }
  }

  cancelar() { this.mostrarFormulario = false; }
}