using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FacturacionApi.Models
{
    [Table("detallefactura")]
    public class DetalleFactura
    {
        [Key]
        [Column("id_detalle")]
        public int IdDetalle { get; set; }

        [Column("id_factura")]
        public int IdFactura { get; set; }
        public Factura? Factura { get; set; }

        [Column("id_producto")]
        public int IdProducto { get; set; }
        public Producto? Producto { get; set; }

        [Column("cantidad")]
        public int Cantidad { get; set; }

        [Column("precio_unitario")]
        public decimal PrecioUnitario { get; set; }

        [Column("subtotal_linea")]
        public decimal SubtotalLinea { get; set; }
    }
}