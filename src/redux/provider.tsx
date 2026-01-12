"use client";

import React, { useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, RootState } from "./store";

interface ReduxProviderProps {
  children: React.ReactNode;
  preloadedState?: Partial<RootState>;
}

export function ReduxProvider({ children, preloadedState }: ReduxProviderProps) {
  const storeRef = useRef(makeStore(preloadedState));

  return <Provider store={storeRef.current}>{children}</Provider>;
}