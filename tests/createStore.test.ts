import createStore from "../src";
import TodoModel from "./models/todo";
import chai, { expect, use } from "chai";
import { Observable } from "rxjs";
import spies from "chai-spies";
import { map, distinctUntilChanged } from "rxjs/operators";

use(spies);

const { actions, services, state } = createStore(TodoModel);

describe("create a store", () => {
  it("should return an object with actions, services, and state", () => {
    expect(state).instanceOf(Observable);
    expect(Object.keys(actions)).eql([
      "addTodo",
      "typeNewTodoTitle",
      "$undo",
      "$redo"
    ]);
    expect(Object.keys(services)).eql([
      'progress',
      'test',
    ])
  });
  it("should only respond to and call actions once", () => {
    const subscripition = chai.spy();
    const addTodo = chai.spy.on(actions, "addTodo");
    const typeNewTodoTitle = chai.spy.on(actions, "typeNewTodoTitle");
    state
      .pipe(
        map(s => s.get("todo")),
        distinctUntilChanged()
      )
      .subscribe(subscripition);

    state
      .pipe(
        map(s => s.get("todos")),
        distinctUntilChanged()
      )
      .subscribe(subscripition);

    actions.addTodo("test");

    expect(subscripition).to.have.been.called.twice;

    actions.typeNewTodoTitle("test");

    expect(subscripition).to.have.been.called.exactly(3);
    expect(addTodo).to.have.been.called.once;
    expect(typeNewTodoTitle).to.have.been.called.once;
  });
});
