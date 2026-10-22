import { useEffect, useState } from "react";
import { API_URL } from "../api/services";

export default function ConnectionStatus() {
  const [estado, setEstado] = useState("comprobando");

  useEffect(() => {
    let activo = true;

    const comprobar = async () => {
      try {
        const res = await fetch(`${API_URL}/cotizaciones/?page_size=1`, {
          headers: { "Content-Type": "application/json" },
        });
        if (!activo) return;
        setEstado(res.ok ? "conectado" : "error");
      } catch {
        if (activo) setEstado("offline");
      }
    };

    comprobar();
    const intervalo = window.setInterval(comprobar, 30000);
    return () => {
      activo = false;
      window.clearInterval(intervalo);
    };
  }, []);

  const config = {
    comprobando: {
      color: "bg-amber-400",
      label: "Comprobando conexión con el servidor",
      pulse: true,
    },
    conectado: {
      color: "bg-emerald-500",
      label: "Servidor conectado",
      pulse: false,
    },
    offline: {
      color: "bg-red-500",
      label: "Sin conexión al servidor",
      pulse: true,
    },
    error: {
      color: "bg-amber-500",
      label: "El servidor respondió con error",
      pulse: false,
    },
  }[estado];

  return (
    <div
      className="hidden items-center gap-2 rounded-full bg-white/60 px-3 py-1.5 text-xs font-medium text-slate-700 sm:flex"
      title={config.label}
    >
      <span
        className={`h-2 w-2 rounded-full ${config.color} ${config.pulse ? "animate-pulse" : ""}`}
        aria-hidden
      />
      <span className="sr-only">{config.label}</span>
      <span aria-hidden>
        {estado === "conectado" ? "En línea" : estado === "offline" ? "Offline" : "…"}
      </span>
    </div>
  );
}
