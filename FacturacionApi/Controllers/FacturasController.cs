using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FacturacionApi.Data;
using FacturacionApi.Models;

namespace FacturacionApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FacturasController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FacturasController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Factura>>> GetFacturas()
        {
            return await _context.Facturas
                .Include(f => f.Cliente)
                .Include(f => f.DetalleFacturas)
                    .ThenInclude(d => d.Producto)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Factura>> GetFactura(int id)
        {
            var factura = await _context.Facturas
                .Include(f => f.Cliente)
                .Include(f => f.DetalleFacturas)
                    .ThenInclude(d => d.Producto)
                .FirstOrDefaultAsync(f => f.IdFactura == id);

            if (factura == null) return NotFound();
            return factura;
        }

        [HttpPost]
        public async Task<IActionResult> PostFactura(Factura factura)
        {
            decimal subtotal = 0;
            foreach (var item in factura.DetalleFacturas)
            {
                item.SubtotalLinea = item.Cantidad * item.PrecioUnitario;
                subtotal += item.SubtotalLinea;
            }

            factura.Subtotal = subtotal;
            factura.IVA = subtotal * 0.15m;
            factura.Total = subtotal + factura.IVA;
            factura.Fecha = DateTime.Now;
            factura.Estado = "PENDIENTE";

            // Generar número de factura automático
            int count = await _context.Facturas.CountAsync();
            factura.NumeroFactura = $"F001-{(count + 1):D4}";

            _context.Facturas.Add(factura);
            await _context.SaveChangesAsync();
            return Ok(factura);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutFactura(int id, Factura factura)
        {
            if (id != factura.IdFactura) return BadRequest();
            _context.Entry(factura).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFactura(int id)
        {
            var factura = await _context.Facturas
                .Include(f => f.DetalleFacturas)
                .FirstOrDefaultAsync(f => f.IdFactura == id);
                
            if (factura == null) return NotFound();

            // Eliminar detalles primero
            _context.DetalleFacturas.RemoveRange(factura.DetalleFacturas);
            _context.Facturas.Remove(factura);
            
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}