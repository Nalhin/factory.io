export class BuilderOptions<T, K extends keyof T> {
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
  /**
   * Initial id value, incremented by one in each step
   */
  defaultIdValue?: number = 1;

  constructor(options?: BuilderOptions<T, K>) {
    Object.assign(this, options);
  }
}
