import { useState, useEffect, useCallback, useRef } from "react";
import {
  listarCotizaciones,
  obtenerCotizacion,
  eliminarCotizacion,
} from "../api/services";
import ConfirmDialog from "./ConfirmDialog";
import TableSkeleton from "./TableSkeleton";
import { formatoMoneda, formatoPorcentaje, formatoFechaLocal } from "../utils/format";
import { mensajeErrorApi } from "../utils/errors";
import {
  PAGE_SIZE_LISTA as PAGE_SIZE,
  ordenarPorId,
  paginaLocal,
} from "../utils/cotizacionesLista";

const inputFiltro =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20";
const PAGE_SIZE_ORDEN_ASC = 100;

export default function List({
  setVista,
  cotizacionDetalle,
  setCotizacionDetalle,
}) {
  // Estados para datos y paginación
  const [cotizaciones, setCotizaciones] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [next, setNext] = useState(null);
  const [previous, setPrevious] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);
  const [eliminarId, setEliminarId] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [filaActiva, setFilaActiva] = useState(null);
  const inputIdRef = useRef(null);
  const tablaRef = useRef(null);

  const cargaInicial = cargando && cotizaciones.length === 0;
  const recargando = cargando && cotizaciones.length > 0;

  // Estados de los Filtros
  const [id, setId] = useState("");
  const [peso, setPeso] = useState("");
  const [tipoCliente, setTipoCliente] = useState("");
  const [tipoServicio, setTipoServicio] = useState("");
  const [fechaCreacion, setFechaCreacion] = useState("");
  const [ordenId, setOrdenId] = useState("desc");

  const valoresFiltro = (override = {}) => ({
    id: override.id ?? id,
    peso: override.peso ?? peso,
    tipoCliente: override.tipoCliente ?? tipoCliente,
    tipoServicio: override.tipoServicio ?? tipoServicio,
    fechaCreacion: override.fechaCreacion ?? fechaCreacion,
  });

  const filtrosDesdeValores = (vals) => {
    const filtros = {};
    if (vals.id) filtros.id = vals.id;
    if (vals.peso) filtros.peso_kg = Number(vals.peso).toFixed(2);
    if (vals.tipoCliente) filtros.tipo_cliente = vals.tipoCliente;
    if (vals.tipoServicio) filtros.tipo_envio = vals.tipoServicio;
    if (vals.fechaCreacion) filtros.creado_en = vals.fechaCreacion;
    return filtros;
  };

  const quitarFiltro = (clave) => {
    const map = {
      id: { id: "" },
      peso: { peso: "" },
      cliente: { tipoCliente: "" },
      envio: { tipoServicio: "" },
      fecha: { fechaCreacion: "" },
    };
    const vals = valoresFiltro(map[clave] ?? {});
    setId(vals.id);
    setPeso(vals.peso);
    setTipoCliente(vals.tipoCliente);
    setTipoServicio(vals.tipoServicio);
    setFechaCreacion(vals.fechaCreacion);
    cargar(1, ordenId, vals);
  };

  const cargar = async (pageOverride, ordenOverride, valsOverride) => {
    const pagina = pageOverride ?? page;
    const orden = ordenOverride ?? ordenId;
    const vals = valoresFiltro(valsOverride ?? {});
    setCargando(true);
    setError(null);
    try {
      const filtrosBase = filtrosDesdeValores(vals);

      if (orden === "asc") {
        const resp = await listarCotizaciones({
          ...filtrosBase,
          page: "1",
          page_size: String(PAGE_SIZE_ORDEN_ASC),
          ordering: "id",
        });
        const total = resp.count ?? 0;
        const ordenadas = ordenarPorId(resp.results || [], "asc");
        const totalPaginas = Math.max(1, Math.ceil(total / PAGE_SIZE));
        const paginaSegura = Math.min(Math.max(1, pagina), totalPaginas);

        setCotizaciones(paginaLocal(ordenadas, paginaSegura));
        setCount(total);
        setNext(paginaSegura < totalPaginas ? "local" : null);
        setPrevious(paginaSegura > 1 ? "local" : null);
        setPage(paginaSegura);
        return;
      }

      const filtros = {
        page: String(pagina),
        page_size: String(PAGE_SIZE),
        ordering: "-id",
        ...filtrosBase,
      };
      const resp = await listarCotizaciones(filtros);

      setCotizaciones(resp.results || []);
      setCount(resp.count ?? 0);
      setNext(resp.next ?? null);
      setPrevious(resp.previous ?? null);
      setPage(pagina);
    } catch (err) {
      setError(
        mensajeErrorApi(err, "Error al cargar el listado de cotizaciones"),
      );
      setCotizaciones([]);
      setNext(null);
      setPrevious(null);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!exito) return;
    const t = window.setTimeout(() => setExito(null), 4000);
    return () => window.clearTimeout(t);
  }, [exito]);

  useEffect(() => {
    const enInput = (el) =>
      el instanceof HTMLElement &&
      (el.tagName === "INPUT" ||
        el.tagName === "TEXTAREA" ||
        el.tagName === "SELECT" ||
        el.isContentEditable);

    const onKey = (e) => {
      if (enInput(document.activeElement)) return;

      if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        inputIdRef.current?.focus();
        return;
      }

      if (e.key === "ArrowLeft" && previous && !cargando) {
        e.preventDefault();
        cargar(page - 1);
      }
      if (e.key === "ArrowRight" && next && !cargando) {
        e.preventDefault();
        cargar(page + 1);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cargando, next, previous, page]);

  const filtrosActivos = [
    id && { clave: "id", etiqueta: `ID ${id}` },
    peso && { clave: "peso", etiqueta: `Peso ${Number(peso).toFixed(2)} kg` },
    tipoCliente && { clave: "cliente", etiqueta: tipoCliente },
    tipoServicio && { clave: "envio", etiqueta: tipoServicio },
    fechaCreacion && { clave: "fecha", etiqueta: fechaCreacion },
  ].filter(Boolean);

  const handleFiltrar = (e) => {
    e.preventDefault();
    cargar(1);
  };

  const handleLimpiar = () => {
    setId("");
    setPeso("");
    setTipoCliente("");
    setTipoServicio("");
    setFechaCreacion("");
    setError(null);
    setPage(1);
    setCargando(true);
    setOrdenId("desc");
    listarCotizaciones({
      page: "1",
      page_size: String(PAGE_SIZE),
      ordering: "-id",
    })
      .then((resp) => {
        setCotizaciones(resp.results || []);
        setCount(resp.count ?? 0);
        setNext(resp.next ?? null);
        setPrevious(resp.previous ?? null);
      })
      .catch((err) => {
        setError(mensajeErrorApi(err, "Error al restablecer los filtros"));
        setCotizaciones([]);
      })
      .finally(() => setCargando(false));
  };

  const handlePaginaAnterior = () => {
    if (cargando || !previous) return;
    cargar(page - 1);
  };

  const handlePaginaSiguiente = () => {
    if (cargando || !next) return;
    cargar(page + 1);
  };

  const handleToggleOrdenId = () => {
    const nuevoOrden = ordenId === "desc" ? "asc" : "desc";
    setOrdenId(nuevoOrden);
    cargar(1, nuevoOrden);
  };

  // Ver detalle (obtiene datos actualizados del backend)
  const handleDetalle = async (item) => {
    setFilaActiva(item.id);
    setCargandoDetalle(true);
    try {
      const data = await obtenerCotizacion(item.id);
      setCotizacionDetalle(data);
    } catch (err) {
      setError(
        mensajeErrorApi(err, "No se pudo obtener el detalle de la cotización"),
      );
    } finally {
      setCargandoDetalle(false);
    }
  };

  const confirmarEliminar = async () => {
    if (!eliminarId) return;
    setEliminando(true);
    setError(null);
    try {
      await eliminarCotizacion(eliminarId);
      setEliminarId(null);
      setExito(`Cotización #${eliminarId} eliminada.`);
      if (cotizacionDetalle?.id === eliminarId) {
        setCotizacionDetalle(null);
      }
      cargar();
    } catch (err) {
      setError(mensajeErrorApi(err, "No se pudo eliminar la cotización"));
      setEliminarId(null);
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-md shadow-slate-200/50">
        <div className="border-b border-slate-100 bg-linear-to-r from-slate-50 to-indigo-50/40 px-5 py-4 sm:px-6">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Historial de cotizaciones
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Filtra por ID, peso, fecha o tipo. Usa el menú superior para crear
            una nueva cotización.
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-[minmax(280px,320px)_1fr]">
          <aside className="border-b border-slate-100 bg-slate-50/30 p-5 sm:p-6 lg:border-b-0 lg:border-r">
            <form noValidate className="space-y-4" onSubmit={handleFiltrar}>
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Filtros de búsqueda
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Los criterios se combinan entre sí.
                </p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="id" className="text-sm font-medium text-slate-700">
                  Número de orden (ID)
                </label>
                <input
                  ref={inputIdRef}
                  id="id"
                  name="id"
                  type="number"
                  min={1}
                  placeholder="Ej: 5"
                  onChange={(e) => setId(e.target.value)}
                  value={id}
                  className={inputFiltro}
                />
                <p className="text-xs text-slate-400">
                  Atajo: tecla <kbd className="kbd">/</kbd> para enfocar ID
                </p>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="peso_kg"
                  className="text-sm font-medium text-slate-700"
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
                  placeholder="Ej: 10.00"
                  onChange={(e) => setPeso(e.target.value)}
                  value={peso}
                  className={inputFiltro}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="tipo_cliente"
                  className="text-sm font-medium text-slate-700"
                >
                  Tipo de cliente
                </label>
                <select
                  id="tipo_cliente"
                  name="tipo_cliente"
                  value={tipoCliente}
                  onChange={(e) => setTipoCliente(e.target.value)}
                  className={inputFiltro}
                >
                  <option value="">Todos</option>
                  <option value="NUEVO">Nuevo</option>
                  <option value="FRECUENTE">Frecuente</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="tipo_servicio"
                  className="text-sm font-medium text-slate-700"
                >
                  Tipo de envío
                </label>
                <select
                  id="tipo_servicio"
                  name="tipo_servicio"
                  value={tipoServicio}
                  onChange={(e) => setTipoServicio(e.target.value)}
                  className={inputFiltro}
                >
                  <option value="">Todos</option>
                  <option value="ESTANDAR">Estándar</option>
                  <option value="EXPRESS">Express</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="creado_en"
                  className="text-sm font-medium text-slate-700"
                >
                  Fecha de creación
                </label>
                <input
                  id="creado_en"
                  name="creado_en"
                  type="date"
                  value={fechaCreacion}
                  onChange={(e) => setFechaCreacion(e.target.value)}
                  className={inputFiltro}
                />
              </div>

              {filtrosActivos.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {filtrosActivos.map((f) => (
                    <button
                      key={f.clave}
                      type="button"
                      onClick={() => quitarFiltro(f.clave)}
                      className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-800 hover:bg-indigo-100"
                      title="Quitar este filtro"
                    >
                      {f.etiqueta}
                      <span aria-hidden>×</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-2 border-t border-slate-200 pt-4 sm:flex-row">
                <button
                  type="submit"
                  disabled={cargando}
                  className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {cargando ? "Buscando…" : "Buscar"}
                </button>
                <button
                  type="button"
                  onClick={handleLimpiar}
                  disabled={cargando}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Limpiar
                </button>
              </div>
            </form>
          </aside>

          <section className="flex min-w-0 flex-col p-5 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-800">Resultados</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {cargando && cotizaciones.length === 0
                  ? "Cargando…"
                  : `Mostrando ${cotizaciones.length} de ${count} · Página ${page}`}
              </span>
            </div>

            <div aria-live="polite" className="mb-4 space-y-2 empty:hidden">
              {exito && (
                <div className="animacion-entrada rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-800">
                  {exito}
                </div>
              )}
              {error && (
                <div
                  role="alert"
                  className="animacion-entrada rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700"
                >
                  {error}
                </div>
              )}
            </div>

            <div
              ref={tablaRef}
              className="relative overflow-x-auto rounded-xl border border-slate-200"
            >
              {recargando && (
                <div
                  className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px]"
                  aria-busy="true"
                  aria-label="Actualizando resultados"
                >
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-md">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                    Actualizando…
                  </span>
                </div>
              )}
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">
                      <button
                        type="button"
                        onClick={handleToggleOrdenId}
                        disabled={cargando}
                        title={
                          ordenId === "desc"
                            ? "ID descendente (clic para ascendente)"
                            : "ID ascendente (clic para descendente)"
                        }
                        className="inline-flex items-center gap-1 rounded-md px-1 py-0.5 hover:bg-slate-200/70 disabled:opacity-50"
                      >
                        ID
                        <span className="text-indigo-600" aria-hidden>
                          {ordenId === "asc" ? "↑" : "↓"}
                        </span>
                      </button>
                    </th>
                    <th className="px-4 py-2.5 font-semibold">Peso</th>
                    <th className="px-4 py-2.5 font-semibold">Cliente</th>
                    <th className="px-4 py-2.5 font-semibold">Envío</th>
                    <th className="px-4 py-2.5 font-semibold">Total</th>
                    <th className="px-4 py-2.5 font-semibold">Creado</th>
                    <th className="px-4 py-2.5 text-center font-semibold">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cargaInicial ? (
                    <TableSkeleton filas={PAGE_SIZE} />
                  ) : cotizaciones.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-500">
                        No hay cotizaciones con estos filtros.
                      </td>
                    </tr>
                  ) : (
                    cotizaciones.map((c) => (
                      <tr
                        key={c.id}
                        tabIndex={0}
                        role="button"
                        aria-label={`Ver detalle de cotización ${c.id}`}
                        onClick={() => handleDetalle(c)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleDetalle(c);
                          }
                        }}
                        className={`cursor-pointer transition-colors hover:bg-indigo-50/70 focus-visible:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 ${
                          filaActiva === c.id || cotizacionDetalle?.id === c.id
                            ? "bg-indigo-50/90 ring-1 ring-inset ring-indigo-200"
                            : ""
                        }`}
                      >
                        <td className="px-4 py-2 font-medium text-slate-700">
                          #{c.id}
                        </td>
                        <td className="px-4 py-2 tabular-nums text-slate-700">
                          {Number(c.peso_kg).toFixed(2)} kg
                        </td>
                        <td className="px-4 py-2">
                          <EtiquetaTipo valor={c.tipo_cliente} />
                        </td>
                        <td className="px-4 py-2">
                          <EtiquetaEnvio valor={c.tipo_envio} />
                        </td>
                        <td className="px-4 py-2 tabular-nums font-semibold text-indigo-600">
                          {formatoMoneda(c.total)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-slate-600">
                          {formatoFechaLocal(c.creado_en)}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDetalle(c);
                              }}
                              disabled={cargandoDetalle}
                              className="rounded-lg border border-indigo-200 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"
                            >
                              Detalle
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEliminarId(c.id);
                              }}
                              className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <p className="text-sm text-slate-500">
                {count > 0
                  ? `${count} registro${count === 1 ? "" : "s"} en total`
                  : "Sin registros"}
                <span className="hidden text-slate-400 sm:inline">
                  {" "}
                  · ← → para cambiar página
                </span>
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePaginaAnterior}
                  disabled={cargando || !previous}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={handlePaginaSiguiente}
                  disabled={cargando || !next}
                  className="rounded-lg border border-indigo-600 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Modal / Componente de Detalle */}
      {cotizacionDetalle && (
        <ModalDetalle
          item={cotizacionDetalle}
          onClose={() => {
            setCotizacionDetalle(null);
            setFilaActiva(null);
          }}
          onEdit={() => setVista(2)}
        />
      )}

      <ConfirmDialog
        abierto={eliminarId !== null}
        titulo="Eliminar cotización"
        mensaje={`¿Eliminar la cotización #${eliminarId}? Esta acción no se puede deshacer.`}
        confirmarTexto="Eliminar"
        peligro
        cargando={eliminando}
        onConfirmar={confirmarEliminar}
        onCancelar={() => !eliminando && setEliminarId(null)}
      />
    </div>
  );
}

