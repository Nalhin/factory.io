export class BuilderOptions<T, K extends keyof T> {
  /**
   * Object property to which id should be assigned.
   */
  idField?: K;
  /**
   * Custom function responsible for object id generation.
   *
   *@param number  unique number
   */
  idTransformer?: (id: number) => T[K];
  /**
   * Whether undefined fields should be removed (as constructor is passed with no arguments, fields  without default values are assigned as undefined).
   */
  removeUnassigned?: boolean;
  /**
   * Initial id value, incremented by one in each time an object is build.
   */
  defaultIdValue?: number = 1;

  constructor(options?: BuilderOptions<T, K>) {
    Object.assign(this, options);
  }
}
