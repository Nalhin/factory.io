import { Computed, Properties, Property } from '../types/types';
import { Class } from '../types/helpers';
import { Builder } from './builder';
import merge from 'deepmerge';
import { BuilderOptions } from './builder.options';

export class Factory<T> {
  private _options: BuilderOptions<T, any> = new BuilderOptions<T, any>();
  private _properties: Properties<T, any>[] = [];
  private _computed: Computed<T, any>[] = [];
  private _mixins: Builder<Partial<T>>[] = [];

  constructor(private entity?: Class<T>) {}

  options<K extends keyof T>(options: BuilderOptions<T, K>): Factory<T> {
    Object.assign(this._options, options);
    return this;
  }

  prop<K extends keyof T>(property: K, value: Property<T, K>): Factory<T> {
    this._properties.push({ [property]: value });
    return this;
  }

  props<K extends keyof T>(properties: Properties<T, K>): Factory<T> {
    this._properties.push(properties);
    return this;
  }

  computed<K extends keyof T>(computed: Computed<T, K>): Factory<T> {
    this._computed.push(computed);
    return this;
  }

  mixins(mixinFactory: Builder<Partial<T>>): Factory<T> {
    this._mixins.push(mixinFactory);
    return this;
  }

  done(): Builder<T> {
    return new Builder<T>(
      this._options,
      Factory.merge(this._properties),
      Factory.merge(this._computed),
      this._mixins,
      this.entity,
    );
  }

  private static merge<T>(object: T[]): T {
    return merge.all(object);
  }
}