function EtiquetaTipo({ valor }) {
  const estilos = {
    NUEVO: "bg-sky-100 text-sky-800",
    FRECUENTE: "bg-violet-100 text-violet-800",
    VIP: "bg-amber-100 text-amber-900",
  };
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${estilos[valor] || "bg-slate-100 text-slate-700"}`}
    >
      {valor}
    </span>
  );
}

function EtiquetaEnvio({ valor }) {
  const express = valor === "EXPRESS";
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
        express ? "bg-orange-100 text-orange-800" : "bg-slate-100 text-slate-700"
      }`}
    >
      {valor}
    </span>
  );
}

function ModalDetalle({ item, onClose, onEdit }) {
  const cerrar = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") cerrar();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cerrar]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) cerrar();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-detalle-titulo"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl space-y-4"
      >
        <div className="flex justify-between items-center border-b pb-3">
          <h3
            id="modal-detalle-titulo"
            className="text-xl font-bold text-gray-800"
          >
            Detalle de Cotización #{item.id}
          </h3>
          <button
            type="button"
            onClick={cerrar}
            aria-label="Cerrar detalle"
            className="rounded-lg px-2 py-1 text-gray-400 hover:bg-slate-100 hover:text-gray-600"
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

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onEdit}
            className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Editar cotización
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
