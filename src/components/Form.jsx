import { useState } from "react";
import { calcularCotizacion, guardarCotizacion } from "../api/services";

export default function Form() {
  const [peso, setPeso] = useState("");
  const [tipoCliente, setTipoCliente] = useState("");
  const [tipoServicio, setTipoServicio] = useState("");

  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState(null);
  const [erroresCampos, setErroresCampos] = useState({});
  const [mensaje, setMensaje] = useState(null);

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

  const manejarErrorBackend = (err, mensajeFallback) => {
    setResultado(null);

    // 1. Si 'detalle' es un objeto (ej: DATOS_INVALIDOS => { peso_kg: ["..."] })
    if (typeof err?.detalle === "object" && err?.detalle !== null) {
      setErroresCampos(err.detalle);
    }
    // 2. Si 'detalle' es texto (ej: PESO_INVALIDO, LIMITE_EXCEDIDO, NOT_FOUND)
    else if (typeof err?.detalle === "string") {
      setErrorGeneral(err.detalle);
    }
    // 3. Fallback en caso de error insospechado
    else {
      setErrorGeneral(mensajeFallback);
    }
  };

  // Calcular (vista previa, no guarda en BD)
  const handleSubmit = async (e) => {
    e.preventDefault();
    limpiarMensajes();
    setCargando(true);
    try {
      const data = await calcularCotizacion(construirDatos());
      setResultado(data);
    } catch (err) {
      manejarErrorBackend(err, "No se pudo calcular la cotización");
    } finally {
      setCargando(false);
    }
  };

  // Guardar cotización en BD
  const handleGuardar = async () => {
    limpiarMensajes();
    setCargando(true);
    try {
      const data = await guardarCotizacion(construirDatos());
      setResultado(data);
      setMensaje(`Cotización #${data.id} guardada correctamente`);
    } catch (err) {
      manejarErrorBackend(err, "No se pudo guardar la cotización");
    } finally {
      setCargando(false);
    }
  };

  const formularioCompleto = peso !== "" && tipoCliente && tipoServicio;

  return (
    <div className="flex flex-col items-center gap-6 min-h-screen px-4 py-6">
      <form 
        noValidate
        className="bg-white w-full max-w-3xl p-6 rounded-md shadow-md space-y-4"
        onSubmit={handleSubmit}
      >
        <h1 className="text-2xl font-bold text-center">Calcular cotización</h1>

        <div className="flex gap-3 flex-col md:flex-row">
          {/* Campo Peso */}
          <div className="flex flex-col gap-1 flex-1">
            <label htmlFor="peso_kg" className="font-medium">
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
              required
              className={`border rounded px-3 py-2 w-full ${
                erroresCampos.peso_kg ? "border-red-500" : "border-gray-300"
              }`}
            />
            <small className="text-gray-500">
              Mínimo 0.01 kg, máximo 20 kg (hasta 2 decimales)
            </small>
            <ErrorCampo error={erroresCampos.peso_kg} />
          </div>

          {/* Campo Tipo de Cliente */}
          <div className="flex flex-col gap-1 flex-1">
            <label htmlFor="tipo_cliente" className="font-medium">
              Tipo de Cliente:
            </label>
            <select
              id="tipo_cliente"
              name="tipo_cliente"
              value={tipoCliente}
              onChange={(e) => setTipoCliente(e.target.value)}
              required
              className={`border rounded px-3 py-2 w-full ${
                erroresCampos.tipo_cliente ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Seleccione una opción</option>
              <option value="NUEVO">Nuevo</option>
              <option value="FRECUENTE">Frecuente</option>
              <option value="VIP">VIP</option>
            </select>
            <ErrorCampo error={erroresCampos.tipo_cliente} />
          </div>

          {/* Campo Tipo de Servicio (tipo_envio) */}
          <div className="flex flex-col gap-1 flex-1">
            <label htmlFor="tipo_servicio" className="font-medium">
              Tipo de Servicio:
            </label>
            <select
              id="tipo_servicio"
              name="tipo_servicio"
              value={tipoServicio}
              onChange={(e) => setTipoServicio(e.target.value)}
              required
              className={`border rounded px-3 py-2 w-full ${
                erroresCampos.tipo_envio || erroresCampos.tipo_servicio
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            >
              <option value="">Seleccione una opción</option>
              <option value="ESTANDAR">Estándar</option>
              <option value="EXPRESS">Express</option>
            </select>
            <ErrorCampo error={erroresCampos.tipo_envio || erroresCampos.tipo_servicio} />
          </div>
        </div>

        {/* Error general (cuando detalle llega como string) */}
        {errorGeneral && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 font-medium">
            {errorGeneral}
          </p>
        )}

        {/* Mensaje de éxito */}
        {mensaje && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2 font-medium">
            {mensaje}
          </p>
        )}

        {/* Acciones */}
        <div className="flex gap-3 flex-col md:flex-row pt-2">
          <button
            type="submit"
            disabled={cargando}
            className="flex-1 bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {cargando ? "Procesando..." : "Calcular"}
          </button>
          <button
            type="button"
            onClick={handleGuardar}
            disabled={cargando || !formularioCompleto}
            className="flex-1 border border-blue-600 text-blue-600 rounded px-4 py-2 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            Guardar Cotización
          </button>
        </div>
      </form>

      {/* Componente de Resumen */}
      <Preview result={resultado} />
    </div>
  );
}

// Subcomponente auxiliar para renderizar mensajes de error por campo
function ErrorCampo({ error }) {
  if (!error) return null;
  const mensajeText = Array.isArray(error) ? error.join(", ") : error;
  return <span className="text-xs text-red-600 font-medium">{mensajeText}</span>;
}

// Formateadores según especificaciones (uso de Number(valor).toFixed(2))
const formatoMoneda = (valor) => `$${Number(valor).toFixed(2)}`;
const formatoPorcentaje = (valor) => `${(Number(valor) * 100).toFixed(0)}%`;

function Fila({ label, detalle, valor, className = "" }) {
  return (
    <div className={`flex items-baseline justify-between py-2 ${className}`}>
      <div>
        <span>{label}</span>
        {detalle && (
          <span className="block text-xs text-gray-400">{detalle}</span>
        )}
      </div>
      <span className="font-medium tabular-nums">{valor}</span>
    </div>
  );
}

function Preview({ result }) {
  if (!result?.total) return null;

  return (
    <div className="bg-white w-full max-w-3xl p-6 rounded-md shadow-md space-y-4">
      <h2 className="text-xl font-bold border-b border-gray-200 pb-3">
        Resumen de cotización
      </h2>

      <div className="divide-y divide-gray-100 text-gray-700">
        <Fila label="Costo base" valor={formatoMoneda(result.costo_base)} />
        <Fila
          label="Costo por peso"
          detalle={`Tarifa: ${formatoMoneda(result.tarifa_por_kg)} / kg`}
          valor={formatoMoneda(result.costo_peso)}
        />
        <Fila
          label="Subtotal"
          valor={formatoMoneda(result.subtotal)}
          className="font-semibold text-gray-900"
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
      </div>

      <div className="flex items-center justify-between border-t-2 border-gray-900 pt-4">
        <span className="text-lg font-bold">Total</span>
        <span className="text-2xl font-bold text-indigo-600 tabular-nums">
          {formatoMoneda(result.total)}
        </span>
      </div>
    </div>
  );
}