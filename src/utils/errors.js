export function mensajeErrorApi(err, fallback) {
  if (
    err?.codigo === "DATOS_INVALIDOS" &&
    err?.detalle &&
    typeof err.detalle === "object"
  ) {
    return Object.entries(err.detalle)
      .map(([campo, msgs]) => {
        const texto = Array.isArray(msgs) ? msgs.join(", ") : String(msgs);
        return `${campo}: ${texto}`;
      })
      .join(" · ");
  }
  if (typeof err?.detalle === "string") return err.detalle;
  if (err?.mensaje) return err.mensaje;
  return fallback;
}

export function detalleCampo(error) {
  if (!error) return undefined;
  return Array.isArray(error) ? error.join(", ") : String(error);
}
