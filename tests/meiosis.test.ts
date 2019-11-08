import createStore from "../src";
import TodoModel from "./models/todo";
import chai, { expect, use } from "chai";
import { skip, take } from "rxjs/operators";
import spies from "chai-spies";
import { ModelOf } from "../src/types";

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

    actions.addTodo("testing", "started");
    actions.typeNewTodoTitle("test", "pending");
  });

  it("should always recieve the latest state", () => {
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

      state.subscribe(s => {
        expect(s.get("todo").get("title")).to.equal(
          prevState.get("todo").get("title")
        );
      });
      
      actions.typeNewTodoTitle("test");

  });

  it("Should be able to use services", async () => {
    const { services, state } = createStore(TodoModel);
    const sub = chai.spy();
    state.pipe(skip(1)).subscribe(sub);
    services.progress();
    await sleep(15000);
    expect(sub).to.have.been.called.exactly(11);
  });

  it("Should not expect services to be mandatory", () => {
    const NewModel : any = {...TodoModel};
    delete NewModel.services;
    const { state, services } = createStore(NewModel)
    expect(state).to.exist
    expect(services).to.be.empty
  })

  it("should perform side effects", async () => {
    const effect = chai.spy();
    TodoModel.effects = {};
    TodoModel.effects.log = effect
    const { actions, state } = createStore(TodoModel);
    //state.subscribe();
    actions.addTodo("meiosis");
    expect(effect).to.have.been.called.once
  });
});
