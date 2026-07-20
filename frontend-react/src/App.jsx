import { useEffect, useState } from 'react';
import './App.css';
import {
  actualizarProducto,
  crearProducto,
  eliminarProducto,
  listarProductos
} from './services/productoService';

const TAMANIO = 10;
const productoVacio = { nombre: '', descripcion: '', precio: 0, stock: 0, activo: true };

function App() {
  const [usuario, setUsuario] = useState('admin');
  const [clave, setClave] = useState('Admin_2026!');
  const [filtro, setFiltro] = useState('');
  const [productos, setProductos] = useState([]);
  const [formulario, setFormulario] = useState(productoVacio);
  const [editando, setEditando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);

  useEffect(() => { cargarProductos(0); }, []);

  async function cargarProductos(pag = pagina) {
    try {
      const res = await listarProductos(usuario, clave, filtro, pag, TAMANIO);
      setProductos(res.contenido);
      setPagina(res.paginaActual);
      setTotalPaginas(res.totalPaginas);
      setTotalElementos(res.totalElementos);
      setMensaje(`Página ${res.paginaActual + 1} de ${res.totalPaginas} — ${res.totalElementos} productos`);
    } catch (error) { manejarError(error); }
  }

  function buscar() { cargarProductos(0); }

  function cambiarCampo(e) {
    const { name, value, type, checked } = e.target;
    setFormulario({ ...formulario, [name]: type === 'checkbox' ? checked : value });
  }

  async function guardar(e) {
    e.preventDefault();
    const producto = { ...formulario, precio: Number(formulario.precio), stock: Number(formulario.stock) };
    try {
      if (editando && producto.id) {
        await actualizarProducto(producto.id, producto, usuario, clave);
        setMensaje('Producto actualizado correctamente.');
      } else {
        await crearProducto(producto, usuario, clave);
        setMensaje('Producto registrado correctamente.');
      }
      limpiarFormulario();
      cargarProductos(0);
    } catch (error) { manejarError(error); }
  }

  function seleccionar(p) { setFormulario({ ...p }); setEditando(true); }

  async function eliminar(p) {
    try {
      await eliminarProducto(p.id, usuario, clave);
      setMensaje('Producto eliminado correctamente.');
      cargarProductos(0);
    } catch (error) { manejarError(error); }
  }

  function limpiarFormulario() { setFormulario(productoVacio); setEditando(false); }

  function manejarError(error) {
    const msgs = { 401: 'Credenciales incorrectas.', 403: 'Se requiere rol ADMIN.', 409: 'Ya existe un producto con ese nombre.' };
    setMensaje(msgs[error.status] || error.message || 'Error inesperado.');
  }

  return (
    <main className="contenedor">
      <h1>CRUD de productos - React</h1>

      <section className="tarjeta">
        <h2>Credenciales</h2>
        <label>Usuario</label>
        <input value={usuario} onChange={e => setUsuario(e.target.value)} />
        <label>Contraseña</label>
        <input type="password" value={clave} onChange={e => setClave(e.target.value)} />
      </section>

      <section className="tarjeta">
        <h2>{editando ? 'Editar producto' : 'Registrar producto'}</h2>
        <form onSubmit={guardar}>
          <label>Nombre</label>
          <input name="nombre" value={formulario.nombre} onChange={cambiarCampo} required />
          <label>Descripción</label>
          <input name="descripcion" value={formulario.descripcion} onChange={cambiarCampo} required />
          <label>Precio</label>
          <input name="precio" type="number" value={formulario.precio} onChange={cambiarCampo} required />
          <label>Stock</label>
          <input name="stock" type="number" value={formulario.stock} onChange={cambiarCampo} required />
          <label>
            <input name="activo" type="checkbox" checked={formulario.activo} onChange={cambiarCampo} /> Activo
          </label>
          <button type="submit">{editando ? 'Actualizar' : 'Guardar'}</button>
          <button type="button" onClick={limpiarFormulario}>Limpiar</button>
        </form>
      </section>

      <section className="tarjeta">
        <h2>Listado de productos</h2>
        <input value={filtro} onChange={e => setFiltro(e.target.value)} placeholder="Buscar por nombre" />
        <button onClick={buscar}>Buscar</button>

        <p className="mensaje">{mensaje}</p>

        <table>
          <thead>
            <tr><th>ID</th><th>Nombre</th><th>Precio</th><th>Stock</th><th>Activo</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {productos.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td><td>{p.nombre}</td><td>{p.precio}</td>
                <td>{p.stock}</td><td>{p.activo ? 'Sí' : 'No'}</td>
                <td>
                  <button onClick={() => seleccionar(p)}>Editar</button>
                  <button onClick={() => eliminar(p)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="paginacion">
          <button onClick={() => cargarProductos(pagina - 1)} disabled={pagina === 0}>← Anterior</button>
          <span>{pagina + 1} / {totalPaginas} ({totalElementos} registros)</span>
          <button onClick={() => cargarProductos(pagina + 1)} disabled={pagina >= totalPaginas - 1}>Siguiente →</button>
        </div>
      </section>
    </main>
  );
}

export default App;
