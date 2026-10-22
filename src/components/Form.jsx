import { useEffect, useState } from "react";
import {
  calcularCotizacion,
  editarCotizacion,
  guardarCotizacion,
} from "../api/services";
import { formatoMoneda, formatoPorcentaje } from "../utils/format";
import { detalleCampo } from "../utils/errors";

export default function Form({ cotizacionDetalle, setCotizacionDetalle }) {
  const [cotizacionId, setCotizacionId] = useState("");
  const [peso, setPeso] = useState("");
  const [tipoCliente, setTipoCliente] = useState("");
  const [tipoServicio, setTipoServicio] = useState("");

  const [resultado, setResultado] = useState(null);
  const [cargandoCalcular, setCargandoCalcular] = useState(false);
  const [cargandoGuardar, setCargandoGuardar] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState(null);
  const [erroresCampos, setErroresCampos] = useState({});
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    if (cotizacionDetalle) {
      setPeso(cotizacionDetalle?.peso_kg ?? "");
      setTipoCliente(cotizacionDetalle?.tipo_cliente ?? "");
      setTipoServicio(cotizacionDetalle?.tipo_envio ?? "");
      setCotizacionId(cotizacionDetalle?.id ?? "");
      setResultado(cotizacionDetalle);
      setMensaje(null);
      setErrorGeneral(null);
      setErroresCampos({});
    } else {
      setPeso("");
      setTipoCliente("");
      setTipoServicio("");
      setCotizacionId("");
      setResultado(null);
      setMensaje(null);
      setErrorGeneral(null);
      setErroresCampos({});
    }
  }, [cotizacionDetalle]);

  const construirDatos = () => ({
    peso_kg: peso,
    tipo_cliente: tipoCliente,
    tipo_envio: tipoServicio,
  });

  const limpiarMensajes = () => {
    setErrorGeneral(null);
    setErroresCampos({});
    setMensaje(null);
  };

  const invalidarPreview = () => {
    setResultado(null);
    setMensaje(null);
  };

  const manejarErrorBackend = (err, mensajeFallback) => {
    setResultado(null);

    if (typeof err?.detalle === "object" && err?.detalle !== null) {
      setErroresCampos(err.detalle);
    } else if (typeof err?.detalle === "string") {
      setErrorGeneral(err.detalle);
    } else {
      setErrorGeneral(mensajeFallback);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    limpiarMensajes();
    setCargandoCalcular(true);
    try {
      const data = await calcularCotizacion(construirDatos());
      setResultado(data);
    } catch (err) {
      manejarErrorBackend(err, "No se pudo calcular la cotización");
    } finally {
      setCargandoCalcular(false);
    }
  };

  const handleGuardar = async () => {
    limpiarMensajes();
    setCargandoGuardar(true);
    try {
      let data = {};
      if (cotizacionId) {
        data = await editarCotizacion(cotizacionId, construirDatos());
      } else {
        data = await guardarCotizacion(construirDatos());
      }
      setResultado(data);
      setCotizacionId(data.id);
      setMensaje(`Cotización #${data.id} guardada correctamente.`);
    } catch (err) {
      manejarErrorBackend(err, "No se pudo guardar la cotización");
    } finally {
      setCargandoGuardar(false);
    }
  };

  const handleLimpiarFormulario = () => {
    setCotizacionDetalle(null);
  };

  const formularioCompleto = peso !== "" && tipoCliente && tipoServicio;
  const pasoResultado = Boolean(resultado?.total);
  const camposListos = [peso, tipoCliente, tipoServicio].filter(Boolean).length;
  const progresoPct = pasoResultado
    ? 100
    : Math.round((camposListos / 3) * 55);
  const inputClass = (invalid) =>
    `w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 ${
      invalid ? "border-red-400" : "border-slate-300"
    }`;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-md shadow-slate-200/50">
        <div className="border-b border-slate-100 bg-linear-to-r from-slate-50 to-indigo-50/40 px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                {cotizacionId
                  ? `Editar cotización #${cotizacionId}`
                  : "Nueva cotización"}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Completa los datos, calcula el total y guarda cuando estés
                conforme. Cambia de vista con el menú superior.
              </p>
            </div>
            {cotizacionId && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                Modo edición
              </span>
            )}
          </div>

          <ol className="mt-4 flex flex-wrap gap-2 text-xs font-medium sm:text-sm">
            <li
              className={`rounded-full px-3 py-1 transition-colors duration-300 ${
                !pasoResultado
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              1. Datos del envío
            </li>
            <li
              className={`rounded-full px-3 py-1 transition-colors duration-300 ${
                pasoResultado
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              2. Resumen y guardado
            </li>
          </ol>
          <div
            className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200"
            role="progressbar"
            aria-valuenow={progresoPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progreso del formulario"
          >
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-500 ease-out"
              style={{ width: `${progresoPct}%` }}
            />
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-2 lg:divide-x lg:divide-slate-100">
          <form
            noValidate
            className="space-y-5 p-5 sm:p-6"
            onSubmit={handleSubmit}
          >
            <h2 className="text-sm font-semibold text-slate-800">
              Datos de la cotización
            </h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <LabelCampo htmlFor="peso_kg" listo={Boolean(peso)}>
                  Peso (kg)
                </LabelCampo>
                <input
                  id="peso_kg"
                  name="peso_kg"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="20"
                  placeholder="Ej: 5.50"
                  onChange={(e) => {
                    setPeso(e.target.value);
                    invalidarPreview();
                  }}
                  value={peso}
                  required
                  aria-invalid={Boolean(erroresCampos.peso_kg)}
                  aria-describedby={
                    erroresCampos.peso_kg ? "err-peso_kg" : "ayuda-peso_kg"
                  }
                  className={inputClass(erroresCampos.peso_kg)}
                />
                <p id="ayuda-peso_kg" className="text-xs text-slate-500">
                  Entre 0.01 y 20 kg (máx. 2 decimales).
                </p>
                <ErrorCampo id="err-peso_kg" error={erroresCampos.peso_kg} />
              </div>

              <div className="space-y-1.5">
                <LabelCampo htmlFor="tipo_cliente" listo={Boolean(tipoCliente)}>
                  Tipo de cliente
                </LabelCampo>
                <select
                  id="tipo_cliente"
                  name="tipo_cliente"
                  value={tipoCliente}
                  onChange={(e) => {
                    setTipoCliente(e.target.value);
                    invalidarPreview();
                  }}
                  required
                  className={inputClass(erroresCampos.tipo_cliente)}
                >
                  <option value="">Seleccione una opción</option>
                  <option value="NUEVO">Nuevo</option>
                  <option value="FRECUENTE">Frecuente</option>
                  <option value="VIP">VIP</option>
                </select>
                <ErrorCampo error={erroresCampos.tipo_cliente} />
              </div>

              <div className="space-y-1.5">
                <LabelCampo htmlFor="tipo_servicio" listo={Boolean(tipoServicio)}>
                  Tipo de envío
                </LabelCampo>
                <select
                  id="tipo_servicio"
                  name="tipo_servicio"
                  value={tipoServicio}
                  onChange={(e) => {
                    setTipoServicio(e.target.value);
                    invalidarPreview();
                  }}
                  required
                  className={inputClass(
                    erroresCampos.tipo_envio || erroresCampos.tipo_servicio,
                  )}
                >
                  <option value="">Seleccione una opción</option>
                  <option value="ESTANDAR">Estándar</option>
                  <option value="EXPRESS">Express</option>
                </select>
                <ErrorCampo
                  error={
                    erroresCampos.tipo_envio || erroresCampos.tipo_servicio
                  }
                />
              </div>
            </div>

            {errorGeneral && (
              <div
                className="animacion-entrada rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
                role="alert"
              >
                {errorGeneral}
              </div>
            )}

            {mensaje && (
              <div
                className="animacion-entrada rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-800"
                role="status"
              >
                {mensaje}
              </div>
            )}

            <div className="flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row">
              <button
                type="submit"
                disabled={
                  cargandoCalcular || cargandoGuardar || !formularioCompleto
                }
                className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cargandoCalcular ? "Calculando…" : "Calcular total"}
              </button>
              <button
                type="button"
                onClick={handleGuardar}
                disabled={
                  cargandoCalcular ||
                  cargandoGuardar ||
                  !formularioCompleto ||
                  !pasoResultado
                }
                title={
                  !pasoResultado
                    ? "Calcula el total antes de guardar"
                    : undefined
                }
                className="flex-1 rounded-lg border border-indigo-600 px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
            {cargandoGuardar
              ? "Guardando…"
              : cotizacionId
                ? "Guardar cambios"
                : "Guardar cotización"}
          </button>
            </div>

            {(cotizacionId || peso || tipoCliente || tipoServicio) && (
              <button
                type="button"
                onClick={handleLimpiarFormulario}
                className="w-full text-center text-sm font-medium text-slate-500 hover:text-slate-800"
              >
                {cotizacionId
                  ? "Cancelar edición y crear nueva"
                  : "Limpiar formulario"}
              </button>
            )}
          </form>

          <Preview result={resultado} listo={pasoResultado} />
        </div>
      </div>
    </div>
  );
}

