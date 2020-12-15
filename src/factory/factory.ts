import { Computed, Properties } from '../types/types';
import { Class } from '../types/helpers';
import { FactoryOptions } from './factory-options';
import { mergeDeep, isObject, isFunction } from '../utils/utils';

export class Factory<T> {
  private _idCounter = this._options.defaultSequenceValue;

  constructor(
    private _properties: Properties<T>,
    private _computed: Computed<T>,
    private _mixin: Factory<T>[],
    private _options: FactoryOptions<T, keyof T>,
    private _entity?: Class<T>,
  ) {
  }

  private prepareEntity(): T {
    const entity = this._entity ? new this._entity() : ({} as T);

    if (this._options.removeUnassignedProperties) {
      for (const key of Object.keys(entity) as Array<keyof T>) {
        if (entity[key] === undefined) {
          delete entity[key];
        }
      }
    }

    return entity;
  }

  private enrichWithProps(entity: T): void {
    this.setRecursiveProperties(entity, this._properties);
  }

  private setRecursiveProperties<E>(
    entity: E,
    properties: Properties<E>,
  ): void {
    for (const key of Object.keys(properties) as (keyof E)[]) {
      if (isObject(properties[key])) {
        if (!isObject(entity[key])) {
          entity[key] = {} as E[keyof E];
        }
        this.setRecursiveProperties(entity[key], properties[key] ?? {});
      } else if (isFunction(properties[key])) {
        entity[key] = (properties[key] as () => E[keyof E])();
      } else {
        entity[key] = properties[key] as E[keyof E];
      }
    }
  }

  private enrichWithMixins(entity: T): void {
    for (const mixin of this._mixin) {
      Object.assign(entity, mixin.build());
    }
  }

  private enrichWithId(entity: T): void {
    const { sequenceField, sequenceTransformer } = this._options;
    if (sequenceField) {
      entity[sequenceField] = sequenceTransformer?.(this._idCounter) ??
        ((this._idCounter as unknown) as T[keyof T]);
      this._idCounter++;
    }
  }

  private enrichWithComputed(entity: T): void {
    this.setRecursiveComputed(entity, entity, this._computed);
  }

  private setRecursiveComputed<E, R>(
    entity: E,
    current: R,
    computed: Computed<R>,
  ): void {
    for (const key of Object.keys(computed) as Array<keyof R>) {
      if (isObject(computed[key])) {
        if (!isObject(current[key])) {
          current[key] = {} as R[keyof R];
        }
        this.setRecursiveComputed(entity, current[key], computed[key] ?? {});
      } else if (isFunction(computed[key])) {
        current[key] = (computed[key] as unknown as ((entity: E) => R[keyof R]))(entity);
      }
    }
  }

  private build = (partial?: Partial<T>): T => {
    const entity = this.prepareEntity();

    this.enrichWithMixins(entity);
    this.enrichWithId(entity);
    this.enrichWithProps(entity);
    this.enrichWithComputed(entity);

    if (partial) {
      mergeDeep(entity, partial);
    }

    return entity;
  };

  public buildOne = (partial?: Partial<T>): T => {
    return this.build(partial);
  };

  public buildMany = (
    count: number,
    options?: { partial?: Partial<T> },
  ): T[] => {
    return [...Array(count)].map(() => this.build(options?.partial));
  };

  public resetSequence(): void {
    this._idCounter = this._options.defaultSequenceValue;
  }
}
