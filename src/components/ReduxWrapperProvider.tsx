"use client";

import { Provider } from "react-redux";
import { createStore } from "../services/redux/store";
import { ReactNode } from "react";
/**
 * Provides a fresh Redux store for the React subtree.
 * Creates a new store instance to avoid cross-request state sharing.
 */

export function ReduxProviderWrapper({ children }: { children: ReactNode }) {
  // Create a new store instance for each request
  const store = createStore();

  return <Provider store={store}>{children}</Provider>;
}
