import { Computed, Properties } from '../types/types';
import { Class } from '../types/helpers';
import { BuilderOptions } from './builder.options';

export class Builder<T> {
  private idCounter = this._options.defaultIdValue;

  constructor(
    private _options: BuilderOptions<T, any>,
    private _properties: Properties<T, keyof T>,
    private _computed: Computed<T, keyof T>,
    private _mixin: Builder<Partial<T>>[],
    private _entity?: Class<T>,
  ) {}

  private prepareEntity(): T {
    const entity = new this._entity();

    if (this._options.removeUnassigned) {
      Object.keys(entity).forEach((key) => {
        if (entity[key] === undefined) {
          delete entity[key];
        }
      });
    }
    return entity;
  }

  private build(partial?: Partial<T>): T {
    const entity = this._entity ? this.prepareEntity() : ({} as T);

    for (const mixin of this._mixin) {
      Object.assign(entity, mixin.build());
    }

    const { idField, idTransformer } = this._options;
    if (idField) {
      entity[idField] = idTransformer
        ? idTransformer(this.idCounter)
        : this.idCounter;
      this.idCounter++;
    }

    for (const key of Object.keys(this._properties)) {
      if (typeof this._properties[key] === 'function') {
        entity[key] = this._properties[key]();
      } else {
        entity[key] = this._properties[key];
      }
    }

    for (const key of Object.keys(this._computed)) {
      entity[key] = this._computed[key](entity);
    }

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
    this.idCounter = 1;
  }
}
