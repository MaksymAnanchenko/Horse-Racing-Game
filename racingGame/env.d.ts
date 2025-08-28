/// <reference types="vite/client" />

// Minimal shim for Vuex type resolution in TS if package exports confuse the resolver
declare module "vuex" {
  export const createStore: any;
  export const useStore: any;
  export type Store<T> = any;
  export type ActionContext<S, R> = any;
}
