import { Computed, Properties } from '../types/types';
import { Class } from '../types/helpers';
import { BuilderOptions } from './builder.options';

export class Builder<T> {
  private idCounter = this._options.defaultIdValue;

  constructor(
    private _options: BuilderOptions<T, any>,
    private _properties: Properties<T, any>,
    private _computed: Computed<T, any>,
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
    const entity = this._entity ? this.prepareEntity() : {};

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
        entity[key] = (this._properties[key] as Function)();
      } else {
        entity[key] = this._properties[key];
      }
    }

    for (const key of Object.keys(this._computed)) {
      entity[key] = this._computed[key](entity as T);
    }

    Object.assign(entity, partial);

    return entity as T;
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

  public buildOneAsync(
    callback: (...entities: T[]) => Promise<any>,
    partial?: Partial<T>,
  ): Promise<T> {
    const entity = this.build(partial);

    return callback(entity);
  }

  public async buildManyAsync(
    callback: (...entities: T[]) => Promise<any>,
    count: number,
  ): Promise<T[]> {
    const entities = [];

    for (let i = 0; i < count; i++) {
      entities.push(this.build());
    }

    return callback(...entities);
  }

  public resetId() {
    this.idCounter = 1;
  }
}
