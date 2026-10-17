import { useState } from "react";
import { cotizaciones } from "../assets/data";

const formatoMoneda = (valor) =>
  Number(valor).toLocaleString("es-CO", {
    style: "currency",
    currency: "USD", // cámbialo a "COP" si corresponde
  });

const handleSubmit = (e) => {
  e.preventDefault();
  console.log(peso, tipoCliente, tipoServicio);
};

export default function List() {
  const [peso, setPeso] = useState("");
  const [tipoCliente, setTipoCliente] = useState("");
  const [tipoServicio, setTipoServicio] = useState("");
  const [id, setId] = useState("");

  return (
    <div className="w-full max-w-6xl mx-auto my-6 px-4 flex flex-col lg:flex-row gap-6 items-start">
      {/* Sidebar de filtros */}
      <aside className="w-full lg:w-72 lg:shrink-0 lg:sticky lg:top-6">
        <form
          className="bg-white p-5 rounded-md shadow-md space-y-5"
          onSubmit={handleSubmit}
        >
          <h3 className="text-lg font-bold border-b border-gray-200 pb-3">
            Filtrar
          </h3>

          <div className="flex flex-col gap-1">
            <label htmlFor="id" className="text-sm font-medium text-gray-700">
              Número de orden
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
              placeholder="Ingrese el peso"
              onChange={(e) => setPeso(e.target.value)}
              value={peso}
              max={20}
              min={0}
              className="border border-gray-300 rounded px-3 py-2 w-full bg-white"
            />
            <small className="text-gray-500">
              Máximo 20 kg, hasta 2 decimales
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

          <div className="flex flex-col gap-2 pt-2">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition-colors"
            >
              Filtrar
            </button>
            <button
              type="button"
              className="w-full border border-gray-400 text-gray-600 rounded px-4 py-2 hover:bg-gray-100 transition-colors"
            >
              Limpiar
            </button>
          </div>
        </form>
      </aside>

      {/* Lista */}
      <section className="flex-1 min-w-0 w-full bg-white p-6 rounded-md shadow-md">
        <h2 className="text-xl font-bold mb-4">Cotizaciones</h2>

        <div className="overflow-x-auto">
          <table className="table-auto w-full text-sm text-left">
            <thead>
              <tr className="border-b-2 border-gray-200 text-gray-600">
                <th className="py-3 px-3 text-center">Nº de orden</th>
                <th className="py-3 px-3">Peso (kg)</th>
                <th className="py-3 px-3">Tipo de cliente</th>
                <th className="py-3 px-3">Tipo de envío</th>
                <th className="py-3 px-3">Total</th>
                <th className="py-3 px-3 text-center">Detalle</th>
                <th className="py-3 px-3 text-center">Eliminar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cotizaciones.map((c) => (
                <tr key={c.id} className="hover:bg-indigo-50">
                  <td className="py-3 px-3 text-center text-gray-400">
                    {c.id}
                  </td>
                  <td className="py-3 px-3 tabular-nums">
                    {Number(c.peso_kg).toFixed(2)} kg
                  </td>
                  <td className="py-3 px-3">{c.tipo_cliente}</td>
                  <td className="py-3 px-3">{c.tipo_envio}</td>
                  <td className="py-3 px-3 tabular-nums font-bold text-indigo-600">
                    {formatoMoneda(c.total)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleDetalle(c)}
                      className="px-3 py-1 rounded border border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                      Detalle
                    </button>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleEliminar(c.id)}
                      className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
