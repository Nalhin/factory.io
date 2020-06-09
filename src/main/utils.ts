import merge from 'merge-deep';

export function isObject(variable: any) {
  return Object.prototype.toString.call(variable) === '[object Object]';
}

export function mergeDeep<T>(target: Partial<T>, merging: Partial<T>): void {
  merge(target, merging);
}

export function isFunc(tested: any): boolean {
  return typeof tested === 'function';
}
