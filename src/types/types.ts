export type Property<T, K extends keyof T> =
  | (() => T[K])
  | T[K]
  | Properties<T[K]>;

export type Properties<T> = {
  [K in keyof T]?: Property<T, K>;
};

export type Comp<E, T, K extends keyof T> =
  | ((entity: E) => T[K])
  | RecComputed<E, T[K]>;

export type RecComputed<E, T> = {
  [K in keyof T]?: Comp<E, T, K>;
};

export type Computed<T> = {
  [K in keyof T]?: Comp<T, T, K>;
};
