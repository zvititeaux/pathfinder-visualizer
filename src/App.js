import React from 'react';
import './App.css';
import Visualizer from './Visualizer'; 

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Pathfinder Algorithm Visualizer</h1>
      </header>
      <Visualizer /> {/*Use the Visualizer component */}
      <footer>
        {/* You can add a footer or any other components if you want*/}
      </footer>
    </div>
  );
}

export default App;
