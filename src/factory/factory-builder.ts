import { Class, Computed, CtorArgs, Properties, Property } from '../types/types';
import { Factory } from './factory';
import { DEFAULT_OPTIONS, FactoryConfiguration, FactoryOptions } from './factory-options';

export class FactoryBuilder<T> {
  private _options: FactoryOptions<T, keyof T> = DEFAULT_OPTIONS;
  private _properties: Properties<T> = {};
  private _computed: Computed<T> = {};
  private _mixins: Factory<T>[] = [];
  private _ctor: CtorArgs<Class<T>> | (() => CtorArgs<Class<T>>) | undefined;

  private constructor(private entity?: Class<T>) {
  }

  public static of<E>(entity?: Class<E>): FactoryBuilder<E> {
    return new this<E>(entity);
  }

  public ctor<K extends Class<T>>(ctorArgs: ConstructorParameters<K> | (() => ConstructorParameters<K>)): FactoryBuilder<T> {
    this._ctor = ctorArgs as unknown as CtorArgs<Class<T>> | (() => CtorArgs<Class<T>>);
    return this;
  }

  public options<K extends keyof T>(options: FactoryConfiguration<T, K>): FactoryBuilder<T> {
    this._options = new FactoryOptions(options);
    return this;
  }

  public prop<K extends keyof T>(property: K, value: Property<T, K>): FactoryBuilder<T> {
    Object.assign(this._properties, { [property]: value });
    return this;
  }

  public props<K extends keyof T>(properties: Properties<T>): FactoryBuilder<T> {
    Object.assign(this._properties, properties);
    return this;
  }

  public computed<K extends keyof T>(computed: Computed<T>): FactoryBuilder<T> {
    Object.assign(this._computed, computed);
    return this;
  }

  public mixins<E extends Factory<any>>(mixins: E[]): FactoryBuilder<T> {
    this._mixins.push(...mixins);
    return this;
  }

  build(): Factory<T> {
    return new Factory<T>(
      this._properties,
      this._computed,
      this._mixins,
      this._options,
      this._ctor,
      this.entity,
    );
  }
}
