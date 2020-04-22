export type Property<T, K extends keyof T> = (() => T[K]) | T[K];
export type Properties<T, Keys extends keyof T> = {
  [K in Keys]: Property<T, K>;
};
export type Computed<T, Keys extends keyof T> = {
  [K in Keys]: (entity: T) => T[K];
};
