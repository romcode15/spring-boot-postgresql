import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Producto } from './models/producto';
import { ProductoService } from './services/producto';

const TAMANIO = 10;

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  usuario = 'admin';
  clave   = 'Admin_2026!';
  filtro  = '';

  productos: Producto[] = [];
  producto: Producto = { nombre: '', descripcion: '', precio: 0, stock: 0, activo: true };

  editando    = false;
  idEditando: number | null = null;
  mensaje     = '';

  pagina         = 0;
  totalPaginas   = 0;
  totalElementos = 0;

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void { this.cargarProductos(0); }

  cargarProductos(pag = this.pagina): void {
    this.productoService.listar(this.usuario, this.clave, this.filtro, pag, TAMANIO).subscribe({
      next: (res) => {
        this.productos      = res.contenido;
        this.pagina         = res.paginaActual;
        this.totalPaginas   = res.totalPaginas;
        this.totalElementos = res.totalElementos;
        this.mensaje = `Página ${res.paginaActual + 1} de ${res.totalPaginas} — ${res.totalElementos} productos`;
      },
      error: (e) => this.manejarError(e)
    });
  }

  buscar(): void { this.cargarProductos(0); }

  guardarProducto(): void {
    const producto: Producto = { ...this.producto, precio: Number(this.producto.precio), stock: Number(this.producto.stock) };

    const obs = this.editando && this.idEditando !== null
      ? this.productoService.actualizar(this.idEditando, producto, this.usuario, this.clave)
      : this.productoService.crear(producto, this.usuario, this.clave);

    obs.subscribe({
      next: () => {
        this.mensaje = this.editando ? 'Producto actualizado correctamente.' : 'Producto registrado correctamente.';
        this.limpiarFormulario();
        this.cargarProductos(0);
      },
      error: (e) => this.manejarError(e)
    });
  }

  editarProducto(p: Producto): void {
    this.editando   = true;
    this.idEditando = p.id ?? null;
    this.producto   = { nombre: p.nombre, descripcion: p.descripcion, precio: p.precio, stock: p.stock, activo: p.activo };
  }

  eliminarProducto(id: number | undefined): void {
    if (id === undefined) { this.mensaje = 'No se puede eliminar un producto sin id.'; return; }
    this.productoService.eliminar(id, this.usuario, this.clave).subscribe({
      next: () => { this.mensaje = 'Producto eliminado correctamente.'; this.cargarProductos(0); },
      error: (e) => this.manejarError(e)
    });
  }

  limpiarFormulario(): void {
    this.editando   = false;
    this.idEditando = null;
    this.producto   = { nombre: '', descripcion: '', precio: 0, stock: 0, activo: true };
  }

  manejarError(error: { status?: number; message?: string }): void {
    const msgs: Record<number, string> = { 401: 'Credenciales incorrectas.', 403: 'Se requiere rol ADMIN.', 409: 'Ya existe un producto con ese nombre.' };
    this.mensaje = (error.status ? msgs[error.status] : null) ?? error.message ?? 'Error inesperado.';
  }
}
