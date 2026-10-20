import { useState, useEffect } from "react";
import {
  listarCotizaciones,
  obtenerCotizacion,
  eliminarCotizacion,
} from "../api/services";

// Formateador estándar según los requerimientos: Number(valor).toFixed(2)
const formatoMoneda = (valor) => `$${Number(valor).toFixed(2)}`;
const formatoPorcentaje = (valor) => `${(Number(valor) * 100).toFixed(0)}%`;

export default function List({
  setVista,
  cotizacionDetalle,
  setCotizacionDetalle,
}) {
  // Estados para datos
  const [cotizaciones, setCotizaciones] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  // Estados de los Filtros
  const [id, setId] = useState("");
  const [peso, setPeso] = useState("");
  const [tipoCliente, setTipoCliente] = useState("");
  const [tipoServicio, setTipoServicio] = useState("");
  const [fechaCreacion, setFechaCreacion] = useState("");

  // Construye el objeto de filtros omitiendo valores vacíos
  const obtenerFiltrosActivos = () => {
    const filtros = {};
    if (id) filtros.id = id;
    if (peso) filtros.peso_kg = peso;
    if (tipoCliente) filtros.tipo_cliente = tipoCliente;
    if (tipoServicio) filtros.tipo_envio = tipoServicio;
    if (fechaCreacion) filtros.creado_en = fechaCreacion;
    return filtros;
  };

  // Función principal para cargar cotizaciones
  const cargar = async (filtrosAdicionales = {}) => {
    setCargando(true);
    setError(null);
    try {
      const filtros = { ...obtenerFiltrosActivos(), ...filtrosAdicionales };
      const resp = await listarCotizaciones(filtros);

      // La respuesta viene paginada (results y count)
      setCotizaciones(resp.results || []);
      setTotalItems(resp.count || 0);
    } catch (err) {
      setError(
        typeof err?.detalle === "string"
          ? err.detalle
          : "Error al cargar el listado de cotizaciones",
      );
      setCotizaciones([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  // Manejador del botón Filtrar
  const handleFiltrar = (e) => {
    e.preventDefault();
    cargar();
  };

  // Manejador del botón Limpiar
  const handleLimpiar = () => {
    setId("");
    setPeso("");
    setTipoCliente("");
    setTipoServicio("");
    setFechaCreacion("");
    setError(null);
    // Carga la lista completa sin parámetros
    listarCotizaciones({})
      .then((resp) => {
        setCotizaciones(resp.results || []);
        setTotalItems(resp.count || 0);
      })
      .catch((err) => {
        setError("Error al restablecer los filtros");
      });
  };

  // Ver detalle (obtiene datos actualizados del backend)
  const handleDetalle = async (item) => {
    setCargandoDetalle(true);
    try {
      const data = await obtenerCotizacion(item.id);
      setCotizacionDetalle(data);
    } catch (err) {
      const msj =
        typeof err?.detalle === "string"
          ? err.detalle
          : "No se pudo obtener el detalle";
      alert(msj);
    } finally {
      setCargandoDetalle(false);
    }
  };

  // Eliminar cotización
  const handleEliminar = async (idEliminar) => {
    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar la cotización #${idEliminar}?`,
    );
    if (!confirmar) return;

    try {
      await eliminarCotizacion(idEliminar);
      // Recarga la lista para refrescar la tabla y el conteo
      cargar();
    } catch (err) {
      const msj =
        typeof err?.detalle === "string"
          ? err.detalle
          : "No se pudo eliminar la cotización";
      setError(msj);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto my-6 px-4 flex flex-col lg:flex-row gap-6 items-start">
      {/* Sidebar de filtros */}
      <aside className="w-full lg:w-72 lg:shrink-0 lg:sticky lg:top-6">
        <form
          noValidate
          className="bg-white p-5 rounded-md shadow-md space-y-5"
          onSubmit={handleFiltrar}
        >
          <h3 className="text-lg font-bold border-b border-gray-200 pb-3">
            Filtrar
          </h3>

          <div className="flex flex-col gap-1">
            <label htmlFor="id" className="text-sm font-medium text-gray-700">
              Número de orden (ID)
            </label>
            <input
              id="id"
              name="id"
              type="number"
              min={1}
              placeholder="Ej: 5"
              onChange={(e) => setId(e.target.value)}
              value={id}
              className="border border-gray-300 rounded px-3 py-2 w-full bg-white"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="peso_kg"
              className="text-sm font-medium text-gray-700"
            >
              Peso (kg)
            </label>
            <input
              id="peso_kg"
              name="peso_kg"
              type="number"
              step="0.01"
              min="0.01"
              max="20"
              placeholder="Ingrese el peso"
              onChange={(e) => setPeso(e.target.value)}
              value={peso}
              className="border border-gray-300 rounded px-3 py-2 w-full bg-white"
            />
            <small className="text-gray-500">
              Mínimo 0.01 kg, máximo 20 kg
            </small>
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="tipo_cliente"
              className="text-sm font-medium text-gray-700"
            >
              Tipo de cliente
            </label>
            <select
              id="tipo_cliente"
              name="tipo_cliente"
              value={tipoCliente}
              onChange={(e) => setTipoCliente(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-full bg-white"
            >
              <option value="">Todos</option>
              <option value="NUEVO">Nuevo</option>
              <option value="FRECUENTE">Frecuente</option>
              <option value="VIP">VIP</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="tipo_servicio"
              className="text-sm font-medium text-gray-700"
            >
              Tipo de servicio
            </label>
            <select
              id="tipo_servicio"
              name="tipo_servicio"
              value={tipoServicio}
              onChange={(e) => setTipoServicio(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-full bg-white"
            >
              <option value="">Todos</option>
              <option value="ESTANDAR">Estándar</option>
              <option value="EXPRESS">Express</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="creado_en"
              className="text-sm font-medium text-gray-700"
            >
              Fecha de creación
            </label>
            <input
              id="creado_en"
              name="creado_en"
              type="date"
              value={fechaCreacion}
              onChange={(e) => setFechaCreacion(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-full bg-white"
            />
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
            >
              {cargando ? "Filtrando..." : "Filtrar"}
            </button>
            <button
              type="button"
              onClick={handleLimpiar}
              disabled={cargando}
              className="w-full border border-gray-400 text-gray-600 rounded px-4 py-2 hover:bg-gray-100 disabled:opacity-50 transition-colors"
            >
              Limpiar
            </button>
          </div>
        </form>
      </aside>

      {/* Tabla Principal */}
      <section className="flex-1 min-w-0 w-full bg-white p-6 rounded-md shadow-md space-y-4">
        <div className="flex justify-between items-center border-b border-gray-200 pb-3">
          <h2 className="text-xl font-bold">Cotizaciones</h2>
          <span className="text-sm text-gray-500 font-medium">
            Total registros: {totalItems}
          </span>
        </div>

        {/* Mensaje de error si la petición falla */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm font-medium">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="table-auto w-full text-sm text-left">
            <thead>
              <tr className="border-b-2 border-gray-200 text-gray-600">
                <th className="py-3 px-3 text-center">Nº de orden</th>
                <th className="py-3 px-3">Peso (kg)</th>
                <th className="py-3 px-3">Tipo de cliente</th>
                <th className="py-3 px-3">Tipo de envío</th>
                <th className="py-3 px-3">Total</th>
                <th className="py-3 px-3">Fecha de creación</th>
                <th className="py-3 px-3 text-center">Detalle</th>
                <th className="py-3 px-3 text-center">Eliminar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cargando ? (
                <tr>
                  <td colSpan="8" className="py-6 text-center text-gray-500">
                    Cargando cotizaciones...
                  </td>
                </tr>
              ) : cotizaciones.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-6 text-center text-gray-500">
                    No se encontraron cotizaciones.
                  </td>
                </tr>
              ) : (
                cotizaciones.map((c) => (
                  <tr key={c.id} className="hover:bg-indigo-50">
                    <td className="py-3 px-3 text-center font-semibold text-gray-500">
                      #{c.id}
                    </td>
                    <td className="py-3 px-3 tabular-nums">
                      {Number(c.peso_kg).toFixed(2)} kg
                    </td>
                    <td className="py-3 px-3">{c.tipo_cliente}</td>
                    <td className="py-3 px-3">{c.tipo_envio}</td>
                    <td className="py-3 px-3 tabular-nums font-bold text-indigo-600">
                      {formatoMoneda(c.total)}
                    </td>
                    <td className="py-3 px-3 text-gray-600">
                      {c.creado_en
                        ? c.creado_en
                            .slice(0, 10)
                            .split("-")
                            .reverse()
                            .join("/")
                        : "—"}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleDetalle(c)}
                        disabled={cargandoDetalle}
                        className="px-3 py-1 rounded border border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition-colors font-medium text-xs"
                      >
                        Detalle
                      </button>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleEliminar(c.id)}
                        className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition-colors font-medium text-xs"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal / Componente de Detalle */}
      {cotizacionDetalle && (
        <ModalDetalle
          item={cotizacionDetalle}
          onClose={() => setCotizacionDetalle(null)}
          onEdit={() => setVista(2)}
        />
      )}
    </div>
  );
}

// Subcomponente Modal para el detalle completo de la cotización
function ModalDetalle({ item, onClose, onEdit }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-xl p-6 space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-xl font-bold text-gray-800">
            Detalle de Cotización #{item.id}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 font-bold text-lg"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm border-b pb-4 text-gray-700">
          <div>
            <span className="block text-gray-400 text-xs">Tipo de Cliente</span>
            <span className="font-semibold">{item.tipo_cliente}</span>
          </div>
          <div>
            <span className="block text-gray-400 text-xs">Tipo de Envío</span>
            <span className="font-semibold">{item.tipo_envio}</span>
          </div>
          <div>
            <span className="block text-gray-400 text-xs">Peso Registrado</span>
            <span className="font-semibold">
              {Number(item.peso_kg).toFixed(2)} kg
            </span>
          </div>
          <div>
            <span className="block text-gray-400 text-xs">
              Fecha de Creación
            </span>
            <span className="font-semibold">
              {item.creado_en ? item.creado_en.slice(0, 10) : "—"}
            </span>
          </div>
        </div>

        {/* Desglose Financiero */}
        <div className="space-y-2 text-sm text-gray-700 bg-gray-50 p-4 rounded-md">
          <div className="flex justify-between">
            <span>Costo base:</span>
            <span className="font-medium">
              {formatoMoneda(item.costo_base)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Tarifa por kg:</span>
            <span className="font-medium">
              {formatoMoneda(item.tarifa_por_kg)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Costo por peso:</span>
            <span className="font-medium">
              {formatoMoneda(item.costo_peso)}
            </span>
          </div>
          <div className="flex justify-between font-semibold border-t pt-2 border-gray-200">
            <span>Subtotal:</span>
            <span>{formatoMoneda(item.subtotal)}</span>
          </div>
          <div className="flex justify-between text-green-600">
            <span>
              Descuento ({formatoPorcentaje(item.porcentaje_descuento)}):
            </span>
            <span>- {formatoMoneda(item.descuento)}</span>
          </div>
          <div className="flex justify-between text-amber-600">
            <span>Recargo ({formatoPorcentaje(item.porcentaje_recargo)}):</span>
            <span>+ {formatoMoneda(item.recargo)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t-2 border-gray-800 pt-2 text-indigo-600">
            <span>Total:</span>
            <span>{formatoMoneda(item.total)}</span>
          </div>
        </div>

        <div className="flex justify-around pt-2">
          <button
            onClick={onEdit}
            className="bg-blue-500 text-white px-4 cursor-pointer py-2 rounded hover:bg-blue-700 transition-colors font-medium"
          >
            Editar
          </button>
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-800 cursor-pointer px-4 py-2 rounded hover:bg-gray-300 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
