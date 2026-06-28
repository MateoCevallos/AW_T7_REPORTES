using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FacturacionApi.Models
{
    [Table("facturas")]
    public class Factura
    {
        [Key]
        [Column("id_factura")]
        public int IdFactura { get; set; }

        [Column("numero_factura")]
        public string? NumeroFactura { get; set; }

        [Column("fecha")]
        public DateTime Fecha { get; set; }

        [Column("id_cliente")]
        public int IdCliente { get; set; }
        public Cliente? Cliente { get; set; }

        [Column("subtotal")]
        public decimal Subtotal { get; set; }

        [Column("iva")]
        public decimal IVA { get; set; }

        [Column("total")]
        public decimal Total { get; set; }

        [Column("estado")]
        public string? Estado { get; set; }

        public List<DetalleFactura>? DetalleFacturas { get; set; }
    }
}