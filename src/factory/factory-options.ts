export interface FactoryConfiguration<T, K extends keyof T> {
  sequenceField?: K;
  sequenceTransformer?: (id: number) => T[K];
  removeUnassignedProperties?: boolean;
  defaultSequenceValue?: number;
}

export class FactoryOptions<T, K extends keyof T> {
  /**
   * Object property to which sequence should be assigned.
   */
  sequenceField?: K;
  /**
   * Custom function responsible for object id generation.
   */
  sequenceTransformer?: (value: number) => T[K];
  /**
   * Whether unassigned (undefined) properties should be removed (as constructor is passed with no arguments, fields  without default values are assigned as undefined).
   */
  removeUnassignedProperties: boolean;
  /**
   * Initial sequence value, incremented by one in each time an object is build.
   */
  defaultSequenceValue: number;

  constructor({
                sequenceField,
                sequenceTransformer,
                removeUnassignedProperties,
                defaultSequenceValue,
              }: FactoryConfiguration<T, K>) {
    this.sequenceField = sequenceField;
    this.removeUnassignedProperties = removeUnassignedProperties ?? false;
    this.defaultSequenceValue = defaultSequenceValue ?? 1;
    this.sequenceTransformer = sequenceTransformer;
  }
}

export const DEFAULT_OPTIONS = new FactoryOptions<any, any>({});
