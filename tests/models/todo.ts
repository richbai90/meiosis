import { List, Record } from "immutable";
import {ActionsSignature, ModelOf} from "../../types" 


export interface TodoActions extends ActionsSignature {
  addTodo: (title: string, status?: string) => void;
  typeNewTodoTitle: (title: string, status?: string) => void;
}

export interface TodoShape {
    todos: List<Record<{ title: string; status: string }>>;
    todo: Record<{ title: string; status: string }>;
  }
export default {
  initial: {
    todo: Record({
      title: "",
      status: "PENDING"
    })(),
    todos: List([Record({ title: "Learn Meiosis", status: "PENDING" })()])
  },
  actions(update) {
    return {
      addTodo: (title, status = "PENDING") => {
        update((state, history) => {
          const todo = Record({ title, status })();
          history(state);
          return state.set("todos", state.get("todos").push(todo));
        });
      },
      typeNewTodoTitle: (title, status = "PENDING") => {
        update(state => {
          return state.set("todo", Record({ title, status })());
        });
      },
    };
  }
} as ModelOf<TodoShape, TodoActions>;
