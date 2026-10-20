import { useState } from "react";
import Header from "./components/Header";
import List from "./components/List";
import Form from "./components/Form";

function App() {
  const [vista, setVista] = useState(1);
  // Estado para el modal de detalle
  const [cotizacionDetalle, setCotizacionDetalle] = useState(null);

  return (
    <div className="bg-indigo-50 min-h-dvh w-full">
      <Header setCotizacionDetalle={setCotizacionDetalle} setVista={setVista} />

      {vista == 1 ? (
        <List
          setCotizacionDetalle={setCotizacionDetalle}
          cotizacionDetalle={cotizacionDetalle}
          setVista={setVista}
        />
      ) : (
        <Form
          setCotizacionDetalle={setCotizacionDetalle}
          cotizacionDetalle={cotizacionDetalle}
          setVista={setVista}
        />
      )}
    </div>
  );
}

export default App;
