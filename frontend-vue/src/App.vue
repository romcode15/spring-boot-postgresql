<script setup lang="ts">
import { ref, onMounted } from 'vue'
import './App.css'
import {
  listarProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  type Producto,
} from './services/productoService'

const productoVacio = (): Producto => ({
  nombre: '',
  descripcion: '',
  precio: 0,
  stock: 0,
  activo: true,
})

const usuario = ref<string>('admin')
const clave = ref<string>('Admin_2026!')
const filtro = ref<string>('')
const productos = ref<Producto[]>([])
const formulario = ref<Producto>(productoVacio())
const editando = ref<boolean>(false)
const mensaje = ref<string>('')

onMounted(() => cargarProductos())

async function cargarProductos(): Promise<void> {
  try {
    const datos = await listarProductos(usuario.value, clave.value, filtro.value)
    productos.value = datos
    mensaje.value = `Productos cargados: ${datos.length}`
  } catch (error) {
    manejarError(error)
  }
}

async function guardar(): Promise<void> {
  const producto: Producto = {
    ...formulario.value,
    precio: Number(formulario.value.precio),
    stock: Number(formulario.value.stock),
  }

  try {
    if (editando.value && producto.id) {
      await actualizarProducto(producto.id, producto, usuario.value, clave.value)
      mensaje.value = 'Producto actualizado correctamente.'
    } else {
      await crearProducto(producto, usuario.value, clave.value)
      mensaje.value = 'Producto registrado correctamente.'
    }

    limpiarFormulario()
    await cargarProductos()
  } catch (error) {
    manejarError(error)
  }
}

function seleccionar(producto: Producto): void {
  formulario.value = { ...producto }
  editando.value = true
}

async function eliminar(producto: Producto): Promise<void> {
  try {
    await eliminarProducto(producto.id!, usuario.value, clave.value)
    mensaje.value = 'Producto eliminado correctamente.'
    await cargarProductos()
  } catch (error) {
    manejarError(error)
  }
}

function limpiarFormulario(): void {
  formulario.value = productoVacio()
  editando.value = false
}

function manejarError(error: unknown): void {
  const err = error as Error & { status?: number }
  if (err.status === 401) {
    mensaje.value = 'Credenciales incorrectas.'
  } else if (err.status === 403) {
    mensaje.value = 'El usuario autenticado requiere rol ADMIN para esta acción.'
  } else if (err.status === 409) {
    mensaje.value = 'Ya existe un producto con ese nombre.'
  } else {
    mensaje.value = err.message || 'Error inesperado.'
  }
}
</script>

<template>
  <main class="contenedor">
    <h1>CRUD de productos - Vue</h1>

    <!-- Credenciales -->
    <section class="tarjeta">
      <h2>Credenciales</h2>
      <label>Usuario</label>
      <input v-model="usuario" />

      <label>Contraseña</label>
      <input type="password" v-model="clave" />
    </section>

    <!-- Formulario -->
    <section class="tarjeta">
      <h2>{{ editando ? 'Editar producto' : 'Registrar producto' }}</h2>

      <form @submit.prevent="guardar">
        <label>Nombre</label>
        <input v-model="formulario.nombre" required />

        <label>Descripción</label>
        <input v-model="formulario.descripcion" required />

        <label>Precio</label>
        <input v-model="formulario.precio" type="number" required />

        <label>Stock</label>
        <input v-model="formulario.stock" type="number" required />

        <label>
          <input v-model="formulario.activo" type="checkbox" />
          Activo
        </label>

        <button type="submit">{{ editando ? 'Actualizar' : 'Guardar' }}</button>
        <button type="button" @click="limpiarFormulario">Limpiar</button>
      </form>
    </section>

    <!-- Listado -->
    <section class="tarjeta">
      <h2>Listado de productos</h2>
      <input v-model="filtro" placeholder="Buscar por nombre" />
      <button @click="cargarProductos">Buscar</button>

      <p class="mensaje">{{ mensaje }}</p>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Activo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="producto in productos" :key="producto.id">
            <td>{{ producto.id }}</td>
            <td>{{ producto.nombre }}</td>
            <td>{{ producto.precio }}</td>
            <td>{{ producto.stock }}</td>
            <td>{{ producto.activo ? 'Sí' : 'No' }}</td>
            <td>
              <button @click="seleccionar(producto)">Editar</button>
              <button @click="eliminar(producto)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </main>
</template>
