<script>
  import { listarProductos, crearProducto, actualizarProducto, eliminarProducto } from './services/productoService.js'

  const TAMANIO = 10

  let usuario   = $state('admin')
  let clave     = $state('Admin_2026!')
  let filtro    = $state('')
  let productos = $state([])
  let editando  = $state(false)
  let mensaje   = $state('')
  let pagina    = $state(0)
  let totalPaginas   = $state(0)
  let totalElementos = $state(0)
  let formulario = $state(productoVacio())

  function productoVacio() {
    return { nombre: '', descripcion: '', precio: 0, stock: 0, activo: true }
  }

  $effect.root(() => { cargarProductos(0) })

  async function cargarProductos(pag = pagina) {
    try {
      const res = await listarProductos(usuario, clave, filtro, pag, TAMANIO)
      productos      = res.contenido
      pagina         = res.paginaActual
      totalPaginas   = res.totalPaginas
      totalElementos = res.totalElementos
      mensaje = `Página ${res.paginaActual + 1} de ${res.totalPaginas} — ${res.totalElementos} productos`
    } catch (error) { manejarError(error) }
  }

  function buscar() { cargarProductos(0) }

  async function guardar() {
    const producto = { ...formulario, precio: Number(formulario.precio), stock: Number(formulario.stock) }
    try {
      if (editando && producto.id) {
        await actualizarProducto(producto.id, producto, usuario, clave)
        mensaje = 'Producto actualizado correctamente.'
      } else {
        await crearProducto(producto, usuario, clave)
        mensaje = 'Producto registrado correctamente.'
      }
      limpiarFormulario()
      cargarProductos(0)
    } catch (error) { manejarError(error) }
  }

  function seleccionar(p) { formulario = { ...p }; editando = true }

  async function eliminar(p) {
    try {
      await eliminarProducto(p.id, usuario, clave)
      mensaje = 'Producto eliminado correctamente.'
      cargarProductos(0)
    } catch (error) { manejarError(error) }
  }

  function limpiarFormulario() { formulario = productoVacio(); editando = false }

  function manejarError(error) {
    const msgs = { 401: 'Credenciales incorrectas.', 403: 'Se requiere rol ADMIN.', 409: 'Ya existe un producto con ese nombre.' }
    mensaje = msgs[error.status] || error.message || 'Error inesperado.'
  }
</script>

<main class="contenedor">
  <h1>CRUD de productos - Svelte</h1>

  <section class="tarjeta">
    <h2>Credenciales</h2>
    <label for="usuario">Usuario</label>
    <input id="usuario" bind:value={usuario} />
    <label for="clave">Contraseña</label>
    <input id="clave" type="password" bind:value={clave} />
  </section>

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
      <label><input type="checkbox" bind:checked={formulario.activo} /> Activo</label>
      <button type="submit">{editando ? 'Actualizar' : 'Guardar'}</button>
      <button type="button" onclick={limpiarFormulario}>Limpiar</button>
    </form>
  </section>

  <section class="tarjeta">
    <h2>Listado de productos</h2>
    <input bind:value={filtro} placeholder="Buscar por nombre" />
    <button onclick={buscar}>Buscar</button>

    <p class="mensaje">{mensaje}</p>

    <table>
      <thead>
        <tr><th>ID</th><th>Nombre</th><th>Precio</th><th>Stock</th><th>Activo</th><th>Acciones</th></tr>
      </thead>
      <tbody>
        {#each productos as p (p.id)}
          <tr>
            <td>{p.id}</td><td>{p.nombre}</td><td>{p.precio}</td>
            <td>{p.stock}</td><td>{p.activo ? 'Sí' : 'No'}</td>
            <td>
              <button onclick={() => seleccionar(p)}>Editar</button>
              <button onclick={() => eliminar(p)}>Eliminar</button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>

    <div class="paginacion">
      <button onclick={() => cargarProductos(pagina - 1)} disabled={pagina === 0}>← Anterior</button>
      <span>{pagina + 1} / {totalPaginas} ({totalElementos} registros)</span>
      <button onclick={() => cargarProductos(pagina + 1)} disabled={pagina >= totalPaginas - 1}>Siguiente →</button>
    </div>
  </section>
</main>

<style>
  :global(:root) {
    --accent: #ff3e00;
    --accent-dark: #c42e00;
    --bg-card: #fff;
    --border: #e2e8f0;
    --text: #1a202c;
    --text-muted: #718096;
    --radius: 10px;
    --shadow: 0 2px 8px rgba(0,0,0,.08);
  }

  .contenedor { max-width: 900px; margin: 32px auto; padding: 0 16px; font-family: 'Segoe UI', system-ui, sans-serif; color: var(--text); }
  :global(h1) { font-size: 1.6rem; margin: 0 0 24px; color: var(--accent); }
  :global(h2) { font-size: 1rem; font-weight: 600; margin: 0 0 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: .05em; }

  .tarjeta { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; margin-bottom: 16px; box-shadow: var(--shadow); }

  label { display: block; font-size: .85rem; font-weight: 500; margin: 10px 0 3px; }
  input[type="text"], input[type="number"], input[type="password"] { width: 100%; padding: 8px 10px; border: 1px solid var(--border); border-radius: 6px; font-size: .95rem; box-sizing: border-box; transition: border-color .2s; }
  input:focus { outline: none; border-color: var(--accent); }

  button { padding: 8px 16px; margin: 10px 6px 0 0; border: none; border-radius: 6px; font-size: .9rem; cursor: pointer; background: var(--accent); color: #fff; transition: background .2s; }
  button:hover { background: var(--accent-dark); }
  button:disabled { background: #cbd5e0; cursor: default; }

  .tarjeta > input { max-width: 280px; display: inline-block; width: auto; margin-right: 8px; }
  .mensaje { font-size: .9rem; font-weight: 500; color: var(--accent-dark); min-height: 20px; margin: 10px 0 4px; }

  table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: .9rem; }
  th { background: #f7fafc; color: var(--text-muted); font-weight: 600; text-align: left; padding: 10px 12px; border-bottom: 2px solid var(--border); }
  td { padding: 9px 12px; border-bottom: 1px solid var(--border); }
  tbody tr:last-child td { border-bottom: none; }
  tbody tr:hover { background: #fff5f0; }
  td button { padding: 4px 10px; font-size: .8rem; margin: 0 4px 0 0; }

  .paginacion { display: flex; align-items: center; gap: 12px; margin-top: 14px; font-size: .9rem; }
  .paginacion span { color: var(--text-muted); }
</style>
