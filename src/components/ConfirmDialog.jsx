import { useEffect, useRef } from "react";

export default function ConfirmDialog({
  abierto,
  titulo,
  mensaje,
  confirmarTexto = "Confirmar",
  cancelarTexto = "Cancelar",
  peligro = false,
  cargando = false,
  onConfirmar,
  onCancelar,
}) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!abierto) return;
    cancelRef.current?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") onCancelar();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [abierto, onCancelar]);

  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancelar();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
      >
        <h2 id="confirm-title" className="text-lg font-bold text-slate-900">
          {titulo}
        </h2>
        <p id="confirm-desc" className="mt-2 text-sm text-slate-600">
          {mensaje}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            disabled={cargando}
            onClick={onCancelar}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {cancelarTexto}
          </button>
          <button
            type="button"
            disabled={cargando}
            onClick={onConfirmar}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
              peligro
                ? "bg-red-600 hover:bg-red-700"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {cargando ? "Procesando…" : confirmarTexto}
          </button>
        </div>
      </div>
    </div>
  );
}
