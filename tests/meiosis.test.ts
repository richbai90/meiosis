import createStore from "..";
import TodoModel from "./models/todo";
import { expect } from "chai";
import { skip, take } from "rxjs/operators";

function sleep(ms : number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

describe("test that the state updates correctly", () => {
    it("should keep the state up to date", () => {
        const { actions, state } = createStore(TodoModel);
        state.pipe(skip(2)).subscribe(s => {
            expect(s.get("todos").size).to.eq(2);
            expect(s.get("todo").get("title")).to.eq("test");
        })

        actions.addTodo("testing");
        actions.typeNewTodoTitle("test")
    })

    it("should always recieve the latest state", async () => {
        let prevState: any;
        const { actions, state } = createStore(TodoModel);
        state.pipe(skip(1), take(1)).subscribe(s => {
            prevState = s;
        })

        actions.typeNewTodoTitle("test");
        await(sleep(500))

        state.subscribe(s => {
            expect(s.get("todo").get("title")).to.equal(prevState.get("todo").get("title"))
        })
        
    })
})