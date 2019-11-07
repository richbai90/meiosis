import { Record } from "immutable";
import { Subject, Observable } from "rxjs";

export type Defined<D, T> = T extends undefined ? D & T : T;

export type Updater<T> = (
  state: Record<T> & Readonly<T>,
  history: (s: typeof state) => void
) => typeof state;

export type UnionToIntersection<T> = (T extends any
  ? (arg: T) => void
  : never) extends (arg: infer I) => void
  ? I
  : never;

export interface ActionsSignature {
  [p: string]: (...p: any) => void;
}

export interface ServicesSignature {
  [p: string]: (...p: any) => void | Updater<any>;
}

export interface ModelOf<
  T,
  A extends ActionsSignature,
  S extends ServicesSignature = {}
> {
  initial: T;
  actions: (
    update$: Subject<Updater<T>>["next"]
  ) => { [P in keyof A]: { type: symbol; patch: A[P] } };
  services?: (
    actions: A,
    update$: Subject<Updater<T>>["next"]
  ) => {
    [P in keyof S]: ReturnType<S[P]> extends Updater<any>
      ? (...P: Parameters<S[P]>) => Updater<T>
      : S[P];
  };
  effects?: {
    [p: string]: (
      actionType: symbol,
      state: T,
      actions: A,
      services: {
        [P in keyof S]: ReturnType<S[P]> extends Updater<any>
          ? (...P: Parameters<S[P]>) => Updater<T>
          : S[P];
      }
    ) => void;
  };
}
