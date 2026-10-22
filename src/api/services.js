export const API_URL = "http://127.0.0.1:8001/api/v1"

// Función común: si la respuesta no es 2xx, lanza el error {codigo, detalle}
async function pedirDatos(ruta, opciones = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}${ruta}`, {
      headers: { "Content-Type": "application/json" },
      ...opciones,
    });
  } catch {
    throw {
      codigo: "RED_NO_DISPONIBLE",
      detalle:
        "No se pudo conectar con el servidor. Verifica que el backend esté activo.",
    };
  }

  if (res.status === 204) return null;

  let cuerpo;
  try {
    cuerpo = await res.json();
  } catch {
    throw {
      codigo: "RESPUESTA_INVALIDA",
      detalle: "El servidor respondió con un formato inesperado.",
    };
  }

  if (!res.ok) throw cuerpo;
  return cuerpo;
}

export const calcularCotizacion = (datos) =>
  pedirDatos("/cotizaciones/calcular/", {
    method: "POST",
    body: JSON.stringify(datos),
  });

export const guardarCotizacion = (datos) =>
  pedirDatos("/cotizaciones/", { method: "POST", body: JSON.stringify(datos) });

function paramsCotizaciones(filtros = {}) {
  const params = new URLSearchParams();
  for (const [clave, valor] of Object.entries(filtros)) {
    if (valor !== undefined && valor !== null && valor !== "") {
      params.set(clave, String(valor));
    }
  }
  return params;
}

// Listar con filtros: listar({ tipo_cliente: "VIP", page: "1", page_size: "10" })
export const listarCotizaciones = (filtros = {}) =>
  pedirDatos(`/cotizaciones/?${paramsCotizaciones(filtros)}`);

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
