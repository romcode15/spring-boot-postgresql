<script>
  import {
    listarProductos,
    crearProducto,
    actualizarProducto,
    eliminarProducto
  } from './services/productoService.js'

  // --- Estado ---
  let usuario   = $state('admin')
  let clave     = $state('Admin_2026!')
  let filtro    = $state('')
  let productos = $state([])
  let editando  = $state(false)
  let mensaje   = $state('')

  let formulario = $state(productoVacio())

  function productoVacio() {
    return { nombre: '', descripcion: '', precio: 0, stock: 0, activo: true }
  }

  // --- Ciclo de vida ---
  $effect.root(() => {
    cargarProductos()
  })

  // --- Funciones ---
  async function cargarProductos() {
    try {
      const datos = await listarProductos(usuario, clave, filtro)
      productos = datos
      mensaje = `Productos cargados: ${datos.length}`
    } catch (error) {
      manejarError(error)
    }
  }

  async function guardar() {
    const producto = {
      ...formulario,
      precio: Number(formulario.precio),
      stock:  Number(formulario.stock)
    }

    try {
      if (editando && producto.id) {
        await actualizarProducto(producto.id, producto, usuario, clave)
        mensaje = 'Producto actualizado correctamente.'
      } else {
        await crearProducto(producto, usuario, clave)
        mensaje = 'Producto registrado correctamente.'
      }

      limpiarFormulario()
      await cargarProductos()
    } catch (error) {
      manejarError(error)
    }
  }

  function seleccionar(producto) {
    formulario = { ...producto }
    editando = true
  }

  async function eliminar(producto) {
    try {
      await eliminarProducto(producto.id, usuario, clave)
      mensaje = 'Producto eliminado correctamente.'
      await cargarProductos()
    } catch (error) {
      manejarError(error)
    }
  }

  function limpiarFormulario() {
    formulario = productoVacio()
    editando = false
  }

  function manejarError(error) {
    if (error.status === 401) {
      mensaje = 'Credenciales incorrectas.'
    } else if (error.status === 403) {
      mensaje = 'El usuario autenticado requiere rol ADMIN para esta acción.'
    } else if (error.status === 409) {
      mensaje = 'Ya existe un producto con ese nombre.'
    } else {
      mensaje = error.message || 'Error inesperado.'
    }
  }
</script>

<main class="contenedor">
  <h1>CRUD de productos - Svelte</h1>

  <!-- Credenciales -->
  <section class="tarjeta">
    <h2>Credenciales</h2>
    <label for="usuario">Usuario</label>
    <input id="usuario" bind:value={usuario} />

    <label for="clave">Contraseña</label>
    <input id="clave" type="password" bind:value={clave} />
  </section>

  <!-- Formulario -->
  <section class="tarjeta">
    <h2>{editando ? 'Editar producto' : 'Registrar producto'}</h2>

    <form onsubmit={e => { e.preventDefault(); guardar() }}>
      <label for="nombre">Nombre</label>
      <input id="nombre" bind:value={formulario.nombre} required />

      <label for="descripcion">Descripción</label>
      <input id="descripcion" bind:value={formulario.descripcion} required />

      <label for="precio">Precio</label>
      <input id="precio" type="number" bind:value={formulario.precio} required />

      <label for="stock">Stock</label>
      <input id="stock" type="number" bind:value={formulario.stock} required />

      <label>
        <input type="checkbox" bind:checked={formulario.activo} />
        Activo
      </label>

      <button type="submit">{editando ? 'Actualizar' : 'Guardar'}</button>
      <button type="button" onclick={limpiarFormulario}>Limpiar</button>
    </form>
  </section>

  <!-- Listado -->
  <section class="tarjeta">
    <h2>Listado de productos</h2>
    <input bind:value={filtro} placeholder="Buscar por nombre" />
    <button onclick={cargarProductos}>Buscar</button>

    <p class="mensaje">{mensaje}</p>

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
        {#each productos as producto (producto.id)}
          <tr>
            <td>{producto.id}</td>
            <td>{producto.nombre}</td>
            <td>{producto.precio}</td>
            <td>{producto.stock}</td>
            <td>{producto.activo ? 'Sí' : 'No'}</td>
            <td>
              <button onclick={() => seleccionar(producto)}>Editar</button>
              <button onclick={() => eliminar(producto)}>Eliminar</button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </section>
</main>

<style>
  .contenedor {
    max-width: 1100px;
    margin: 20px auto;
    font-family: Arial, sans-serif;
  }

  .tarjeta {
    border: 1px solid #ddd;
    border-radius: 10px;
    padding: 16px;
    margin-bottom: 16px;
  }

  label {
    display: block;
    margin-top: 8px;
  }

  input {
    width: 100%;
    padding: 8px;
    margin-top: 4px;
    box-sizing: border-box;
  }

  button {
    margin: 8px 6px 8px 0;
    padding: 8px 12px;
    cursor: pointer;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 12px;
  }

  th,
  td {
    border: 1px solid #ccc;
    padding: 8px;
    text-align: left;
  }

  .mensaje {
    font-weight: bold;
    margin: 8px 0;
  }
</style>
