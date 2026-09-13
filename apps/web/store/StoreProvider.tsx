"use client";

import { Provider } from "react-redux";
import { store } from "./store";
import { ToastProvider } from "../components/Toast";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ToastProvider>{children}</ToastProvider>
    </Provider>
  );
}
