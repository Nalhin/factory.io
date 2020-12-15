export interface Class<T, A extends any[] = any[]> extends Function {
  new(...args: A): T;
}

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

export type CtorArgs<T> = T extends new (...args: infer U) => any ? U : never
