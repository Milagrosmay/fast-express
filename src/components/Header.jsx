import ConnectionStatus from "./ConnectionStatus";

function NavItem({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
        active
          ? "bg-slate-800 text-white shadow-sm"
          : "text-slate-700 hover:bg-white/70"
      }`}
    >
      {children}
    </button>
  );
}

export default function Header({ vista, setVista, setCotizacionDetalle }) {
  const irAListado = () => {
    setCotizacionDetalle(null);
    setVista(1);
  };

  const irAFormulario = () => {
    setCotizacionDetalle(null);
    setVista(2);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-linear-to-r from-cyan-100 to-blue-300 shadow-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={irAListado}
          className="flex items-center gap-2 text-left text-slate-800 transition hover:opacity-90"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="36px"
            viewBox="0 -960 960 960"
            width="36px"
            fill="#1e3a5f"
            aria-hidden
          >
            <path d="M188-196q-32-36-27-85H61l13-60h112q15-18 36.5-28.5T270-380q26 0 47.5 10.5T354-341h198l92-399H266l13-60h440l-39 170h125l114 152-39 197h-80q5 49-27.5 85T690-160q-50 0-82-36t-27-85H380q5 49-27.5 85T270-160q-50 0-82-36Zm446-234h215l6-33-80-107H666l-32 140Zm10-310-92 399 8-36 84-363ZM140-447v-113H60l120-192v112h80L140-447Zm130 227q21 0 35.5-15t14.5-35q0-21-14.5-35.5T270-320q-20 0-35 14.5T220-270q0 20 15 35t35 15Zm420 0q21 0 35.5-15t14.5-35q0-21-14.5-35.5T690-320q-20 0-35 14.5T640-270q0 20 15 35t35 15Z" />
          </svg>
          <div>
            <span className="block text-lg font-bold leading-tight">FastExpress</span>
            <span className="hidden text-xs font-medium text-slate-600 sm:block">
              Cotizaciones de envío
            </span>
          </div>
        </button>

        <div className="flex items-center gap-3">
        <ConnectionStatus />
        <nav
          aria-label="Secciones principales"
          className="flex items-center gap-2 rounded-xl bg-white/40 p-1"
        >
          <NavItem active={vista === 1} onClick={irAListado}>
            Historial
          </NavItem>
          <NavItem active={vista === 2} onClick={irAFormulario}>
            Nueva cotización
          </NavItem>
        </nav>
        </div>
      </div>
    </header>
  );
}
