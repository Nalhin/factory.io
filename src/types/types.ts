export type Property<T, K extends keyof T> =
  | (() => T[K])
  | T[K]
  | Properties<Partial<T[K]>, keyof T[K]>;

export type Properties<T, Keys extends keyof T> = {
  [K in Keys]: Property<T, K>;
};

export type Comp<E, T, K extends keyof T> =
  | ((entity: E) => T[K])
  | RecComputed<E, Partial<T[K]>, keyof T[K]>;

export type RecComputed<E, T, Keys extends keyof T> = {
  [K in Keys]: Comp<E, T, K>;
};

export type Computed<T, Keys extends keyof T> = {
  [K in Keys]: Comp<T, T, K>;
};
