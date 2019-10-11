import {ModelOf, ServicesSignature} from 'meiosis/dist/types';
import {timer, Subscription} from 'rxjs';
import {takeWhile, finalize} from 'rxjs/operators'

interface ProgressShape {
    progress: number;
}

interface ServicesShape extends ServicesSignature {
    progress: () => () => void;
}

export default {
    initial: {
        progress : 0,
    },
    actions: (_update) => ({}),
    services: (update) => ({
        progress: () => {
            let subscription : null | Subscription = null;
            const source = timer(0, 1000).pipe(
              takeWhile(val => val <= 10),
              finalize(() => (subscription = null))
            );
            return () => {
              if (subscription === null) {
                subscription = source.subscribe(v =>
                  update(state => state.set("progress", v))
                );
              }
            };
          }
    })
} as ModelOf<ProgressShape, {}, ServicesShape >