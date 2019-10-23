import { BehaviorSubject } from "rxjs";
import { Record } from "immutable";
import { scan, share } from "rxjs/operators";
import { UnionToIntersection, ModelOf, Updater } from "./types/index";
import History from "./history";

const combineModels = <T extends ModelOf<any, any, any>[]>(...models: T) => {
  const update$ = new BehaviorSubject<
    Updater<UnionToIntersection<T[number]["initial"]>>
  >(state => state);
  const update = update$.next.bind(update$);
  const store = models.reduce(
    (store, model) =>
      Object.assign(store, {
        initial: { ...store.initial, ...model.initial },
        actions: {
          ...store.actions,
          ...model.actions(update)
        },
        services: {
          ...store.services,
          ...(model.services
            ? (() => {
                const services = model.services(update);
                return Object.keys(services).reduce(
                  (final, current) => {
                    final[current] = services[current]();
                    return final;
                  },
                  {} as any
                );
              })()
            : {})
        }
      }),
    {
      initial: {} as UnionToIntersection<T[number]["initial"]>,
      actions: {} as UnionToIntersection<ReturnType<T[number]["actions"]>>,
      services: {} as {
        [P in keyof UnionToIntersection<ReturnType<T[number]["services"]>>]: UnionToIntersection<ReturnType<T[number]["services"]>>[P]
      }
    }
  );
  return { ...store, update$ };
};

export default function createStoreFromModels<
  T extends ModelOf<any, any, any>[]
>(...models: T) {
  const history = new History<any>();
  const { actions, initial, services, update$ } = combineModels(...models);
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
    services,
    history
  };
}
