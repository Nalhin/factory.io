import { Computed, Properties, Property } from '../types/types';
import { Class } from '../types/helpers';
import { Builder } from './builder';
import { BuilderOptions } from './builder.options';

export class Factory<T> {
  private _options: BuilderOptions<T, keyof T> = new BuilderOptions<
    T,
    keyof T
  >();
  private _properties: Properties<T, keyof T> = {} as Properties<T, keyof T>;
  private _computed: Computed<T, keyof T> = {} as Computed<T, keyof T>;
  private _mixins: Builder<Partial<T>>[] = [];

  constructor(private entity?: Class<T>) {}

  options<K extends keyof T>(options: BuilderOptions<T, K>): Factory<T> {
    Object.assign(this._options, options);
    return this;
  }

  prop<K extends keyof T>(property: K, value: Property<T, K>): Factory<T> {
    Object.assign(this._properties, { [property]: value });
    return this;
  }

  props<K extends keyof T>(properties: Properties<T, K>): Factory<T> {
    Object.assign(this._properties, properties);
    return this;
  }

  computed<K extends keyof T>(computed: Computed<T, K>): Factory<T> {
    Object.assign(this._computed, computed);
    return this;
  }

  mixins(mixins: Builder<Partial<T>>[]): Factory<T> {
    this._mixins.push(...mixins);
    return this;
  }

  done(): Builder<T> {
    return new Builder<T>(
      this._options,
      this._properties,
      this._computed,
      this._mixins,
      this.entity,
    );
  }
}
