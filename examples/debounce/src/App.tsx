import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { state, actions } from "./meiosis";
import {
  map,
  distinctUntilChanged,
  debounceTime,
  takeUntil
} from "rxjs/operators";
import { Subject } from "rxjs";

const App: React.FC = () => {
  const [count, updateCount] = useState(0);
  useEffect(() => {
    const unsubscribe = new Subject<boolean>();
    state
      .pipe(
        distinctUntilChanged(),
        map(state => state.get("count")),
        debounceTime(500),
        takeUntil(unsubscribe)
      )
      .subscribe(s => updateCount(s));

    return () => {
      unsubscribe.next(true);
    };
  }, []);
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
          I have been clicked {count} times
        </a>
        <button onClick={actions.increment}>Click Me!</button>
      </header>
    </div>
  );
};

export default App;
