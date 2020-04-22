export interface FactoryOptions<T, K extends keyof T> {
  /**
   * Object property where id should be assigned to
   */
  idField?: K;

  /**
   * Pass custom function responsible for object id generation.
   *
   *@param number  unique number
   */
  idTransformer?: (id: number) => number | string;

  /**
   * Whether undefined fields should be removed (as constructor is passed with no arguments, fields  without default values are assigned as undefined)
   */
  removeUnassigned?: boolean;
}

export type Property<T, K extends keyof T> = (() => T[K]) | T[K];
export type Properties<T, Keys extends keyof T> = {
  [K in Keys]: Property<T, K>;
};
export type Computed<T, Keys extends keyof T> = {
  [K in Keys]: (entity: T) => T[K];
};
