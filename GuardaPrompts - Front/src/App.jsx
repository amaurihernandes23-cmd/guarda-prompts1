import { useState } from 'react';
import FormularioDatos from './components/FormularioDatos';
import './App.css';

function App() {
  const [paso, setPaso] = useState(1);

  const [caja, setcaja] = useState({
    datos: [],
  });

  return (
    <>
      <div className="contenedor">
        <header>
          {paso === 1 && (
            <FormularioDatos
              caja={caja}
              setcaja={setcaja}
            />
          )}
        </header>
      </div>
    </>
  );
}

export default App;