import { BehaviorSubject } from "rxjs";
import { Record, Stack } from "immutable";
import { scan, share } from "rxjs/operators";
import { UnionToIntersection, ModelOf, Updater } from "./types/index";
import History from "./history";

const combineModels = <T extends ModelOf<any, any>[]>(...models: T) => {
  const update$ = new BehaviorSubject<
    Updater<UnionToIntersection<T[number]["initial"]>>
  >(state => state);
  const store = models.reduce(
    (store, model) =>
      Object.assign(store, {
        initial: { ...store.initial, ...model.initial },
        actions: {
          ...store.actions,
          ...model.actions(update$.next.bind(update$))
        }
      }),
    {
      initial: {} as UnionToIntersection<T[number]["initial"]>,
      actions: {} as UnionToIntersection<ReturnType<T[number]["actions"]>>
    }
  );
  return { ...store, update$ };
};

export default function createStoreFromModels<T extends ModelOf<any, any>[]>(
  ...models: T
) {
  const history = new History<any>();
  const { initial, actions, update$ } = combineModels(...models);
  const state = update$.asObservable().pipe(
    scan((state, updater) => {
      return updater(state, s => {
        history.addHistory(s);
      });
    }, Record(initial)()),
    share()
  );
  return {
    actions: {
      ...actions,
      $undo: () =>
        update$.next(state => {
          return history.undo(state);
        }),
      $redo: () =>
        update$.next(state => {
          return history.redo(state);
        })
    },
    state,
    history
  };
}
