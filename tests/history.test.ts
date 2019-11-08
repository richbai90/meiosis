import createStore from "../src";
import TodoModel from "./models/todo";
import { expect } from "chai";
import { skip, take } from "rxjs/operators";

describe("Test the history functions of meiosis", () => {
  it("should be able to undo actions", () => {
    let prevState: any;
    const { actions, state } = createStore(TodoModel);
    state.pipe(take(1)).subscribe(s => {
      prevState = s;
    });

    state.pipe(skip(2)).subscribe(s => {
      expect(s).to.equal(prevState);
    });

    actions.addTodo("Test!");
    actions.$undo();
  });

  it("should be able to redo actions", () => {
    let prevState: any;
    const { actions, state } = createStore(TodoModel);
    state
      .pipe(
        skip(1),
        take(1)
      )
      .subscribe(s => {
        console.log(s.toJS())
        prevState = s;
      });

    state.pipe(skip(2)).subscribe(s => {
      console.log(s.toJS())
      expect(s).to.equal(prevState);
    });

    actions.addTodo("todo");
    actions.$undo();
    actions.$redo();
  });

  it("should not undo or redo if no prevState exists", () => {
    let prevState: any;
    const { actions, state, history } = createStore(TodoModel);

    state.pipe(take(1)).subscribe(s => {
      console.log(s.toJS());
      prevState = s;
    });

    state.pipe(skip(1)).subscribe(s => {
        console.log(s.toJS())
        expect(s.toJS()).to.eql(prevState.toJS());
    })

    actions.$undo();
    actions.$redo();
  });

  it("should provide readonly copies of the history stacks", () => {
    const {history} = createStore(TodoModel);
    expect(history.canUndo).to.be.false
    expect(history.canRedo).to.be.false
    expect(history.undoStack.size).to.eq(0)
    expect(history.redoStack.size).to.eq(0)
  })
});
