export interface Producto {
  id?: number
  nombre: string
  descripcion: string
  precio: number
  stock: number
  activo: boolean
}

const API_URL = 'http://localhost:8081/api/productos'

function crearAuthorization(usuario: string, clave: string): string {
  return `Basic ${btoa(`${usuario}:${clave}`)}`
}

async function procesarRespuesta<T>(response: Response): Promise<T | null> {
  if (response.status === 204) {
    return null
  }

  const texto = await response.text()
  const data = texto ? JSON.parse(texto) : null

  if (!response.ok) {
    const error: Error & { status?: number } = new Error(
      data?.message || `Error HTTP ${response.status}`,
    )
    error.status = response.status
    throw error
  }

  return data as T
}

export async function listarProductos(
  usuario: string,
  clave: string,
  nombre = '',
): Promise<Producto[]> {
  const url = nombre.trim()
    ? `${API_URL}?nombre=${encodeURIComponent(nombre.trim())}`
    : API_URL

  const response = await fetch(url, {
    headers: { Authorization: crearAuthorization(usuario, clave) },
  })

  return (await procesarRespuesta<Producto[]>(response)) ?? []
}

export async function crearProducto(
  producto: Producto,
  usuario: string,
  clave: string,
): Promise<Producto | null> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: crearAuthorization(usuario, clave),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(producto),
  })

  return procesarRespuesta<Producto>(response)
}

export async function actualizarProducto(
  id: number,
  producto: Producto,
  usuario: string,
  clave: string,
): Promise<Producto | null> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: crearAuthorization(usuario, clave),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(producto),
  })

  return procesarRespuesta<Producto>(response)
}

export async function eliminarProducto(
  id: number,
  usuario: string,
  clave: string,
): Promise<null> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: crearAuthorization(usuario, clave) },
  })

  return procesarRespuesta<null>(response)
}
