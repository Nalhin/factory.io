import assignIn from 'lodash.assignin';

export function isObject(variable: unknown): boolean {
  return Object.prototype.toString.call(variable) === '[object Object]';
}

export function mergeDeep<T>(target: Partial<T>, merging: Partial<T>): void {
  assignIn(target, merging);
}

export function isFunction(tested: unknown): tested is (...args: any[]) => any {
  return typeof tested === 'function';
}
