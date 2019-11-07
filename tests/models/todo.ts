import { List, Record } from "immutable";
import { ActionsSignature, ModelOf, ServicesSignature } from "../../src/types";
import { timer, Subscription, from, Observable } from "rxjs";
import { takeWhile, finalize } from "rxjs/operators";

export interface TodoServices extends ServicesSignature {
  progress: () => void;
  test: (values: string[]) => void;
}

export interface TodoActions extends ActionsSignature {
  addTodo: (title: string, status?: string) => void;
  typeNewTodoTitle: (title: string, status?: string) => void;
}

export interface TodoShape {
  todos: List<Record<{ title: string; status: string }>>;
  todo: Record<{ title: string; status: string }>;
  progress: number;
}
export default {
  initial: {
    todo: Record({
      title: "",
      status: "PENDING"
    })(),
    todos: List([Record({ title: "Learn Meiosis", status: "PENDING" })()]),
    progress: 0
  },
  actions(update) {
    return {
      addTodo: {
        patch(title, status = "PENDING") {
          update((state, history) => {
            const todo = Record({ title, status })();
            history(state);
            return state.set("todos", state.get("todos").push(todo));
          });
        },
        type: Symbol("AddTodo")
      },
      typeNewTodoTitle: {
        patch(title, status = "PENDING") {
          update(state => {
            return state.set("todo", Record({ title, status })());
          });
        },
        type: Symbol("typeNewTodoTitle")
      }
    };
  },
  services(actions, update) {
    return {
      progress: () => {},
      test: (values: string[]) => {}
    };
  },
  effects: {
    log: (type, state, actions, services) => {
      console.log({
        type,
        state,
        actions,
        services
      })
    }
  }
} as ModelOf<TodoShape, TodoActions, TodoServices>;
