import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ClientesService } from '../../services/clientes';
import { ProductosService } from '../../services/productos';
import { FacturasService } from '../../services/facturas';

import * as pdfMakeModule from 'pdfmake/build/pdfmake';
import * as vfsFontsModule from 'pdfmake/build/vfs_fonts';

const pdfMake: any = (pdfMakeModule as any).default ?? pdfMakeModule;
const vfsFonts: any = (vfsFontsModule as any).default ?? vfsFontsModule;

pdfMake.addVirtualFileSystem(vfsFonts);

@Component({
  selector: 'app-crear-factura',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-factura.html',
  styleUrl: './crear-factura.css'
})
export class CrearFactura implements OnInit {

  clientes: any[] = [];
  productos: any[] = [];

  factura = {
    idCliente: 0,
    detalleFacturas: [] as any[]
  };

  productoSeleccionado = {
    idProducto: 0,
    cantidad: 1
  };

  constructor(
    private clienteService: ClientesService,
    private productoService: ProductosService,
    private facturaService: FacturasService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarClientes();
    this.cargarProductos();
  }

  cargarClientes() {
    this.clienteService.getClientes().subscribe((data: any) => {
      this.clientes = data;
      this.cdr.detectChanges();
    });
  }

  cargarProductos() {
    this.productoService.getProductos().subscribe((data: any) => {
      this.productos = data;
      this.cdr.detectChanges();
    });
  }

  agregarProducto() {
    const producto = this.productos.find(
      p => p.idProducto == this.productoSeleccionado.idProducto
    );

    if (!producto) return;

    const detalle = {
      idProducto: producto.idProducto,
      nombre: producto.nombre,
      cantidad: this.productoSeleccionado.cantidad,
      precioUnitario: producto.precioUnitario,
      subtotal: this.productoSeleccionado.cantidad * producto.precioUnitario
    };

    this.factura.detalleFacturas.push(detalle);
    this.productoSeleccionado = { idProducto: 0, cantidad: 1 };
  }

  eliminarProducto(index: number) {
    this.factura.detalleFacturas.splice(index, 1);
  }

  guardarFactura() {
    const payload = {
      idCliente: this.factura.idCliente,
      detalleFacturas: this.factura.detalleFacturas.map(d => ({
        idProducto: d.idProducto,
        cantidad: d.cantidad,
        precioUnitario: d.precioUnitario
      }))
    };

    this.facturaService.guardarFactura(payload).subscribe({
      next: () => {
        alert('Factura guardada correctamente');
        this.factura = { idCliente: 0, detalleFacturas: [] };
      },
      error: (err) => {
        console.error(err);
        alert('Error al guardar factura');
      }
    });
  }

  getSubtotal() {
    return this.factura.detalleFacturas.reduce((sum, item) => sum + item.subtotal, 0);
  }

  getIVA() {
    return this.getSubtotal() * 0.15;
  }

  getTotal() {
    return this.getSubtotal() + this.getIVA();
  }

  generarPDF() {
    // Buscar nombre del cliente
    const clienteObj = this.clientes.find(c => c.idCliente == this.factura.idCliente);
    const nombreCliente = clienteObj ? `${clienteObj.nombre} ${clienteObj.apellido}` : 'Sin cliente';

    const body: any[] = [
      [
        { text: 'Producto', style: 'tableHeader' },
        { text: 'Cantidad', style: 'tableHeader' },
        { text: 'Precio Unitario', style: 'tableHeader' },
        { text: 'Subtotal', style: 'tableHeader' }
      ]
    ];

    this.factura.detalleFacturas.forEach(d => {
      body.push([
        d.nombre,
        d.cantidad.toString(),
        `$${d.precioUnitario.toFixed(2)}`,
        `$${d.subtotal.toFixed(2)}`
      ]);
    });

    const docDefinition: any = {
      content: [
        // ENCABEZADO
        {
          columns: [
            {
              text: 'Sistema de Facturación',
              style: 'titulo',
              width: '*'
            },
            {
              text: new Date().toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric' }),
              alignment: 'right',
              color: '#8e1f3a',
              fontSize: 11,
              margin: [0, 8, 0, 0]
            }
          ]
        },
        {
          canvas: [{ type: 'line', x1: 0, y1: 4, x2: 515, y2: 4, lineWidth: 2, lineColor: '#5b1d6e' }]
        },
        { text: '\n' },

        // DATOS CLIENTE
        {
          table: {
            widths: ['*'],
            body: [[
              {
                text: `Cliente: ${nombreCliente}`,
                fillColor: '#f4f1f8',
                color: '#4a1559',
                fontSize: 12,
                bold: true,
                margin: [10, 8, 10, 8],
                border: [false, false, false, false]
              }
            ]]
          },
          margin: [0, 0, 0, 16]
        },

        // TABLA PRODUCTOS
        { text: 'Detalle de Productos', style: 'seccion' },
        {
          table: {
            widths: ['*', 'auto', 'auto', 'auto'],
            body: body
          },
          layout: {
            fillColor: (rowIndex: number) => rowIndex === 0 ? null : (rowIndex % 2 === 0 ? '#faf5fb' : null),
            hLineColor: () => '#e1d4ea',
            vLineColor: () => '#e1d4ea'
          }
        },

        // TOTALES
        { text: '\n' },
        {
          canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#e1d4ea' }]
        },
        {
          columns: [
            { text: '', width: '*' },
            {
              width: 200,
              table: {
                widths: ['*', 'auto'],
                body: [
                  [
                    { text: 'Subtotal:', color: '#444', fontSize: 12, border: [false, false, false, false] },
                    { text: `$${this.getSubtotal().toFixed(2)}`, alignment: 'right', color: '#444', fontSize: 12, border: [false, false, false, false] }
                  ],
                  [
                    { text: 'IVA (15%):', color: '#444', fontSize: 12, border: [false, false, false, false] },
                    { text: `$${this.getIVA().toFixed(2)}`, alignment: 'right', color: '#444', fontSize: 12, border: [false, false, false, false] }
                  ],
                  [
                    { text: 'TOTAL:', bold: true, fontSize: 15, color: '#5b1d6e', fillColor: '#f4f1f8', border: [false, true, false, false], margin: [0, 6, 0, 0] },
                    { text: `$${this.getTotal().toFixed(2)}`, bold: true, fontSize: 15, color: '#5b1d6e', fillColor: '#f4f1f8', alignment: 'right', border: [false, true, false, false], margin: [0, 6, 0, 0] }
                  ]
                ]
              }
            }
          ],
          margin: [0, 12, 0, 0]
        }
      ],

      footer: (currentPage: number, pageCount: number) => ({
        columns: [
          { text: 'Sistema de Facturación', color: '#8e1f3a', fontSize: 9, margin: [40, 0, 0, 0] },
          { text: `Página ${currentPage} de ${pageCount}`, alignment: 'right', color: '#999', fontSize: 9, margin: [0, 0, 40, 0] }
        ]
      }),

      styles: {
        titulo: {
          fontSize: 22,
          bold: true,
          color: '#5b1d6e'
        },
        seccion: {
          fontSize: 13,
          bold: true,
          color: '#8e1f3a',
          margin: [0, 0, 0, 8]
        },
        tableHeader: {
          bold: true,
          color: 'white',
          fillColor: '#5b1d6e',
          fontSize: 12
        }
      },

      defaultStyle: {
        font: 'Roboto',
        fontSize: 11,
        color: '#333'
      }
    };

    pdfMake.createPdf(docDefinition).open();
  }
}