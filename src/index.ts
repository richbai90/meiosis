import { BehaviorSubject, Subject, merge } from "rxjs";
import { Record } from "immutable";
import {
  scan,
  share,
  switchMap,
  tap,
  mergeMap,
  mergeMapTo,
  switchMapTo,
  filter,
  concatMap
} from "rxjs/operators";
import { UnionToIntersection, ModelOf, Updater, Defined } from "./types/index";
import History from "./history";

type ValueOf<T> = T[keyof T];

type CreateActions<T extends ModelOf<any, any, any>["actions"]> = {
  [P in keyof ReturnType<T>]: ReturnType<T>[P]["patch"];
};

const createActions = <
  T extends ModelOf<any, any, any>["actions"],
  N extends Subject<any>["next"]
>(
  actions: T,
  next: N,
  effect: Subject<symbol>["next"]
) => {
  const a = actions(next);
  return Object.keys(a).reduce(
    (pv, cv) => {
      pv[cv] = (...p: any[]) => {
        effect(a[cv].type);
        a[cv].patch(...p);
      };
      return pv;
    },
    {} as { [P in keyof typeof a]: (typeof a)[P]["patch"] }
  );
};

const combineModels = <T extends ModelOf<any, any, any>[]>(...models: T) => {
  const action$ = new Subject<symbol>();
  const update$ = new BehaviorSubject<
    Updater<UnionToIntersection<T[number]["initial"]>>
  >(state => state);
  const next = update$.next.bind(update$);
  const action = action$.next.bind(action$);
  const store = models.reduce(
    (store, model) => {
      return Object.assign(store, {
        initial: { ...store.initial, ...model.initial },
        actions: {
          ...store.actions,
          ...createActions(model.actions, next, action)
        },
        services: {
          ...store.services,
          ...((model.services &&
            model.services(model.initial, {
              ...createActions(model.actions, next, action)
            })) ||
            {})
        },
        effects: {
          ...store.effects,
          ...(model.effects || {})
        }
      });
    },
    {
      initial: {} as UnionToIntersection<T[number]["initial"]>,
      actions: {} as CreateActions<T[number]["actions"]>,
      services: {} as UnionToIntersection<
        ReturnType<Defined<() => {}, T[number]["services"]>>
      >,
      effects: {} as UnionToIntersection<Defined<{}, T[number]["effects"]>>
    }
  );
  return { ...store, update$, action$: action$ };
};

export default function createStoreFromModels<
  T extends ModelOf<any, any, any>[]
>(...models: T) {
  const history = new History<any>();
  const {
    actions,
    initial,
    services,
    effects,
    update$,
    action$
  } = combineModels(...models);

  const currentState = new BehaviorSubject(Record(initial)());
  const state = update$.asObservable().pipe(
    scan((state, updater) => {
      return updater(state, s => {
        history.addHistory(s);
      });
    }, Record(initial)()),
    tap(s => currentState.next(s)),
    share()
  );

  action$
    .asObservable()
    .pipe(
      tap(actionType => {
        (Object.values(effects as any) as any[]).forEach(effect => {
          effect(actionType, currentState.getValue(), actions, services);
        });
      })
    )
    .subscribe();

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
