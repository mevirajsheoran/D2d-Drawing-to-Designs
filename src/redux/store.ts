import {
  configureStore,
  combineReducers,
  Reducer,
  Middleware,
} from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { slices } from "./slice";
import { apis } from "./api";

// Root reducer combining all slices
const rootReducer = combineReducers({
  ...slices,
  ...apis.reduce((acc, api) => {
    acc[api.reducerPath] = api.reducer;
    return acc;
  }, {} as Record<string, Reducer>),
});

// Root state type
export type RootState = ReturnType<typeof rootReducer>;

// Make store function
export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }).concat(...apis.map((api) => api.middleware as Middleware)),
    preloadedState,
    devTools: process.env.NODE_ENV !== "production",
  });
}

// Store instance
export const store = makeStore();

// App store type
export type AppStore = ReturnType<typeof makeStore>;

// App dispatch type
export type AppDispatch = AppStore["dispatch"];

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;