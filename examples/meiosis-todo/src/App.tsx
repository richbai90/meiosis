import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import state$, { actions } from "./meiosis";
import { map, distinctUntilChanged } from "rxjs/operators";

type Todos = Array<Todo>;
interface Todo {
  title: string;
  status: string;
}

const genList = (todos: Array<{ title: string; status: string }>) => {
  return todos.map(({ status, title }, i) => (
    <li>
      <span>
        {title} : {status}
      </span>
      <button onClick={() => actions.removeTodo(i)}>Remove Todo</button>
    </li>
  ));
};

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todos>([]);
  const [newTodo, setNewTodo] = useState<Todo>({
    title: "",
    status: "PENDING"
  });
  useEffect(() => {
    state$
      .pipe(
        map(state => {
          return state.get("todos")
        }),
        distinctUntilChanged(),
        map(state => state.toJS())
      )
      .subscribe(state => {
        setTodos(state)
      });
  }, []);

  useEffect(() => {
    state$
      .pipe(
        map(state => state.get("todo")),
        distinctUntilChanged(),
        map(state => state.toJS())
      )
      .subscribe(state => {
        console.log({line: 55, state});
        setNewTodo(state)
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        {genList(todos)}
        <div className="formGroup">
          <input
            type="text"
            value={newTodo.title}
            onChange={evt => actions.typeNewTodoTitle(evt.target.value)}
          />
          <button
            onClick = {() => {
              actions.addTodo();
              actions.resetTodo();
            }}
          >
            Add TODO
          </button>
          <button
            onClick={actions.$undo}
            >UNDO</button>
          <button
            onClick={actions.$redo}
            >REDO</button>
        </div>
      </header>
    </div>
  );
};

export default App;
