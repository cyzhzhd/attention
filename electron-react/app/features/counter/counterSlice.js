import { createSlice } from '@reduxjs/toolkit';
const counterSlice = createSlice({
    name: 'counter',
    initialState: { value: 0 },
    reducers: {
        increment: (state) => {
            state.value += 1;
        },
        decrement: (state) => {
            state.value -= 1;
        },
    },
});
export const { increment, decrement } = counterSlice.actions;
export const incrementIfOdd = () => {
    return (dispatch, getState) => {
        const state = getState();
        if (state.counter.value % 2 === 0) {
            return;
        }
        dispatch(increment());
    };
};
export const incrementAsync = (delay = 1000) => (dispatch) => {
    setTimeout(() => {
        dispatch(increment());
    }, delay);
};
export default counterSlice.reducer;
export const selectCount = (state) => state.counter.value;
