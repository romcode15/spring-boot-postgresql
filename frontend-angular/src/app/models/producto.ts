export interface Producto {
  id?: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  activo: boolean;
}

export interface PaginaResponse<T> {
  contenido: T[];
  paginaActual: number;
  totalPaginas: number;
  totalElementos: number;
}