import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import counterReducer from './features/counter/counterSlice';
export default function createRootReducer(history) {
    return combineReducers({
        router: connectRouter(history),
        counter: counterReducer,
    });
}
