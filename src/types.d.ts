// Global type declarations for third-party packages in older TS environments
declare global {
  interface MapIterator<T> extends IterableIterator<T> {}
}
export {};
