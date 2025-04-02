import {store} from '../redux/store';

export default function useDispatchAction(action) {
  store.dispatch(action);
}