function LabelCampo({ htmlFor, listo, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className="flex items-center gap-2 text-sm font-medium text-slate-700"
    >
      <span
        className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] transition-colors duration-300 ${
          listo
            ? "bg-emerald-500 text-white"
            : "border border-slate-300 bg-white text-transparent"
        }`}
        aria-hidden
      >
        ✓
      </span>
      {children}
    </label>
  );
}

function ErrorCampo({ id, error }) {
  const mensajeText = detalleCampo(error);
  if (!mensajeText) return null;
  return (
    <span id={id} className="text-xs font-medium text-red-600" role="alert">
      {mensajeText}
    </span>
  );
}

function Fila({ label, detalle, valor, className = "" }) {
  return (
    <div
      className={`flex items-baseline justify-between gap-4 py-2 text-sm ${className}`}
    >
      <div>
        <span>{label}</span>
        {detalle && (
          <span className="mt-0.5 block text-xs text-slate-400">{detalle}</span>
        )}
      </div>
      <span className="shrink-0 font-medium tabular-nums">{valor}</span>
    </div>
  );
}

function Preview({ result, listo }) {
  if (!listo || !result?.total) {
    return (
      <div className="flex flex-col justify-center bg-slate-50/50 p-8 text-center sm:p-10">
        <div className="mx-auto max-w-xs">
          <p className="text-sm font-semibold text-slate-700">
            Resumen de cotización
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Cuando completes peso, cliente y envío, pulsa{" "}
            <span className="font-semibold text-indigo-600">Calcular total</span>{" "}
            para ver el desglose y habilitar el guardado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animacion-entrada space-y-4 bg-slate-50/30 p-5 sm:p-6">
      <div>
        <h2 className="text-sm font-semibold text-slate-800">
          Resumen de cotización
        </h2>
        {result.id && (
          <p className="mt-0.5 text-xs text-slate-500">ID #{result.id}</p>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 divide-y divide-slate-100 text-slate-700 shadow-sm">
        <Fila label="Costo base" valor={formatoMoneda(result.costo_base)} />
        <Fila
          label="Costo por peso"
          detalle={`Tarifa ${formatoMoneda(result.tarifa_por_kg)} / kg`}
          valor={formatoMoneda(result.costo_peso)}
        />
        <Fila
          label="Subtotal"
          valor={formatoMoneda(result.subtotal)}
          className="font-semibold text-slate-900"
        />
        <Fila
          label="Descuento"
          detalle={formatoPorcentaje(result.porcentaje_descuento)}
          valor={`- ${formatoMoneda(result.descuento)}`}
          className="text-green-600"
        />
        <Fila
          label="Recargo"
          detalle={formatoPorcentaje(result.porcentaje_recargo)}
          valor={`+ ${formatoMoneda(result.recargo)}`}
          className="text-amber-600"
        />
        <div className="flex items-center justify-between pt-3">
          <span className="text-base font-bold text-slate-900">Total</span>
          <span
            key={result.total}
            className="animacion-total text-2xl font-bold tabular-nums text-indigo-600"
          >
            {formatoMoneda(result.total)}
          </span>
        </div>
      </div>
    </div>
  );
}
