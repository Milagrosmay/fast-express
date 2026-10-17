export const API_URL = "http://127.0.0.1:8001/api/v1"

// Función común: si la respuesta no es 2xx, lanza el error {codigo, detalle}
async function pedirDatos(ruta, opciones = {}) {
  const res = await fetch(`${API_URL}${ruta}`, {
    headers: { "Content-Type": "application/json" },
    ...opciones,
  });
  if (res.status === 204) return null; // DELETE: sin cuerpo
  const cuerpo = await res.json();
  if (!res.ok) throw cuerpo; // { codigo, detalle }
  return cuerpo;
}

export const calcularCotizacion = (datos) =>
  pedirDatos("/cotizaciones/calcular/", {
    method: "POST",
    body: JSON.stringify(datos),
  });

export const guardarCotizacion = (datos) =>
  pedirDatos("/cotizaciones/", { method: "POST", body: JSON.stringify(datos) });

// Listar con filtros: listar({ tipo_cliente: "VIP", page: 2 })
export const listarCotizaciones = (filtros = {}) =>
  pedirDatos(`/cotizaciones/?${new URLSearchParams(filtros)}`);

// Detalle por id
export const obtenerCotizacion = (id) => pedirDatos(`/cotizaciones/${id}/`);

// Editar completo (PUT) 
export const actualizarCotizacion = (id, datos) =>
  pedirDatos(`/cotizaciones/${id}/`, {
    method: "PUT",
    body: JSON.stringify(datos),
  });

  //o parcial (PATCH)
export const editarCotizacion = (id, cambios) =>
  pedirDatos(`/cotizaciones/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(cambios),
  });

// Eliminar
export const eliminarCotizacion = (id) =>
  pedirDatos(`/cotizaciones/${id}/`, { method: "DELETE" });

// Tarifas API
export const tarifasApi = () => pedirDatos("/tarifas/");
