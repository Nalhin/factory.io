import { FactoryBuilder } from '../../src';
import { User } from '../fixtures/user';

describe('factoryOptions', () => {
  describe('sequenceField', () => {
    it('should allow to assign id field and should generate unique ids', () => {
      const userFactory = FactoryBuilder.of<{ id: number, firstName: string }>()
        .options({ sequenceField: 'id' })
        .build();

      const result = userFactory.buildMany(5);

      expect(result[4].id).toBe(5);
    });
  });

  describe('sequenceTransformer', () => {
    it('should allow to declare function responsible for sequence generation', () => {
      const expectedId = '1';
      const userFactory = FactoryBuilder.of<User>()
        .options({
          sequenceField: 'id',
          sequenceTransformer: () => expectedId,
        })
        .build();

      const result = userFactory.buildMany(5);

      expect(result[4].id).toBe(expectedId);
    });
  });

  describe('removeUnassignedProperties', () => {
    it('should keep unassigned properties by default', () => {
      const userFactory = FactoryBuilder.of(User)
        .options({
          removeUnassignedProperties: false,
        })
        .build();

      const result = userFactory.buildOne();

      expect(Object.keys(result).length).toBe(4);
    });

    it('should remove unassigned properties', () => {
      const userFactory = FactoryBuilder.of(User)
        .options({
          removeUnassignedProperties: true,
        })
        .build();

      const result = userFactory.buildOne();

      expect(Object.keys(result).length).toBe(0);
    });
  });
});
