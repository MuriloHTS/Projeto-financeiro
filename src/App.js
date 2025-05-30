import React, { useState } from 'react';
import Part1 from './components/Part1';
import Part2 from './components/Part2';
import Part3 from './components/Part3';
import Part4 from './components/Part4';

function App() {
  const [currentPart, setCurrentPart] = useState(1);

  return (
    <div>
      {/* Navegação entre partes */}
      <nav>
        <button onClick={() => setCurrentPart(1)}>Parte 1</button>
        <button onClick={() => setCurrentPart(2)}>Parte 2</button>
        <button onClick={() => setCurrentPart(3)}>Parte 3</button>
        <button onClick={() => setCurrentPart(4)}>Parte 4</button>
      </nav>

      {/* Renderizar parte ativa */}
      {currentPart === 1 && <Part1 />}
      {currentPart === 2 && <Part2 />}
      {currentPart === 3 && <Part3 />}
      {currentPart === 4 && <Part4 />}
    </div>
  );
}

export default App;