import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FacturasService } from '../../services/facturas';

import * as pdfMakeModule from 'pdfmake/build/pdfmake';
import * as vfsFontsModule from 'pdfmake/build/vfs_fonts';

const pdfMake: any = (pdfMakeModule as any).default ?? pdfMakeModule;
const vfsFonts: any = (vfsFontsModule as any).default ?? vfsFontsModule;
pdfMake.addVirtualFileSystem(vfsFonts);

@Component({
  selector: 'app-facturas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './facturas.html',
  styleUrl: './facturas.css'
})
export class Facturas implements OnInit {

  listaFacturas: any[] = [];
  facturaSeleccionada: any = null;

  constructor(
    private facturaService: FacturasService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    this.facturaService.getFacturas().subscribe((data: any) => {
      this.listaFacturas = data;
      this.cdr.detectChanges();
    });
  }

  verDetalle(f: any) {
    this.facturaSeleccionada = this.facturaSeleccionada?.idFactura === f.idFactura ? null : f;
  }

  cambiarEstado(f: any, estado: string) {
    const actualizada = { ...f, estado: estado, cliente: undefined, detalleFacturas: undefined };
    this.facturaService.actualizarEstado(f.idFactura, actualizada).subscribe(() => {
      f.estado = estado;
      if (this.facturaSeleccionada?.idFactura === f.idFactura) {
        this.facturaSeleccionada.estado = estado;
      }
      this.cdr.detectChanges();
    });
  }

  eliminar(id: number) {
    if (confirm('¿Eliminar esta factura?')) {
      this.facturaService.eliminarFactura(id).subscribe(() => {
        if (this.facturaSeleccionada?.idFactura === id) this.facturaSeleccionada = null;
        this.cargar();
      });
    }
  }

  imprimirFactura(f: any) {
    const nombreCliente = f.cliente ? `${f.cliente.nombre} ${f.cliente.apellido}` : 'Sin cliente';

    const body: any[] = [
      [
        { text: 'Producto', style: 'tableHeader' },
        { text: 'Cantidad', style: 'tableHeader' },
        { text: 'Precio Unitario', style: 'tableHeader' },
        { text: 'Subtotal', style: 'tableHeader' }
      ]
    ];

    f.detalleFacturas.forEach((d: any) => {
      body.push([
        d.producto?.nombre ?? '',
        d.cantidad.toString(),
        `$${d.precioUnitario.toFixed(2)}`,
        `$${d.subtotalLinea.toFixed(2)}`
      ]);
    });

    const docDefinition: any = {
      content: [
        {
          columns: [
            { text: 'Sistema de Facturación', style: 'titulo', width: '*' },
            {
              text: new Date(f.fecha).toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric' }),
              alignment: 'right', color: '#8e1f3a', fontSize: 11, margin: [0, 8, 0, 0]
            }
          ]
        },
        { canvas: [{ type: 'line', x1: 0, y1: 4, x2: 515, y2: 4, lineWidth: 2, lineColor: '#5b1d6e' }] },
        { text: '\n' },
        {
          table: {
            widths: ['*'],
            body: [[
              {
                text: `Cliente: ${nombreCliente}`,
                fillColor: '#f4f1f8', color: '#4a1559', fontSize: 12, bold: true,
                margin: [10, 8, 10, 8], border: [false, false, false, false]
              }
            ]]
          },
          margin: [0, 0, 0, 8]
        },
        {
          table: {
            widths: ['*'],
            body: [[
              {
                text: `N° Factura: ${f.numeroFactura}`,
                fillColor: '#f4f1f8', color: '#8e1f3a', fontSize: 11,
                margin: [10, 6, 10, 6], border: [false, false, false, false]
              }
            ]]
          },
          margin: [0, 0, 0, 16]
        },
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
        { text: '\n' },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#e1d4ea' }] },
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
                    { text: `$${f.subtotal.toFixed(2)}`, alignment: 'right', color: '#444', fontSize: 12, border: [false, false, false, false] }
                  ],
                  [
                    { text: 'IVA (15%):', color: '#444', fontSize: 12, border: [false, false, false, false] },
                    { text: `$${f.iva.toFixed(2)}`, alignment: 'right', color: '#444', fontSize: 12, border: [false, false, false, false] }
                  ],
                  [
                    { text: 'TOTAL:', bold: true, fontSize: 15, color: '#5b1d6e', fillColor: '#f4f1f8', border: [false, true, false, false], margin: [0, 6, 0, 0] },
                    { text: `$${f.total.toFixed(2)}`, bold: true, fontSize: 15, color: '#5b1d6e', fillColor: '#f4f1f8', alignment: 'right', border: [false, true, false, false], margin: [0, 6, 0, 0] }
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
        titulo: { fontSize: 22, bold: true, color: '#5b1d6e' },
        seccion: { fontSize: 13, bold: true, color: '#8e1f3a', margin: [0, 0, 0, 8] },
        tableHeader: { bold: true, color: 'white', fillColor: '#5b1d6e', fontSize: 12 }
      },

      defaultStyle: { font: 'Roboto', fontSize: 11, color: '#333' }
    };

    pdfMake.createPdf(docDefinition).open();
  }
}