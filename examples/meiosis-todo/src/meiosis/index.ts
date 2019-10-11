import createStoreFromModels from "meiosis"
import todo from "./todo";

const model = createStoreFromModels(todo);
export const {actions, history} = model;
export default model.state;
