import { useState } from "react";
import Header from "./components/Header";
import List from "./components/List";
import Form from "./components/Form";

function App() {
  const [vista, setVista] = useState(1);

  return (
    <div className="bg-indigo-50 min-h-dvh w-full">
      <Header setVista={setVista} />

      {vista == 1 ? <List /> : <Form />}
    </div>
  );
}

export default App;
