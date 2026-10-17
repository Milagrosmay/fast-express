import { useState } from "react";

export default function Form() {
  const [peso, setPeso] = useState("");
  const [tipoCliente, setTipoCliente] = useState("");
  const [tipoServicio, setTipoServicio] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(peso, tipoCliente, tipoServicio);
  };

  return (
    <div className="flex flex-col items-center gap-6 min-h-screen px-4 py-6">
      <form
        className="bg-white w-full max-w-3xl p-6 rounded-md shadow-md space-y-4 "
        onSubmit={handleSubmit}
      >
        <h1 className="text-2xl font-bold text-center">Calcular cotización</h1>

        <div className="flex gap-3 flex-col md:flex-row">
          <div className="flex flex-col gap-1 flex-1">
            <label htmlFor="peso_kg" className="font-medium">
              Peso (kg)
            </label>

            <input
              id="peso_kg"
              name="peso_kg"
              type="number"
              step="0.01"
              placeholder="Ingrese el peso"
              onChange={(e) => setPeso(e.target.value)}
              value={peso}
              max={20}
              min={0}
              className="border rounded px-3 py-2 w-full"
            />
            <small className="text-gray-500">
              Máximo 20 kg, hasta 2 decimales
            </small>
          </div>

          <div className="flex flex-col gap-1 flex-1">
            <label htmlFor="tipo_cliente" className="font-medium">
              Tipo de Cliente:
            </label>
            <select
              id="tipo_cliente"
              name="tipo_cliente"
              value={tipoCliente}
              onChange={(e) => setTipoCliente(e.target.value)}
              className="border rounded px-3 py-2 w-full"
            >
              <option value="">Seleccione una opción</option>
              <option value="NUEVO">Nuevo</option>
              <option value="FRECUENTE">Frecuente</option>
              <option value="VIP">VIP</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 flex-1">
            <label htmlFor="tipo_servicio" className="font-medium">
              Tipo de Servicio:
            </label>
            <select
              id="tipo_servicio"
              name="tipo_servicio"
              value={tipoServicio}
              onChange={(e) => setTipoServicio(e.target.value)}
              className="border rounded px-3 py-2 w-full"
            >
              <option value="">Seleccione una opción</option>
              <option value="ESTANDAR">Estándar</option>
              <option value="EXPRESS">Express</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 flex-col md:flex-row">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
          >
            Calcular
          </button>
          <button
            type="button"
            className="flex-1 border border-blue-600 text-blue-600 rounded px-4 py-2 hover:bg-blue-50"
          >
            Guardar Cotización
          </button>
        </div>
      </form>

      <Preview
        result={{
          costo_base: "5.00",
          tarifa_por_kg: "4.00",
          costo_peso: "40.00",
          subtotal: "45.00",
          porcentaje_descuento: "0.10",
          descuento: "4.50",
          porcentaje_recargo: "0.25",
          recargo: "11.25",
          total: "51.75",
        }}
      />
    </div>
  );
}

const formatoMoneda = (valor) =>
  Number(valor).toLocaleString("es-CO", {
    style: "currency",
    currency: "USD", // cámbialo a "COP" si corresponde
  });

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
