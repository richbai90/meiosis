import createStore from 'meiosis';
import progress from './models/progress';

export const {
    state,
    services
} = createStore(progress);