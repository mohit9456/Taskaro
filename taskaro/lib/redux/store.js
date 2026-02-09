import { combineReducers, configureStore } from '@reduxjs/toolkit';
import slices from './features/slices';


const rootReducer = combineReducers({
    ...slices,
})

export const store = configureStore({
    reducer: {
        reducer: rootReducer,
    },
});
