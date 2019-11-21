import createStore from "../src";
import TodoModel from "./models/todo";
import chai, { expect, use } from "chai";
import { Observable } from "rxjs";
import spies from "chai-spies";
import { map, distinctUntilChanged, tap, last, pluck } from "rxjs/operators";

use(spies);

const { actions, state } = createStore(TodoModel);

describe("create a store", () => {
  it("should return an object with actions, and state", () => {
    expect(state).instanceOf(Observable);
    expect(Object.keys(actions)).eql([
      "addTodo",
      "typeNewTodoTitle",
      "$undo",
      "$redo"
    ]);
  });
  it("should only respond to and call actions once", () => {
    const subscripition = chai.spy();
    const addTodo = chai.spy.on(actions, "addTodo");
    const typeNewTodoTitle = chai.spy.on(actions, "typeNewTodoTitle");
    state
      .pipe(
        pluck("todo"),
        distinctUntilChanged()
      )
      .subscribe(subscripition);

      
      actions.addTodo("test");
      actions.typeNewTodoTitle("test");
      
      state
        .pipe(
          pluck("todos"),
          distinctUntilChanged()
        )
        .subscribe(subscripition);
      
    expect(subscripition).to.have.been.called.exactly(3);
    expect(addTodo).to.have.been.called.once;
    expect(typeNewTodoTitle).to.have.been.called.once;
  });
});
