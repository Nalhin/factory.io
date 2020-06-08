import { Computed, Properties } from '../types/types';
import { Class } from '../types/helpers';
import { BuilderOptions } from './builder.options';
import isObject from './utils';

export class Builder<T> {
  private _idCounter = this._options.defaultIdValue;

  constructor(
    private _properties: Properties<T, keyof T>,
    private _computed: Computed<T, keyof T>,
    private _mixin: Builder<Partial<T>>[],
    private _options: BuilderOptions<T, keyof T>,
    private _entity?: Class<T>,
  ) {}

  private prepareEntity(): T {
    const entity = this._entity ? new this._entity() : ({} as T);

    if (this._options.removeUnassigned) {
      for (const key of Object.keys(entity)) {
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

  private setRecursiveProperties(
    entity: T,
    properties: Properties<T, keyof T>,
  ) {
    for (const key of Object.keys(properties)) {
      if (isObject(properties[key])) {
        entity[key] = {};
        this.setRecursiveProperties(entity[key], properties[key]);
      } else if (typeof properties[key] === 'function') {
        entity[key] = properties[key]();
      } else {
        entity[key] = properties[key];
      }
    }
  }

  private enrichWithMixins(entity: T): void {
    for (const mixin of this._mixin) {
      Object.assign(entity, mixin.build());
    }
  }

  private enrichWithId(entity: T): void {
    const { idField, idTransformer } = this._options;
    if (idField) {
      entity[idField] = idTransformer
        ? idTransformer(this._idCounter)
        : ((this._idCounter as unknown) as T[keyof T]);
      this._idCounter++;
    }
  }

  private enrichWithComputed(entity: T): void {
    for (const key of Object.keys(this._computed)) {
      entity[key] = this._computed[key](entity);
    }
  }

  private build(partial?: Partial<T>): T {
    const entity = this.prepareEntity();

    this.enrichWithMixins(entity);
    this.enrichWithId(entity);
    this.enrichWithProps(entity);
    this.enrichWithComputed(entity);
    Object.assign(entity, partial);

    return entity;
  }

  public buildOne(partial?: Partial<T>): T {
    return this.build(partial);
  }

  public buildMany(count: number): T[] {
    const entities = [];

    for (let i = 0; i < count; i++) {
      entities.push(this.build());
    }

    return entities;
  }

  public resetId() {
    this._idCounter = this._options.defaultIdValue;
  }
}
