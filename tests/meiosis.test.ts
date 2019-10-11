import createStore from "../src";
import TodoModel from "./models/todo";
import chai, { expect, use } from "chai";
import { skip, take } from "rxjs/operators";
import spies from "chai-spies";

use(spies);

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe("test that the state updates correctly", () => {
  it("should keep the state up to date", () => {
    const { actions, state } = createStore(TodoModel);
    state.pipe(skip(2)).subscribe(s => {
      expect(s.get("todos").size).to.eq(2);
      expect(s.get("todo").get("title")).to.eq("test");
    });

    actions.addTodo("testing");
    actions.typeNewTodoTitle("test");
  });

  it("should always recieve the latest state", async () => {
    let prevState: any;
    const { actions, state } = createStore(TodoModel);
    state
      .pipe(
        skip(1),
        take(1)
      )
      .subscribe(s => {
        prevState = s;
      });

    actions.typeNewTodoTitle("test");
    await sleep(500);

    state.subscribe(s => {
      expect(s.get("todo").get("title")).to.equal(
        prevState.get("todo").get("title")
      );
    });
  });

  it("Should only expose the inner function of service thunks", async () => {
    const { services, state } = createStore(TodoModel);
    const sub = chai.spy();
    state.pipe(skip(1)).subscribe(sub);
    services.progress();
    await sleep(15000);
    expect(sub).to.have.been.called.exactly(11);
  })

});
