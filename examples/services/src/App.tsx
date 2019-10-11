import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import {state, services} from './meiosis';
import { map } from 'rxjs/operators';

const App: React.FC = () => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    state.pipe(map(v => v.get("progress") * 10)).subscribe(v => setProgress(v));
  }, [])
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
       <p>Uploaded: {progress}%</p>
        <button onClick={services.progress}>Begin Upload</button>
      </header>
    </div>
  );
}

export default App;
