import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientesService } from '../../services/clientes';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css'
})
export class Clientes implements OnInit {

  listaClientes: any[] = [];
  mostrarFormulario = false;
  modoEdicion = false;

  clienteActual: any = {
    nombre: '', apellido: '', cedula: '', direccion: '', telefono: '', email: ''
  };

  constructor(
    private clienteService: ClientesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    this.clienteService.getClientes().subscribe((data: any) => {
      this.listaClientes = data;
      this.cdr.detectChanges();
    });
  }

  nuevo() {
    this.clienteActual = { nombre: '', apellido: '', cedula: '', direccion: '', telefono: '', email: '' };
    this.modoEdicion = false;
    this.mostrarFormulario = true;
  }

  editar(c: any) {
    console.log('cliente:', c); // deja esto un momento para confirmar
    this.clienteActual = { ...c };
    this.modoEdicion = true;
    this.mostrarFormulario = true;
  }

  guardar() {
    if (this.modoEdicion) {
      this.clienteService.actualizarCliente(this.clienteActual.idCliente, this.clienteActual)
        .subscribe(() => { this.cargar(); this.mostrarFormulario = false; });
    } else {
      this.clienteService.crearCliente(this.clienteActual)
        .subscribe(() => { this.cargar(); this.mostrarFormulario = false; });
    }
  }

  eliminar(id: number) {
    if (confirm('¿Eliminar este cliente?')) {
      this.clienteService.eliminarCliente(id).subscribe(() => this.cargar());
    }
  }

  cancelar() { this.mostrarFormulario = false; }
}