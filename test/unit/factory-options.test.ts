import { Factory } from '../../src';
import { User } from '../fixtures/user';

describe('factoryOptions', () => {
  describe('idField', () => {
    it('should allow to assign id field and generate id', () => {
      interface IUser {
        id: number;
        firstName: string;
      }
      const userFactory = new Factory<IUser>().setOptions({ idField: 'id' });

      const result = userFactory.buildMany(5);

      expect(result[4].id).toBe(5);
    });
  });

  describe('idFactory', () => {
    it('should allow to declare function responsible for id generation', () => {
      const expectedId = 1;
      const userFactory = new Factory<User>().setOptions({
        idField: 'id',
        idTransformer: () => expectedId,
      });

      const result = userFactory.buildMany(5);

      expect(result[4].id).toBe(expectedId);
    });
  });

  describe('removeUnassigned', () => {
    it('should keep unassigned properties by default', () => {
      const userFactory = new Factory(User).setOptions({
        removeUnassigned: false,
      });

      const result = userFactory.buildOne();

      expect(Object.keys(result).length).toBe(2);
    });

    it('should remove unassigned properties', () => {
      const userFactory = new Factory(User).setOptions({
        removeUnassigned: true,
      });

      const result = userFactory.buildOne();

      expect(Object.keys(result).length).toBe(0);
    });
  });
});
