import createStoreFromModels from "meiosis";
import model from "./model";

export const {state, actions} = createStoreFromModels(model);