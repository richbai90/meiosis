import { ModelOf, ActionsSignature } from 'meiosis/dist/types'
interface DebounceShape {
    count: number,
}
interface DebounceActions extends ActionsSignature {
    increment: () => void;
}
export default {
    initial: {
        count: 0
    },
    actions: update => ({
        increment: () => {
            update(state => state.set("count", state.get("count") + 1))
        }
    }),
} as ModelOf<DebounceShape, DebounceActions>