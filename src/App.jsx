import { useEffect, useState } from "react";
import Header from "./components/Header";
import List from "./components/List";
import Form from "./components/Form";

function App() {
  const [vista, setVista] = useState(1);
  const [cotizacionDetalle, setCotizacionDetalle] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [vista]);

  return (
    <div className="flex min-h-dvh flex-col bg-slate-100">
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg"
      >
        Saltar al contenido
      </a>
      <Header
        vista={vista}
        setCotizacionDetalle={setCotizacionDetalle}
        setVista={setVista}
      />

      <main id="contenido-principal" className="flex-1" tabIndex={-1}>
        {vista === 1 ? (
          <List
            setCotizacionDetalle={setCotizacionDetalle}
            cotizacionDetalle={cotizacionDetalle}
            setVista={setVista}
          />
        ) : (
          <Form
            setCotizacionDetalle={setCotizacionDetalle}
            cotizacionDetalle={cotizacionDetalle}
          />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-3 text-center text-xs text-slate-500">
        FastExpress · Cotizaciones de envío
      </footer>
    </div>
  );
}

export default App;
