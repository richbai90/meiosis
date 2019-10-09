import { Stack } from "immutable";
export default class History<T> {
  private __undoStack = Stack<any>();
  private __redoStack = Stack<any>();

  get undoStack() {
    return this.__undoStack;
  }

  get redoStack() {
    return this.__redoStack;
  }

  get canUndo() {
    return !!this.__undoStack.size;
  }
  get canRedo() {
    return !!this.__redoStack.size;
  }
  undo(currentState: T) {
    const prevState = this.__undoStack.peek();
    if (prevState) {
      this.__undoStack = this.__undoStack.pop();
      this.__redoStack = this.__redoStack.push(currentState);
      return prevState;
    }
    return currentState;
  }
  redo(currentState: T) {
    const prevState = this.__redoStack.peek();
    if (prevState) {
      this.__redoStack = this.__redoStack.pop();
      this.__undoStack = this.__undoStack.push(currentState);
      return prevState;
    }
    return currentState;
  }
  addHistory(state: T) {
    this.__undoStack = this.__undoStack.push(state);
  }
}
