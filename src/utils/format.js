export const formatoMoneda = (valor) => `$${Number(valor).toFixed(2)}`;

export const formatoPorcentaje = (valor) =>
  `${(Number(valor) * 100).toFixed(0)}%`;

export const formatoFechaLocal = (iso) => {
  if (!iso) return "—";
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return "—";
  return fecha.toLocaleDateString(undefined, { dateStyle: "short" });
};
