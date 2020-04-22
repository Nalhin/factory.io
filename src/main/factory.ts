import { Computed, FactoryOptions, Properties, Property } from '../types/types';
import { Class } from '../types/helpers';

export class Factory<T> {
  private options: FactoryOptions<T, any> = {};
  private properties: Properties<T, any>[] = [];
  private computed: Computed<T, any>[] = [];
  private mixins: Factory<Partial<T>>[] = [];
  private idCounter = 1;

  constructor(private entity?: Class<T>) {}

  setOptions<K extends keyof T>(options: FactoryOptions<T, K>): Factory<T> {
    this.options = options;
    return this;
  }

  addProperty<K extends keyof T>(
    property: K,
    value: Property<T, K>,
  ): Factory<T> {
    this.properties.push({ [property]: value });
    return this;
  }

  addProperties<K extends keyof T>(properties: Properties<T, K>): Factory<T> {
    this.properties.push(properties);
    return this;
  }

  addComputed<K extends keyof T>(computed: Computed<T, K>): Factory<T> {
    this.computed.push(computed);
    return this;
  }

  addMixins(mixinFactory: Factory<Partial<T>>): Factory<T> {
    this.mixins.push(mixinFactory);
    return this;
  }

  private prepareEntity(): T {
    const entity = new this.entity();

    if (this.options.removeUnassigned) {
      Object.keys(entity).forEach((key) => {
        if (entity[key] === undefined) {
          delete entity[key];
        }
      });
    }
    return entity;
  }

  private build(partial?: Partial<T>): T {
    const entity = this.entity ? this.prepareEntity() : {};

    for (const factory of this.mixins) {
      Object.assign(entity, factory.build());
    }

    const { idField, idTransformer } = this.options;
    if (idField) {
      entity[idField] = idTransformer
        ? idTransformer(this.idCounter)
        : this.idCounter;
      this.idCounter++;
    }

    for (const property of this.properties) {
      for (const key of Object.keys(property)) {
        if (typeof property[key] === 'function') {
          entity[key] = (property[key] as Function)();
        } else {
          entity[key] = property[key];
        }
      }
    }

    for (const computed of this.computed) {
      for (const key of Object.keys(computed)) {
        entity[key] = computed[key](entity as T);
      }
    }

    Object.assign(entity, partial);

    return entity as T;
  }

  buildOne(partial?: Partial<T>): T {
    return this.build(partial);
  }

  buildMany(count: number): T[] {
    const entities = [];

    for (let i = 0; i < count; i++) {
      entities.push(this.build());
    }

    return entities;
  }

  buildOneAsync(
    callback: (...entities: T[]) => Promise<any>,
    partial?: Partial<T>,
  ): Promise<T> {
    const entity = this.build(partial);

    return callback(entity);
  }

  async buildManyAsync(
    callback: (...entities: T[]) => Promise<any>,
    count: number,
  ): Promise<T[]> {
    const entities = [];

    for (let i = 0; i < count; i++) {
      entities.push(this.build());
    }

    return callback(...entities);
  }
}
