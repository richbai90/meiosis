import { Record } from "immutable";
import { Subject, Observable } from "rxjs";

export type Updater<T> = (
  state: Record<T> & Readonly<T>,
  history: (s: typeof state) => void
) => typeof state;

export type UnionToIntersection<T> = (T extends any
  ? (arg: T) => void
  : never) extends (arg: infer I) => void
  ? I
  : never;

  type Parameters<T> = T extends (... args: infer T) => any ? T : never; 
  
  export type Services<T extends ServicesSignature> = {
    [P in keyof T] : ReturnType<ReturnType<T[P]>> extends void ? T[P] : () => (...args : Parameters<ReturnType<T[P]>>) => Observable<ReturnType<ReturnType<T[P]>>>
  }

export interface ActionsSignature {
  [p: string]: (...p: any) => void;
}

export interface ServicesSignature {
  [p: string]: () => (...p: any) => any;
}

export interface ModelOf<
  T,
  A extends ActionsSignature,
  S extends ServicesSignature = {}
> {
  initial: T;
  actions: (
    update$: Subject<
      (
        state: Record<T> & Readonly<T>,
        history: (s: Record<T> & Readonly<T>) => void
      ) => Record<T> & Readonly<T>
    >["next"]
  ) => A;
  services: (
    update$: Subject<
      (
        state: Record<T> & Readonly<T>,
        history: (s: Record<T> & Readonly<T>) => void
      ) => Record<T> & Readonly<T>
    >["next"]
  ) => Services<S>;
}