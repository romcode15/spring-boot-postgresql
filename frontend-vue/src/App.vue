<script setup lang="ts">
import { ref, onMounted } from 'vue'
import './App.css'
import {
  listarProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  type Producto,
  type PaginaResponse,
} from './services/productoService'

const TAMANIO = 10

const productoVacio = (): Producto => ({ nombre: '', descripcion: '', precio: 0, stock: 0, activo: true })

const usuario   = ref('admin')
const clave     = ref('Admin_2026!')
const filtro    = ref('')
const productos = ref<Producto[]>([])
const formulario = ref<Producto>(productoVacio())
const editando  = ref(false)
const mensaje   = ref('')
const pagina    = ref(0)
const totalPaginas   = ref(0)
const totalElementos = ref(0)

onMounted(() => cargarProductos(0))

async function cargarProductos(pag = pagina.value): Promise<void> {
  try {
    const res: PaginaResponse<Producto> = await listarProductos(usuario.value, clave.value, filtro.value, pag, TAMANIO)
    productos.value      = res.contenido
    pagina.value         = res.paginaActual
    totalPaginas.value   = res.totalPaginas
    totalElementos.value = res.totalElementos
    mensaje.value = `Página ${res.paginaActual + 1} de ${res.totalPaginas} — ${res.totalElementos} productos`
  } catch (error) { manejarError(error) }
}

function buscar() { cargarProductos(0) }

async function guardar(): Promise<void> {
  const producto: Producto = { ...formulario.value, precio: Number(formulario.value.precio), stock: Number(formulario.value.stock) }
  try {
    if (editando.value && producto.id) {
      await actualizarProducto(producto.id, producto, usuario.value, clave.value)
      mensaje.value = 'Producto actualizado correctamente.'
    } else {
      await crearProducto(producto, usuario.value, clave.value)
      mensaje.value = 'Producto registrado correctamente.'
    }
    limpiarFormulario()
    cargarProductos(0)
  } catch (error) { manejarError(error) }
}

function seleccionar(p: Producto) { formulario.value = { ...p }; editando.value = true }

async function eliminar(p: Producto): Promise<void> {
  try {
    await eliminarProducto(p.id!, usuario.value, clave.value)
    mensaje.value = 'Producto eliminado correctamente.'
    cargarProductos(0)
  } catch (error) { manejarError(error) }
}

function limpiarFormulario() { formulario.value = productoVacio(); editando.value = false }

function manejarError(error: unknown) {
  const err = error as Error & { status?: number }
  const msgs: Record<number, string> = { 401: 'Credenciales incorrectas.', 403: 'Se requiere rol ADMIN.', 409: 'Ya existe un producto con ese nombre.' }
  mensaje.value = (err.status ? msgs[err.status] : null) || err.message || 'Error inesperado.'
}
</script>

<template>
  <main class="contenedor">
    <h1>CRUD de productos - Vue</h1>

    <section class="tarjeta">
      <h2>Credenciales</h2>
      <label>Usuario</label><input v-model="usuario" />
      <label>Contraseña</label><input type="password" v-model="clave" />
    </section>

    <section class="tarjeta">
      <h2>{{ editando ? 'Editar producto' : 'Registrar producto' }}</h2>
      <form @submit.prevent="guardar">
        <label>Nombre</label><input v-model="formulario.nombre" required />
        <label>Descripción</label><input v-model="formulario.descripcion" required />
        <label>Precio</label><input v-model="formulario.precio" type="number" required />
        <label>Stock</label><input v-model="formulario.stock" type="number" required />
        <label><input v-model="formulario.activo" type="checkbox" /> Activo</label>
        <button type="submit">{{ editando ? 'Actualizar' : 'Guardar' }}</button>
        <button type="button" @click="limpiarFormulario">Limpiar</button>
      </form>
    </section>

    <section class="tarjeta">
      <h2>Listado de productos</h2>
      <input v-model="filtro" placeholder="Buscar por nombre" />
      <button @click="buscar">Buscar</button>

      <p class="mensaje">{{ mensaje }}</p>

      <table>
        <thead>
          <tr><th>ID</th><th>Nombre</th><th>Precio</th><th>Stock</th><th>Activo</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          <tr v-for="p in productos" :key="p.id">
            <td>{{ p.id }}</td><td>{{ p.nombre }}</td><td>{{ p.precio }}</td>
            <td>{{ p.stock }}</td><td>{{ p.activo ? 'Sí' : 'No' }}</td>
            <td>
              <button @click="seleccionar(p)">Editar</button>
              <button @click="eliminar(p)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="paginacion">
        <button @click="cargarProductos(pagina - 1)" :disabled="pagina === 0">← Anterior</button>
        <span>{{ pagina + 1 }} / {{ totalPaginas }} ({{ totalElementos }} registros)</span>
        <button @click="cargarProductos(pagina + 1)" :disabled="pagina >= totalPaginas - 1">Siguiente →</button>
      </div>
    </section>
  </main>
</template>
