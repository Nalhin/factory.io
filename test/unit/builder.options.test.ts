import { Factory } from '../../src';
import { User } from '../fixtures/user';

describe('factoryOptions', () => {
  describe('idField', () => {
    it('should allow to assign id field and generate id', () => {
      interface IUser {
        id: number;
        firstName: string;
      }
      const userFactory = new Factory<IUser>()
        .options({ idField: 'id' })
        .done();

      const result = userFactory.buildMany(5);

      expect(result[4].id).toBe(5);
    });
  });

  describe('idFactory', () => {
    it('should allow to declare function responsible for id generation', () => {
      const expectedId = 1;
      const userFactory = new Factory<User>()
        .options({
          idField: 'id',
          idTransformer: () => expectedId,
        })
        .done();

      const result = userFactory.buildMany(5);

      expect(result[4].id).toBe(expectedId);
    });
  });

  describe('removeUnassigned', () => {
    it('should keep unassigned properties by default', () => {
      const userFactory = new Factory(User)
        .options({
          removeUnassigned: false,
        })
        .done();

      const result = userFactory.buildOne();

      expect(Object.keys(result).length).toBe(2);
    });

    it('should remove unassigned properties', () => {
      const userFactory = new Factory(User)
        .options({
          removeUnassigned: true,
        })
        .done();

      const result = userFactory.buildOne();

      expect(Object.keys(result).length).toBe(0);
    });
  });
});
